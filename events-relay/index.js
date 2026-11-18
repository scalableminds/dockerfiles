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
const WELL_KNOWN_URIS_FILE =
  process.env.WELL_KNOWN_URIS_FILE || "./well-known-uris.htpasswd";

assert(
  fs.existsSync(LOG_DIR) && fs.statSync(LOG_DIR).isDirectory(),
  `Log dir ${LOG_DIR} is not a directory.`
);
assert(
  fs.existsSync(WELL_KNOWN_URIS_FILE),
  `Well-known URIs file ${WELL_KNOWN_URIS_FILE} does not exist.`
);

// htpasswd file with one `<hostname>:<hashed apiKey>` per line.
// The hostname of `webknossos_uri` is used as user name, because
// htpasswd user names must not contain colons.
// Supported hashes: bcrypt ($2a$, $2b$, $2y$), {SHA} and plain text.
function parseHtpasswd(content) {
  const entries = new Map();
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const sep = line.indexOf(":");
    assert(sep > 0, `Invalid line in ${WELL_KNOWN_URIS_FILE}: "${line}"`);
    const hostname = line.slice(0, sep);
    const hash = line.slice(sep + 1);
    assert(hash !== "", `Missing apiKey hash for "${hostname}".`);
    assert(
      !hash.startsWith("$apr1$") && !/^\$[156]\$/.test(hash),
      `Unsupported hash for "${hostname}". Use bcrypt (htpasswd -B).`
    );
    entries.set(hostname, hash);
  }
  return entries;
}

function verifyApiKey(apiKey, hash) {
  if (typeof apiKey !== "string") return false;
  if (/^\$2[aby]\$/.test(hash)) {
    return bcrypt.compareSync(apiKey, hash);
  }
  if (hash.startsWith("{SHA}")) {
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

const wellKnownUris = parseHtpasswd(
  fs.readFileSync(WELL_KNOWN_URIS_FILE, "utf8")
);
console.log(`Loaded ${wellKnownUris.size} well-known URIs.`);

function wellKnownUriKey(uri) {
  try {
    return new URL(uri).hostname;
  } catch {
    return String(uri);
  }
}

// bcrypt is slow, so cache successful verifications.
const verifiedApiKeys = new Set();

function isApiKeyValid(key, apiKey) {
  const cacheKey = `${key}\n${apiKey}`;
  if (verifiedApiKeys.has(cacheKey)) return true;
  const valid = verifyApiKey(apiKey, wellKnownUris.get(key));
  if (valid) verifiedApiKeys.add(cacheKey);
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

app.get("/health", (req, res) => {
  res.end("Ok");
});
app.post("/events", async (req, res) => {
  try {
    const reqPayload = req.body;
    const webknossosUri =
      reqPayload.events[0].user_properties != null
        ? reqPayload.events[0].user_properties.webknossos_uri
        : reqPayload.events[0].userProperties.webknossosUri;
    if (
      reqPayload.events.some(
        (ev) =>
          (ev.user_properties != null
            ? ev.user_properties.webknossos_uri
            : ev.userProperties.webknossosUri) !== webknossosUri
      )
    ) {
      res
        .status(400)
        .end("All events need to have the same `webknossos_uri` property.");
      return;
    }
    const wellKnownKey = wellKnownUriKey(webknossosUri);
    if (
      wellKnownUris.has(wellKnownKey) &&
      !isApiKeyValid(wellKnownKey, reqPayload.api_key)
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
