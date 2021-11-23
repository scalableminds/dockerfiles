const express = require("express");
const morgan = require("morgan");
const path = require("path");
const AWS = require("aws-sdk");

const S3_BUCKET = process.env.S3_BUCKET;
const S3_BUCKET_PREFIX = process.env.S3_BUCKET_PREFIX || "";
const PORT = parseInt(process.env.PORT || "3000", 10);

const s3Client = new AWS.S3();

async function tryReadFile(filepath, res) {
  const key = path.join(S3_BUCKET_PREFIX, filepath);
  try {
    const obj = await s3Client
      .getObject({
        Bucket: S3_BUCKET,
        Key: key,
      })
      .promise();
    if (obj.ContentType === "application/x-directory") {
      return false;
    }
    if (obj.WebsiteRedirectLocation != null) {
      if (obj.WebsiteRedirectLocation.startsWith(`/${S3_BUCKET_PREFIX}`)) {
        res.redirect(
          `/${obj.WebsiteRedirectLocation.substring(
            1 + S3_BUCKET_PREFIX.length
          )}`
        );
      } else {
        res.redirect(obj.WebsiteRedirectLocation);
      }
    } else {
      if (obj.ContentType != null) {
        res.set("Content-Type", obj.ContentType);
      }
      if (obj.ContentLength != null) {
        res.set("Content-Length", obj.ContentLength);
      }
      if (obj.ContentEncoding != null) {
        res.set("Content-Encoding", obj.ContentEncoding);
      }
      if (obj.ContentDisposition != null) {
        res.set("Content-Disposition", obj.ContentDisposition);
      }
      if (obj.ETag != null) {
        res.set("ETag", obj.ETag);
      }
      if (obj.Expires != null) {
        res.set("Expires", obj.Expires);
      }
      if (obj.CacheControl != null) {
        res.set("Cache-Control", obj.CacheControl);
      }

      res.send(obj.Body);
    }

    return true;
  } catch (err) {
    if (err.code === "NoSuchKey") {
      return false;
    }
    console.error(err);
    throw err;
  }
}

const app = express();
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.end("Ok");
});
app.get("*", async (req, res) => {
  try {
    if (!req.path.endsWith("/")) {
      res.redirect(`${req.path}/`);
      return;
    }
    const justPath = decodeURI(req.path.replace(/^\//, "").replace(/\/$/, ""));
    if (await tryReadFile(justPath, res)) {
      return;
    }
    if (await tryReadFile(path.join(justPath, "index.html"), res)) {
      return;
    }
    res.status(404).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

app.listen(PORT, "0.0.0.0");
console.log("Listening on port", PORT);
