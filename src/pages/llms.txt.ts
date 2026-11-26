import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { empresa } from "@/data/empresa";
import { obrasPublicadas } from "@/lib/obras";

// Resumen del sitio para modelos de lenguaje (formato llms.txt).
export const GET: APIRoute = async ({ site }) => {
  const servicios = (await getCollection("servicios")).sort((a, b) => a.data.orden - b.data.orden);
  const sectores = (await getCollection("sectores")).sort((a, b) => a.data.orden - b.data.orden);
  const u = (p: string) => new URL(p, site).href;
  const d = empresa.director;
  const texto = [
    `# ${empresa.nombre}`,
    "",
    `> ${empresa.mensajes.institucional}`,
    "",
    `${empresa.nombre} es una consultora de ingeniería de Argentina que trabaja en ${empresa.ambito}. Dirección técnica: ${d.titulo} ${d.nombre} (${d.experiencia.valor.toLowerCase()}).`,
    "",
    "## Servicios",
    ...servicios.map((s) => `- [${s.data.titulo}](${u(`/servicios/${s.id}/`)}): ${s.data.resumen}`),
    "",
    "## Sectores",
    ...sectores.map((s) => `- [${s.data.nombre}](${u(`/sectores/${s.data.ruta}/`)}): ${s.data.descripcion}`),
    "",
    ...(await obrasPublicadas()).flatMap((o, i, a) => [
      ...(i === 0 ? ["## Obras", ""] : []),
      `- [${o.titulo}](${u(`/obras/${o.slug}/`)}): ${o.rol}, ${o.ubicacion}, ${o.periodo}.`,
      ...(i === a.length - 1 ? [""] : []),
    ]),
    "## Contacto",
    `- [Contacto](${u("/contacto/")})`,
    `- Teléfono y WhatsApp: ${empresa.contacto.telefono.valor}`,
    "",
  ].join("\n");
  return new Response(texto, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
