// Pone en cada página los textos editados desde la web (guardados en Netlify Blobs).
// El resultado queda guardado en la red de Netlify: así el almacenamiento se consulta solo una vez por página,
// no en cada visita. Al guardar un texto, netlify/functions/textos.mjs renueva esa copia; cada publicación también.
import { getStore } from "@netlify/blobs";

const escapar = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default async (_req: Request, context: { next: () => Promise<Response> }) => {
  const res = await context.next();
  if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) return res;

  let textos: Record<string, string> | null = null;
  try {
    textos = await getStore({ name: "textos", consistency: "strong" }).get("actual", { type: "json" });
  } catch {
    return res; // Si el almacenamiento falla, se sirve la versión compilada, sin guardarla
  }

  const mapa = textos ?? {};
  const html = (await res.text()).replace(/(<span data-t="([^"]+)">)([^<]*)(<\/span>)/g, (m, abre, k: string, _v, cierra) =>
    k in mapa ? abre + escapar(mapa[k]!) + cierra : m,
  );
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  headers.delete("etag");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  headers.set("netlify-cdn-cache-control", "public, durable, s-maxage=31536000");
  headers.set("netlify-cache-tag", "textos");
  return new Response(html, { status: res.status, headers });
};

export const config = {
  cache: "manual",
  path: "/*",
  excludedPath: ["/_astro/*", "/video/*", "/og/*", "/marca/*", "/api/*", "/*.png", "/*.ico", "/*.svg", "/*.xml", "/*.txt", "/*.webmanifest", "/*.woff2"],
};
