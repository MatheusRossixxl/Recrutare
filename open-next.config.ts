// OpenNext Cloudflare — sem R2 provisionado.
// O app não usa ISR/static prerender (todas as rotas são dynamic SSR +
// Route Handlers sob demanda), então o cache incremental usa o backend
// de static assets embutido: serve o que for pré-renderizável e ignora
// revalidação. Nenhum binding R2/KV é exigido para o deploy básico.
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
});
