import type { APIRoute } from "astro";

// Buscadores y motores de respuesta con IA habilitados: el objetivo es ser encontrados y citados.
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL("/sitemap-index.xml", site).href;
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "",
      "# Motores de respuesta con IA",
      "User-agent: GPTBot",
      "Allow: /",
      "User-agent: ChatGPT-User",
      "Allow: /",
      "User-agent: PerplexityBot",
      "Allow: /",
      "User-agent: ClaudeBot",
      "Allow: /",
      "User-agent: Google-Extended",
      "Allow: /",
      "",
      `Sitemap: ${sitemap}`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
