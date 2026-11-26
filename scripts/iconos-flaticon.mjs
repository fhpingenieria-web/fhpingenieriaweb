// Convierte íconos de Flaticon UIcons (Thin Straight + Brands) a SVG sueltos y autoalojados.
// Licencia Flaticon: uso gratuito con crédito "Uicons by Flaticon" (ver /privacidad/#imagenes).
// Uso: node scripts/iconos-flaticon.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fontkit = require("fontkit");

const ROOT = path.resolve(import.meta.dirname, "..");
const VENDOR = path.join(ROOT, "vendor/flaticon");
const OUT = path.join(ROOT, "src/assets/iconos");
fs.mkdirSync(OUT, { recursive: true });

const FUENTES = {
  ts: { css: "https://cdn-uicons.flaticon.com/3.0.0/uicons-thin-straight/css/uicons-thin-straight.css", prefijo: "fi-ts-" },
  brands: { css: "https://cdn-uicons.flaticon.com/3.0.0/uicons-brands/css/uicons-brands.css", prefijo: "fi-brands-" },
};

// nombre en el sitio -> [fuente, nombre Flaticon]
const ICONOS = {
  "arrow-right": ["ts", "arrow-right"],
  "arrow-left": ["ts", "arrow-left"],
  "arrow-up-right": ["ts", "arrow-up-right"],
  "arrow-down-right": ["ts", "arrow-down-left", "espejo"],
  "whatsapp": ["brands", "whatsapp"],
  "phone": ["ts", "phone-flip"],
  "envelope": ["ts", "envelope"],
  "menu": ["ts", "bars-staggered"],
  "x": ["ts", "x"],
  "plus": ["ts", "add"],
  "check": ["ts", "check-circle"],
  "paper-plane": ["ts", "paper-plane"],
  // Servicios
  "consultoria-de-ingenieria": ["ts", "drafting-compass"],
  "calculo-y-evaluacion-tecnica": ["ts", "ruler-triangle"],
  "inspeccion-tecnica-de-obras": ["ts", "clipboard-list-check"],
  "seguimiento-de-proyectos": ["ts", "chart-gantt"],
  "control-documental": ["ts", "folder-tree"],
  "planos": ["ts", "blueprint"],
  // Sectores
  "energia": ["ts", "flame"],
  "industria": ["ts", "industry-windows"],
  "agua": ["ts", "water"],
};

async function bajar(url, destino) {
  if (fs.existsSync(destino)) return fs.readFileSync(destino);
  const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  const b = Buffer.from(await r.arrayBuffer());
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, b);
  return b;
}

const mapas = {};
const fuentes = {};
for (const [k, f] of Object.entries(FUENTES)) {
  const css = (await bajar(f.css, path.join(VENDOR, "cdn", `${k}.css`))).toString();
  const woff2 = css.match(/url\(\s*["']?([^"')]+?\.woff2)["']?\s*\)/)[1];
  const urlFuente = new URL(woff2, f.css).href;
  const bin = await bajar(urlFuente, path.join(VENDOR, "cdn", `${k}.woff2`));
  fuentes[k] = fontkit.create(bin);
  mapas[k] = {};
  const re = new RegExp(`\\.${f.prefijo}([a-z0-9-]+):+before\\s*\\{\\s*content:\\s*"([^"]+)";?\\s*\\}`, "g");
  for (const m of css.matchAll(re)) {
    const txt = m[2].replace(/\\([0-9a-f]{1,6})/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
    mapas[k][m[1]] = txt;
  }
}

const faltan = [];
for (const [nombre, [k, fi, modo]] of Object.entries(ICONOS)) {
  const txt = mapas[k][fi];
  if (!txt) { faltan.push(`${nombre} (${fi})`); continue; }
  const font = fuentes[k];
  const run = font.layout(txt);
  const g = run.glyphs[0];
  const upm = font.unitsPerEm;
  const asc = font.ascent;
  const ancho = run.positions[0].xAdvance || upm;
  let p = g.path.scale(1, -1).translate(0, asc);
  if (modo === "espejo") p = p.scale(-1, 1).translate(ancho, 0);
  const d = p.toSVG();
  const alto = asc - font.descent;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}" fill="currentColor"><path d="${d}"/></svg>\n`;
  fs.writeFileSync(path.join(OUT, `${nombre}.svg`), svg);
}
console.log(`Íconos generados en src/assets/iconos (${Object.keys(ICONOS).length - faltan.length}).`);
if (faltan.length) console.log("No existen en la fuente:", faltan.join(", "));
