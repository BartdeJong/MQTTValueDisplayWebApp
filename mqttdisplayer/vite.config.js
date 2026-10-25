import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
	const base = mode === "production" ? "/WeatherProd/" : "/";

	return {
		base,
		server: {
			host: "0.0.0.0",
			port: 8085,
		},
		plugins: [
			svelte(),
			VitePWA({
				filename: "service-worker.js",
				injectRegister: false,
				registerType: "autoUpdate",
				manifest: false,
				scope: base,
				workbox: {
					clientsClaim: true,
					skipWaiting: true,
				},
			}),
		],
	};
});
