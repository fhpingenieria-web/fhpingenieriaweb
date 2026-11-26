// Genera los activos de marca de FHP: logo redibujado en vector a partir de la identidad de Facundo
// (assets-fuente/logo-cliente/identidad-fhp-facundo.webp). Todo el texto se vectoriza.
// Uso: npm run marca
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const fontkit = require("fontkit");

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_PUBLIC = path.join(ROOT, "public");
const OUT_MARCA = path.join(OUT_PUBLIC, "marca");
const OUT_DATA = path.join(ROOT, "src/components/brand/marca.json");

// Mantener sincronizado con src/styles/global.css
const C = { noche: "#0A1F3F", profundo: "#0B3D91", acero: "#3F8FCC", grafito: "#4B5563", claro: "#E5E7EB" };

const r = (n) => Math.round(n * 100) / 100;
const mont = fontkit.openSync(path.join(ROOT, "assets-fuente/fonts/Montserrat[wght].ttf"));
const BOLD = mont.getVariation({ wght: 700 });
const MEDIO = mont.getVariation({ wght: 500 });

function trazo(font, text, tracking = 0) {
  const run = font.layout(text);
  let x = 0;
  const parts = [];
  run.glyphs.forEach((g, i) => {
    const d = g.path.scale(1, -1).translate(x + run.positions[i].xOffset, 0).toSVG();
    if (d) parts.push(d);
    x += run.positions[i].xAdvance + tracking;
  });
  return { d: parts.join(" "), ancho: x - tracking };
}

// ---------- Símbolo: cuatro polígonos medidos sobre el original, en una caja de 470 × 584 ----------
const X0 = 55, Y0 = 38;
const pts = (a) => a.map(([x, y]) => `${x - X0},${y - Y0}`).join(" ");
const simbolo = {
  ancho: 469,
  alto: 584,
  a: pts([[55, 268], [165, 200], [165, 540], [55, 490]]),
  b: pts([[210, 115], [328, 38], [328, 622], [210, 565]]),
  c: pts([[328, 328], [397, 295], [397, 340], [328, 372]]),
  d: pts([[397, 118], [524, 192], [524, 492], [397, 568]]),
};

// Palabra "FHP" y descriptor en dos líneas, como en la identidad de Facundo
const palabra = trazo(BOLD, "FHP", -14);
const desc1 = trazo(MEDIO, "INGENIERÍA Y", 150);
const desc2 = trazo(MEDIO, "CONSULTORÍA", 150);
const CAP = mont.capHeight; // 700

fs.writeFileSync(
  OUT_DATA,
  JSON.stringify({ simbolo, palabra: { d: palabra.d, ancho: r(palabra.ancho) }, desc1: { d: desc1.d, ancho: r(desc1.ancho) }, desc2: { d: desc2.d, ancho: r(desc2.ancho) }, cap: CAP }) + "\n",
);

