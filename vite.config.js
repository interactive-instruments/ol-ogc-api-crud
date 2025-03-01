import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "OgcApiEditor",
      formats: ["umd"],
      //fileName: `ol-ogc-api-crud.[hash]`,
      fileName: () => `ol-ogc-api-crud.umd.js`,
    },
    rollupOptions: {
      external: (path) => /ol\//.test(path) || path === "ol-mapbox-style",
      output: {
        globals: (path) =>
          /ol\//.test(path) ? path.replace(/\//g, ".") : null,
        //assetFileNames: (assetInfo) =>
        //  assetInfo.name === "style.css" ? "style.[hash].css" : assetInfo.name,
      },
    },
  },
  plugins: [tailwindcss(), svelte()],
});
