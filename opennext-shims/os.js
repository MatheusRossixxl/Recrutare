// Shim funcional mínimo de node:os para Cloudflare Workers.
// Único uso no server do Next: `_os.cpus().length` para dimensionar
// workers do otimizador de imagens (image-optimizer, squoosh). Em
// Workers não há acesso à CPU; retorna 1 núcleo fictício.
function cpus() {
  return [{ model: "cloudflare-worker", speed: 0 }];
}

const type = () => "Cloudflare";
const platform = () => "cloudflare";
const arch = () => "workerd";
const release = () => "0.0.0";
const hostname = () => "cloudflare-worker";
const tmpdir = () => "/tmp";
const EOL = "\n";

export { cpus, type, platform, arch, release, hostname, tmpdir, EOL };
export default { cpus, type, platform, arch, release, hostname, tmpdir, EOL };
