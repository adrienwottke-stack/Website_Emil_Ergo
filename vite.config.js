import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const page = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: page("index.html"),
        impressum: page("impressum.html"),
        datenschutz: page("datenschutz.html"),
        erstinformation: page("erstinformation.html"),
      },
    },
  },
});
