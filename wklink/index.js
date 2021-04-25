const { send, createError } = require("micro");
const fs = require("fs");
const { promisify } = require("util");

const LINK_FILE = process.env.LINK_FILE || "./links.txt";
const fsReadFile = promisify(fs.readFile);

const TAG_REGEX = /^\/([0-9]+)\/?$/;

function parseTag(url) {
  const m = url.match(TAG_REGEX);
  if (m != null) {
    return m[1];
  }
  return null;
}

function redirect(res, statusCode, location) {
  res.statusCode = statusCode;
  res.setHeader("Location", location);
  res.end();
}

module.exports = async (req, res) => {
  if (req.url === "/health") {
    return "OK";
  }

  const tag = parseTag(req.url);
  if (tag == null) {
    throw createError(400, "Invalid short URL.");
  }

  const links = (await fsReadFile(LINK_FILE, "utf-8"))
    .split("\n")
    .map(line => line.trim());
  for (const link of links) {
    if (link.startsWith(`${tag}:`)) {
      const linkUrl = new URL(link.substring(tag.length + 1));
      linkUrl.searchParams.append("utm_source", "wklink");
      redirect(res, 301, linkUrl.toString());
      return;
    }
  }

  throw createError(404, "Not found.");
};
