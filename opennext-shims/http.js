// Shim funcional mínimo de node:http para Cloudflare Workers.
// O Next instancia `new http.Agent()` no boot (setup-http-agent-env);
// em Workers não há sockets, então o Agent é um no-op. HTTP real usa
// o fetch nativo do Workers. createServer/request/get falham alto:
// nunca são chamados no Worker (só em `next start` standalone).
//
// `IncomingMessage`/`ServerResponse` precisam ser classes construtíveis
// porque o adapter OpenNext faz `class X extends http.IncomingMessage`
// no boot. Implementação mínima sobre Readable/Writable do node:stream
// (disponível no workerd via nodejs_compat).
import { Readable, Writable } from "node:stream";

class Agent {
  constructor(_opts) {}
  destroy() {}
  keepSocketAlive() {}
  reuseSocket() {}
}

class IncomingMessage extends Readable {
  constructor(_socket) {
    super();
  }
}

class ServerResponse extends Writable {
  constructor(_req) {
    super();
    this.statusCode = 200;
    this.headers = {};
  }
  setHeader(name, value) {
    this.headers[name] = value;
  }
  getHeader(name) {
    return this.headers[name];
  }
  removeHeader(name) {
    delete this.headers[name];
  }
  getHeaders() {
    return { ...this.headers };
  }
  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    if (headers) Object.assign(this.headers, headers);
  }
}

const STATUS_CODES = {};
const METHODS = [];

function createServer() {
  throw new Error("http.createServer is not available in Cloudflare Workers");
}

function notSupported(name) {
  return () => {
    throw new Error(`http.${name} is not available in Cloudflare Workers`);
  };
}

const request = notSupported("request");
const get = notSupported("get");

export { Agent, IncomingMessage, ServerResponse, STATUS_CODES, METHODS, createServer, request, get };
export default { Agent, IncomingMessage, ServerResponse, STATUS_CODES, METHODS, createServer, request, get };
