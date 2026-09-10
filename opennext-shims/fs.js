// Shim funcional mínimo de node:fs para Cloudflare Workers.
// Workerd não tem filesystem. O Next lê esse módulo em dois pontos:
//  1. `node-fs-methods.js` monta `nodeFs` no import: precisa de
//     `existsSync/readFile/readFileSync/writeFile/mkdir/stat` definidos.
//  2. `file-system-cache.js` (ISR em disco) — não usado aqui: o cache
//     incremental é sobrescrito pelo OpenNext (static-assets/dummy).
// Leitura/escrita falham alto com ENOENT; `existsSync` retorna false e
// `mkdir` é no-op — o comportamento correto para "arquivo não existe"
// sem derrubar o boot. `readFile` existe como função e delega para o
// ASSETS quando o path for servível; caso contrário rejeita ENOENT.
function enoent(path) {
  const err = new Error(`ENOENT: no such file or directory, open '${path}'`);
  err.code = "ENOENT";
  return err;
}

function existsSync(_path) {
  return false;
}

function readFileSync(path, _options) {
  throw enoent(path);
}

async function readFile(path, options) {
  void options;
  throw enoent(path);
}

async function writeFile(path, _data, _options) {
  throw enoent(path);
}

async function mkdir(_dir, _options) {}

async function stat(path, _options) {
  throw enoent(path);
}

const promises = { readFile, writeFile, mkdir, stat };

export { existsSync, readFileSync, readFile, writeFile, mkdir, stat, promises };
export default { existsSync, readFileSync, readFile, writeFile, mkdir, stat, promises };
