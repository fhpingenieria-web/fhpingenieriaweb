// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

// El dominio definitivo todavía no está confirmado (ver `npm run pendientes`).
// Se define con la variable SITE_URL al publicar.
const site = process.env.SITE_URL ?? "http://localhost:4321";

export default defineConfig({
  site,
  trailingSlash: "always",
  // Astro 7 comprime al estilo JSX y elimina espacios entre elementos en línea.
  // Mantenemos el comportamiento clásico para no perder espacios en textos con <a>, <b>, etc.
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
  fonts: [
    {
      // Tipografía de la identidad de FHp (variable 400-700, solo latín)
      provider: fontProviders.local(),
      name: "Montserrat",
      cssVariable: "--font-montserrat",
      fallbacks: ["Helvetica Neue", "Arial", "sans-serif"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/Montserrat-wght-latin.woff2"],
            weight: "400 700",
            style: "normal",
          },
        ],
      },
    },
  ],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  // Sin la barra de herramientas de Astro en desarrollo: la web se revisa tal como se verá publicada.
  devToolbar: { enabled: false },
  build: {
    // CSS en línea: el sitio es chico y así no hay hojas que bloqueen el primer pintado.
    inlineStylesheets: "always",
  },
});
