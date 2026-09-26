// Statický server pre QA (namiesto python http.server, ktorý pri prefetchi resetuje spojenia).
// node work/qa/serve.mjs [port] [priečinok]  → default 4190, dist/client. Rieši /cesta/ → /cesta/index.html.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.argv[2] ?? 4190);
const root = new URL('../../' + (process.argv[3] ?? 'dist/client') + '/', import.meta.url).pathname;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.json': 'application/json', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.txt': 'text/plain',
};
createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  let f = join(root, p);
  try {
    if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
  } catch {
    f = join(root, '404.html');
    res.statusCode = 404;
  }
  try {
    const body = await readFile(f);
    res.setHeader('content-type', MIME[extname(f)] ?? 'application/octet-stream');
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end('404');
  }
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}/ ← ${root}`));
