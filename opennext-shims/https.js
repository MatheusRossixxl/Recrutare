// Shim funcional mínimo de node:https para Cloudflare Workers.
// Espelha o shim de http: o Next instancia `new https.Agent()` no boot
// (setup-http-agent-env); em Workers não há sockets, então o Agent é
// um no-op. HTTPS real usa o fetch nativo do Workers.
class Agent {
  constructor(_opts) {}
  destroy() {}
}

function createServer() {
  throw new Error("https.createServer is not available in Cloudflare Workers");
}

function notSupported(name) {
  return () => {
    throw new Error(`https.${name} is not available in Cloudflare Workers`);
  };
}

const request = notSupported("request");
const get = notSupported("get");

export { Agent, createServer, request, get };
export default { Agent, createServer, request, get };
