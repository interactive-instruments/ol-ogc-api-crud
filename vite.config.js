import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";

const postcssPlugins = [tailwind(), autoprefixer()];

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "OgcApiEditor",
      formats: ["umd"],
      fileName: `ol-ogc-api-crud`,//.[hash]`,
    },
    rollupOptions: {
      external: (path) => /ol\//.test(path) || path === 'ol-mapbox-style',
      output: {
        globals: (path) =>
          /ol\//.test(path) ? path.replace(/\//g, ".") : null,
        //assetFileNames: (assetInfo) =>
        //  assetInfo.name === "style.css" ? "style.[hash].css" : assetInfo.name,
      },
    },
  },
  css: {
    postcss: {
      plugins: postcssPlugins,
    },
  },
  plugins: [
    svelte({
      preprocess: [
        preprocess({
          postcss: {
            plugins: postcssPlugins,
          },
        }),
      ],
    }),
  ],
});
