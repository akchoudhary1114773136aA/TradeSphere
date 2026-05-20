const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "build");
const port = Number(process.env.PORT || 5500);
const host = process.env.HOST || "127.0.0.1";

const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const requested = path.normalize(path.join(root, urlPath));
  const safePath = requested.startsWith(root) ? requested : root;
  const filePath = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
    ? safePath
    : path.join(root, "index.html");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Unable to serve file");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`STOCKLY live server running at http://${host}:${port}`);
});
