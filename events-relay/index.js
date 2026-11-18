const express = require("express");
const morgan = require("morgan");
const fetch = require("node-fetch");
const fs = require("fs");
const { createGzip } = require("zlib");
const path = require("path");
const assert = require("assert");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const PORT = parseInt(process.env.PORT || "3000", 10);

const AMPLITUDE_TARGET =
  process.env.AMPLITUDE_TARGET || "https://api2.amplitude.com/2/httpapi";
const LOG_DIR = process.env.LOG_DIR || "./logs";
const WELL_KNOWN_URIS_FILE = process.env.WELL_KNOWN_URIS_FILE;
const DEFAULT_WELL_KNOWN_URIS_FILE = "./well-known-uris.htpasswd";

assert(
  fs.existsSync(LOG_DIR) && fs.statSync(LOG_DIR).isDirectory(),
  `Log dir ${LOG_DIR} is not a directory.`
);

const BCRYPT_HASH = /^\$2[aby]\$(0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/;
const SHA_HASH = /^\{SHA\}[A-Za-z0-9+/]{27}=$/;
const HOSTNAME = /^[a-z0-9-]+(\.[a-z0-9-]+)*$/;

function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/\.+$/, "");
}

// htpasswd file with one `<hostname>:<hashed apiKey>` per line.
// The hostname of `webknossos_uri` is used as user name, because
// htpasswd user names must not contain colons.
// Supported hashes: bcrypt ($2a$, $2b$, $2y$), {SHA} and plain text.
function parseHtpasswd(content, file) {
  const entries = new Map();
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const sep = line.indexOf(":");
    assert(sep > 0, `Invalid line in ${file}: "${line}"`);
    const hostname = normalizeHostname(line.slice(0, sep));
    const hash = line.slice(sep + 1);
    assert(
      HOSTNAME.test(hostname) && !hash.startsWith("//"),
      `Invalid user name in ${file}: "${line.slice(0, sep)}". ` +
        "Use the hostname of the URI, e.g. `webknossos.example.com`."
    );
    assert(hash !== "", `Missing apiKey hash for "${hostname}".`);
    assert(
      BCRYPT_HASH.test(hash) ||
        SHA_HASH.test(hash) ||
        !(hash.startsWith("$") || hash.startsWith("{")),
      `Unsupported or malformed hash for "${hostname}". Use bcrypt (htpasswd -B).`
    );
    assert(!entries.has(hostname), `Duplicate entry for "${hostname}".`);
    entries.set(hostname, hash);
  }
  return entries;
}

function loadWellKnownUris() {
  const file = WELL_KNOWN_URIS_FILE || DEFAULT_WELL_KNOWN_URIS_FILE;
  if (!fs.existsSync(file)) {
    // Only an explicitly configured file is required to exist.
    assert(
      WELL_KNOWN_URIS_FILE == null,
      `Well-known URIs file ${file} does not exist.`
    );
    console.warn(`No well-known URIs file at ${file}.`);
    return new Map();
  }
  return parseHtpasswd(fs.readFileSync(file, "utf8"), file);
}

async function verifyApiKey(apiKey, hash) {
  if (BCRYPT_HASH.test(hash)) {
    // bcrypt only considers the first 72 bytes.
    if (Buffer.byteLength(apiKey) > 72) return false;
    return bcrypt.compare(apiKey, hash);
  }
  if (SHA_HASH.test(hash)) {
    return safeEqual(
      crypto.createHash("sha1").update(apiKey).digest("base64"),
      hash.slice(5)
    );
  }
  return safeEqual(apiKey, hash);
}

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

const wellKnownUris = loadWellKnownUris();
console.log(`Loaded ${wellKnownUris.size} well-known URIs.`);

function wellKnownUriKey(uri) {
  for (const candidate of [uri, `http://${uri}`]) {
    try {
      return normalizeHostname(new URL(candidate).hostname);
    } catch {}
  }
  return normalizeHostname(uri);
}