// ---------- Lockups para SVG sueltos ----------
const TONOS = {
  claro: { a: ["#1A5AA8", "#0A2A5E"], b: [C.profundo, "#0A2750"], c: "#0A2750", d: ["#5DA3DF", "#2A78C0"], texto: C.noche, sec: C.grafito },
  oscuro: { a: ["#4C9AE0", "#1C62B8"], b: ["#FFFFFF", "#B9C3CF"], c: "#8FB9E3", d: ["#3F8FCC", "#1E63B5"], texto: "#FFFFFF", sec: "#C7D3E2" },
};
function defs(t, id = "m") {
  const g = (n, [c1, c2]) => `<linearGradient id="${id}${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
  return `<defs>${g("a", t.a)}${g("b", t.b)}${g("d", t.d)}</defs>`;
}
const polis = (t, id = "m") =>
  `<polygon points="${simbolo.a}" fill="url(#${id}a)"/><polygon points="${simbolo.b}" fill="url(#${id}b)"/><polygon points="${simbolo.c}" fill="${t.c}"/><polygon points="${simbolo.d}" fill="url(#${id}d)"/>`;

function lockup(tono, { conDescriptor = true } = {}) {
  const t = TONOS[tono];
  // Alturas en unidades del símbolo (584): la palabra mide 3/7 del símbolo en mayúsculas
  const esc = 250 / CAP;
  const xP = simbolo.ancho + 110;
  const yBase = simbolo.alto / 2 + 125;
  const anchoP = palabra.ancho * esc;
  let cuerpo = polis(t) + `<path transform="translate(${xP} ${yBase}) scale(${r(esc * 1000) / 1000})" d="${palabra.d}" fill="${t.texto}"/>`;
  let ancho = xP + anchoP;
  if (conDescriptor) {
    const xF = ancho + 70;
    const escD = 86 / CAP;
    const xD = xF + 70;
    cuerpo += `<rect x="${r(xF)}" y="${simbolo.alto / 2 - 125}" width="6" height="250" fill="${t.texto}"/>`;
    cuerpo += `<path transform="translate(${r(xD)} ${simbolo.alto / 2 - 16}) scale(${r(escD * 1000) / 1000})" d="${desc1.d}" fill="${t.sec}"/>`;
    cuerpo += `<path transform="translate(${r(xD)} ${simbolo.alto / 2 + 100}) scale(${r(escD * 1000) / 1000})" d="${desc2.d}" fill="${t.sec}"/>`;
    ancho = xD + Math.max(desc1.ancho, desc2.ancho) * escD;
  }
  return { ancho: Math.ceil(ancho), alto: simbolo.alto, svg: defs(t) + cuerpo };
}
const doc = (a, h, cuerpo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${h}" role="img" aria-label="FHP Ingeniería y Consultoría"><title>FHP Ingeniería y Consultoría</title>${cuerpo}</svg>\n`;

fs.mkdirSync(OUT_MARCA, { recursive: true });
for (const f of fs.readdirSync(OUT_MARCA)) fs.rmSync(path.join(OUT_MARCA, f));
for (const [nombre, tono, op] of [["fhp-logo-completo", "claro", {}], ["fhp-logo-completo-negativo", "oscuro", {}], ["fhp-logo", "claro", { conDescriptor: false }], ["fhp-logo-negativo", "oscuro", { conDescriptor: false }]]) {
  const l = lockup(tono, op);
  fs.writeFileSync(path.join(OUT_MARCA, `${nombre}.svg`), doc(l.ancho, l.alto, l.svg));
}
const simb = (t) => doc(simbolo.ancho, simbolo.alto, defs(TONOS[t]) + polis(TONOS[t]));
fs.writeFileSync(path.join(OUT_MARCA, "fhp-simbolo.svg"), simb("claro"));
fs.writeFileSync(path.join(OUT_MARCA, "fhp-simbolo-negativo.svg"), simb("oscuro"));

// ---------- Favicon e íconos: símbolo sobre cuadrado azul noche ----------
function icono(s, margenRel, radio) {
  const t = TONOS.oscuro;
  const h = s * (1 - margenRel * 2);
  const k = h / simbolo.alto;
  const x = (s - simbolo.ancho * k) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">${defs(t)}<rect width="${s}" height="${s}" rx="${radio}" fill="${C.noche}"/><g transform="translate(${r(x)} ${r((s - h) / 2)}) scale(${r(k * 10000) / 10000})">${polis(t)}</g></svg>\n`;
}
fs.writeFileSync(path.join(OUT_PUBLIC, "favicon.svg"), icono(64, 0.14, 12));
const png = (svg, s, f) => sharp(Buffer.from(svg), { density: 300 }).resize(s, s).png({ compressionLevel: 9 }).toFile(path.join(OUT_PUBLIC, f));
await png(icono(512, 0.16, 0), 180, "apple-touch-icon.png");
await png(icono(512, 0.16, 0), 192, "icon-192.png");
await png(icono(512, 0.16, 0), 512, "icon-512.png");
await png(icono(512, 0.24, 0), 512, "icon-maskable-512.png");
await png(icono(64, 0.14, 12), 32, "favicon-32.png");
{
  const p = fs.readFileSync(path.join(OUT_PUBLIC, "favicon-32.png"));
  const h = Buffer.alloc(22);
  h.writeUInt16LE(1, 2); h.writeUInt16LE(1, 4); h.writeUInt8(32, 6); h.writeUInt8(32, 7);
  h.writeUInt16LE(1, 10); h.writeUInt16LE(32, 12); h.writeUInt32LE(p.length, 14); h.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(OUT_PUBLIC, "favicon.ico"), Buffer.concat([h, p]));
}

// ---------- Imagen para redes genérica ----------
{
  const W = 1200, H = 630;
  const l = lockup("oscuro");
  const k = 760 / l.ancho;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${C.noche}"/><g transform="translate(${r((W - 760) / 2)} ${r((H - l.alto * k) / 2)}) scale(${r(k * 10000) / 10000})">${l.svg}</g></svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT_PUBLIC, "og-default.png"));
}
console.log("Marca generada en public/marca, public/ y src/components/brand/marca.json");
