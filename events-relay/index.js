const express = require("express");
const morgan = require("morgan");
const fetch = require("fetch");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const PORT = parseInt(process.env.PORT || "3000", 10);

const config = require("./config.json");
assert(
  config.amplitudeApiKey !== "" && config.amplitudeApiKey != null,
  "Please set a `amplitudeApiKey` in the config."
);
assert(
  config.amplitudeTarget !== "" && config.amplitudeTarget != null,
  "Please set a `amplitudeTarget` in the config."
);
assert(
  fs.existsSync(config.logDir) && fs.statSync(config.logDir).isDirectory,
  `Log dir ${config.logDir} is not a directory.`
);
assert(
  config.wellKnownUris.every((u) => u.apiKey !== "" && u.uri !== ""),
  "Please set `uri` and `apiKey` for all `wellKnownUris` in the config."
);

const app = express();
app.use(express.json());
app.use(morgan("combined"));

const logFileStream = fs.createWriteStream(
  path.join(config.logDir, "log.jsonlines"),
  { mode: "a" }
);

app.get("/health", (req, res) => {
  res.end("Ok");
});
app.post("/events", async (req, res) => {
  try {
    const reqPayload = req.body;
    const webknossosUri = reqPayload.events[0].user_properties.webknossos_uri;
    if (
      reqPayload.events.some(
        (ev) => ev.user_properties.webknossos_uri !== webknossosUri
      )
    ) {
      res
        .status(400)
        .end("All events need to have the same `webknossos_uri` property.");
      return;
    }
    const matchesWellKnownUri = config.wellKnownUris.find(
      (u) => u.uri === webknossosUri
    );
    if (
      matchesWellKnownUri != null &&
      matchesWellKnownUri.apiKey !== reqPayload.api_key
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
    const relayRes = await fetch(config.amplitudeTarget, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({
        api_key: config.amplitudeApiKey,
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
