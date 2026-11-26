// Lista todo lo provisional o faltante antes de publicar. Uso: npm run pendientes
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const { empresa, pendientesGenerales, secciones } = await import(path.join(ROOT, "src/data/empresa.ts"));

const filas = [];
const agregar = (item, bloquea) => filas.push({ item, bloquea });

for (const p of pendientesGenerales) agregar(p.item, p.bloquea === "publicacion");

const d = empresa.director;
if (d.areas.aConfirmar) agregar(`Especialidades del director: ${d.areas.valor.join(", ")}`, false);
if (d.participacion.aConfirmar) agregar(`Tipos de participación: ${d.participacion.valor.join(", ")}`, false);
if (empresa.contacto.email.aConfirmar) agregar(`Email: ${empresa.contacto.email.valor} (${empresa.contacto.email.nota})`, true);

const dirServ = path.join(ROOT, "src/content/servicios");
for (const f of fs.readdirSync(dirServ)) {
  const txt = fs.readFileSync(path.join(dirServ, f), "utf8");
  if (/entregables:\s*\n\s*aConfirmar:\s*true/.test(txt)) agregar(`Entregables típicos de ${f.replace(".yaml", "")}`, false);
}
const metodo = fs.readFileSync(path.join(ROOT, "src/content/metodo.yaml"), "utf8");
if (!/aConfirmar:\s*false/.test(metodo)) agregar("Método de trabajo (6 etapas orientativas)", false);
if (!secciones.obras) agregar("Sección Obras oculta: esperando fotos y datos verificados", false);

const bloq = filas.filter((f) => f.bloquea);
console.log(`\nPendientes de FHP (${filas.length}). Bloquean la publicación: ${bloq.length}\n`);
for (const f of filas) console.log(`${f.bloquea ? "[BLOQUEA]" : "[  ok   ]"} ${f.item}`);
console.log("");
process.exitCode = 0;