// bcrypt is slow, so cache verification results (bounded, oldest evicted).
const MAX_CACHED_API_KEYS = 10000;
const apiKeyCache = new Map();

async function isApiKeyValid(key, apiKey) {
  if (typeof apiKey !== "string") return false;
  const cacheKey = `${key}\n${apiKey}`;
  if (apiKeyCache.has(cacheKey)) return apiKeyCache.get(cacheKey);
  const valid = await verifyApiKey(apiKey, wellKnownUris.get(key));
  if (apiKeyCache.size >= MAX_CACHED_API_KEYS) {
    apiKeyCache.delete(apiKeyCache.keys().next().value);
  }
  apiKeyCache.set(cacheKey, valid);
  return valid;
}

const app = express();
app.use(express.json());
app.use(morgan("combined"));

function createLogFileStream() {
  const date = new Date();
  const dateString = [
    String(date.getUTCFullYear()).padStart(2, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0"),
  ].join("-");
  const fileStream = fs.createWriteStream(
    path.join(LOG_DIR, `${dateString}.json.log.gz`),
    { flags: "a" }
  );
  const gzipStream = createGzip();
  gzipStream.pipe(fileStream);
  return {
    write(msg) {
      gzipStream.write(msg);
    },
    flush() {
      gzipStream.flush();
    },
    end(callback) {
      fileStream.once("close", callback);
      gzipStream.end();
    },
  };
}

let logFileStream = createLogFileStream();

setInterval(() => {
  logFileStream.end();
  logFileStream = createLogFileStream();
}, 1000 * 60 * 60 * 24);

setInterval(function () {
  logFileStream.flush();
}, 1000);

process.on("SIGINT", () => {
  logFileStream.end(() => {
    process.exit(128 + 2);
  });
});
process.on("SIGTERM", () => {
  logFileStream.end(() => {
    process.exit(128 + 15);
  });
});

function getWebknossosUri(event) {
  if (event == null || typeof event !== "object") return undefined;
  if (event.user_properties != null) {
    return event.user_properties.webknossos_uri;
  }
  if (event.userProperties != null) {
    return event.userProperties.webknossosUri;
  }
  return undefined;
}

app.get("/health", (req, res) => {
  res.end("Ok");
});
app.post("/events", async (req, res) => {
  try {
    const reqPayload = req.body;
    if (
      reqPayload == null ||
      !Array.isArray(reqPayload.events) ||
      reqPayload.events.length === 0
    ) {
      res.status(400).end("Expected a non-empty `events` array.");
      return;
    }
    const webknossosUris = reqPayload.events.map(getWebknossosUri);
    const webknossosUri = webknossosUris[0];
    if (typeof webknossosUri !== "string" || webknossosUri === "") {
      res.status(400).end("All events need a `webknossos_uri` property.");
      return;
    }
    if (webknossosUris.some((uri) => uri !== webknossosUri)) {
      res
        .status(400)
        .end("All events need to have the same `webknossos_uri` property.");
      return;
    }
    const wellKnownKey = wellKnownUriKey(webknossosUri);
    if (
      wellKnownUris.has(wellKnownKey) &&
      !(await isApiKeyValid(wellKnownKey, reqPayload.api_key))
    ) {
      res
        .status(401)
        .end(
          `Incorrent \`api_key\` for \`webknossos_uri\` = "${webknossosUri}".`
        );
      return;
    }

    for (const event of reqPayload.events) {
      logFileStream.write(JSON.stringify(event) + "\n");
    }
    const relayRes = await fetch(AMPLITUDE_TARGET, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({
        api_key: reqPayload.api_key,
        events: reqPayload.events,
      }),
    });
    if (!relayRes.ok) {
      res.status(relayRes.status).end(await relayRes.text());
      return;
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

app.listen(PORT, "0.0.0.0");
console.log("Listening on port", PORT);
