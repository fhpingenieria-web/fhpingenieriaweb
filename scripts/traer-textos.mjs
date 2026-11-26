// Pasa los textos editados en la web (Netlify Blobs) a los archivos base del proyecto.
// Uso: npx netlify blobs:get textos actual > textos.json && node scripts/traer-textos.mjs textos.json
// Corrige tildes conocidas; no cambia ninguna otra palabra.
import fs from "node:fs";
import { parseDocument } from "yaml";

const textos = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const TILDES = [
  [/\bfabricacion\b/g, "fabricación"], [/\bfabrica\b/g, "fábrica"], [/\btecnicas\b/g, "técnicas"],
  [/\bingenieria\b/g, "ingeniería"], [/\bnecesitas\b/g, "necesitás"], [/\brespaldatoría\b/g, "respaldatoria"],
  [/\bcon que recursos\b/g, "con qué recursos"],
];
const archivo = (a) => {
  if (a === "servicios") return null;
  if (a === "sectores" || a === "metodo") return `src/content/${a}.yaml`;
  return `src/content/textos/${a}.yaml`;
};

const docs = new Map();
const abrir = (ruta) => {
  if (!docs.has(ruta)) docs.set(ruta, parseDocument(fs.readFileSync(ruta, "utf8"), { keepSourceTokens: false }));
  return docs.get(ruta);
};
let n = 0;
for (const [k, crudo] of Object.entries(textos)) {
  const v = TILDES.reduce((t, [a, b]) => t.replace(a, b), crudo);
  let [area, ...ruta] = k.split(".");
  let f = archivo(area);
  if (!f) { f = `src/content/servicios/${ruta[0]}.yaml`; ruta = ruta.slice(1); }
  if (!fs.existsSync(f)) { console.log("OMITIDO (sin archivo):", k); continue; }
  const camino = ruta.map((p) => (/^\d+$/.test(p) ? Number(p) : p));
  const doc = abrir(f);
  if (!doc.hasIn(camino)) { console.log("OMITIDO (sin campo):", k); continue; }
  if (doc.getIn(camino) !== v) { doc.setIn(camino, v); n++; }
}
for (const [f, doc] of docs) fs.writeFileSync(f, doc.toString({ lineWidth: 0 }));
console.log(`${n} textos actualizados en ${docs.size} archivos`);
