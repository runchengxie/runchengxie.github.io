import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://runchengxie.github.io",
  trailingSlash: "always",
  integrations: [sitemap()],
});
