// Guarda un texto editado desde la web (modo edición: ?editar). Sin clave, por decisión del cliente.
// Cada cambio queda en un historial (historial/<fecha>) para poder volver atrás.
import { getStore } from "@netlify/blobs";
import { purgeCache } from "@netlify/functions";

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: "Pedido inválido." }, 400);

  const { k } = body;
  const texto = typeof body.texto === "string" ? body.texto.replace(/\s+/g, " ").trim() : "";
  if (typeof k !== "string" || !/^[\w.-]{3,160}$/.test(k)) return json({ error: "Texto no reconocido." }, 400);
  if (!texto) return json({ error: "El texto no puede quedar vacío." }, 400);
  if (texto.length > 1500) return json({ error: "El texto es demasiado largo." }, 400);

  const store = getStore({ name: "textos", consistency: "strong" });
  const actual = (await store.get("actual", { type: "json" })) ?? {};
  const antes = actual[k] ?? null;
  actual[k] = texto;
  await store.setJSON("actual", actual);
  await store.setJSON(`historial/${new Date().toISOString()}_${k}`, { k, antes, texto });
  // Renueva la copia de las páginas en la red de Netlify, para que el cambio se vea enseguida
  await purgeCache({ tags: ["textos"] });
  return json({ ok: true });
};

export const config = { path: "/api/textos" };
