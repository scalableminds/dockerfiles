const express = require("express");
const morgan = require("morgan");
const path = require("path");
const { S3Client, HeadObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const S3_BUCKET = process.env.S3_BUCKET;
const S3_BUCKET_PREFIX = process.env.S3_BUCKET_PREFIX || "";
const S3_REGION = process.env.S3_REGION;
const PORT = parseInt(process.env.PORT || "3000", 10);

const s3Client = new S3Client({
	region: S3_REGION,
});

async function fileExists(filepath) {
  const key = path.join(S3_BUCKET_PREFIX, filepath);
  try {
    const command = new HeadObjectCommand({
	  Bucket: S3_BUCKET,
	  Key: key,
    });
    const obj = await s3Client.send(command);
    if (obj.ContentType === "application/x-directory") {
      return false;
    }
    return true;
  } catch (err) {
    if (err.name === "NoSuchKey" || err.name === "NotFound") {
      return false;
    }
    console.error(err);
    throw err;
  }
}

async function sendFile(filepath, res) {
  const key = path.join(S3_BUCKET_PREFIX, filepath);
  try {
	const command = new GetObjectCommand({
	  Bucket: S3_BUCKET,
	  Key: key,
	})
    const obj = await s3Client.send(command);
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

      res.send(await obj.Body.transformToByteArray());
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// combined - ':remote-addr - :remote-user [:data[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
const logFormat = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ":referrer" ":user-agent"';

const app = express();
app.use(morgan(logFormat));

app.get("/health", (req, res) => {
  res.end("Ok");
});
app.use(async (req, res) => {
  try {
    const justPath = decodeURI(req.path.replace(/^\//, "").replace(/\/$/, ""));

    // Check if path directly points to a file
    if (await fileExists(justPath)) {
      if (req.path.match(/\/index\.html$/) != null) {
        // Redirect `.../index.html` to `.../`
        res.redirect(req.path.slice(0, -10));
        return;
      }
      await sendFile(justPath, res);
      return;
    }

    // Check if path points to a folder that has an `index.html`
    if (await fileExists(path.join(justPath, "index.html"))) {
      if (!req.path.endsWith("/")) {
        // Redirect `...` to `.../`, in order for links to work
        res.redirect(`${req.path}/`);
        return;
      }
      await sendFile(path.join(justPath, "index.html"), res);
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
