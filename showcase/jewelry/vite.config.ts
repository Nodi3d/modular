import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    // topLevelAwait(),
    svgr({ include: "**/*.svg" })
  ],
  optimizeDeps: {
    exclude: ['nodi-modular', 'manifold-3d']
  },
  resolve: {
		alias: {
			'@': '/src',
		},
	},
  base: '/',
})
