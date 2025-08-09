#!/usr/bin/env node
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '../public');
const serve = serveStatic(root);

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res));
});

const port = process.env.PORT || 5173;
server.listen(port, () => {
  console.log(`ddviz serving ${root} at http://localhost:${port}`);
});
