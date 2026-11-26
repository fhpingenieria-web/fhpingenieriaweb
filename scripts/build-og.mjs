// Genera las imágenes para redes (Open Graph, 1200×630) de cada página, con el sistema suizo del sitio:
// foto a sangre con velo azul noche y titular centrado en Montserrat, igual que la portada.
// Todo el texto se vectoriza. Uso: npm run og
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";
import { parse } from "yaml";

const require = createRequire(import.meta.url);
const fontkit = require("fontkit");

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/og");
const FOTOS = path.join(ROOT, "src/assets/servicios");
const MARCA = JSON.parse(fs.readFileSync(path.join(ROOT, "src/components/brand/marca.json"), "utf8"));

// Mantener sincronizado con src/styles/global.css
const C = { papel: "#E8EAE9", tinta: "#0E1215", grafito: "#4B4E50", senal: "#E5530F" };

// Misma tipografía que el sitio: Montserrat
const mont = fontkit.openSync(path.join(ROOT, "assets-fuente/fonts/Montserrat[wght].ttf"));
const TITULAR = mont.getVariation({ wght: 600 });
const CUERPO = mont.getVariation({ wght: 500 });

const W = 1200;
const H = 630;
const r = (n) => Math.round(n * 100) / 100;

function trazo(font, text, tracking = 0) {
  const run = font.layout(text);
  let cx = 0;
  const parts = [];
  run.glyphs.forEach((g, i) => {
    const d = g.path.scale(1, -1).translate(cx + run.positions[i].xOffset, 0).toSVG();
    if (d) parts.push(d);
    cx += run.positions[i].xAdvance + tracking;
  });
  return { d: parts.join(" "), ancho: cx };
}

/** Corta un texto en líneas que entren en `ancho` px a `tam` px. */
function lineas(font, text, tam, ancho, tracking = 0) {
  const esc = tam / font.unitsPerEm;
  const out = [];
  let actual = "";
  for (const palabra of text.split(" ")) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (trazo(font, prueba, tracking).ancho * esc > ancho && actual) {
      out.push(actual);
      actual = palabra;
    } else actual = prueba;
  }
  if (actual) out.push(actual);
  return out;
}

function texto(font, t, px, py, tam, color, tracking = 0) {
  const esc = tam / font.unitsPerEm;
  return `<path transform="translate(${r(px)} ${r(py)}) scale(${r(esc * 10000) / 10000})" d="${trazo(font, t, tracking).d}" fill="${color}"/>`;
}

function logo(py, alto) {
  // Símbolo y palabra "FHP" en versión negativa, a partir de marca.json, centrados en la imagen
  const { simbolo: k, palabra, cap } = MARCA;
  const e = alto / k.alto;
  const escP = 250 / cap;
  const px = (W - (k.ancho + 110 + palabra.ancho * escP) * e) / 2;
  const poli = (pts, c) => `<polygon points="${pts}" fill="${c}"/>`;
  return `<g transform="translate(${r(px)} ${r(py)}) scale(${r(e * 10000) / 10000})">` +
    poli(k.a, "#3F8FCC") + poli(k.b, "#FFFFFF") + poli(k.c, "#8FB9E3") + poli(k.d, "#3F8FCC") +
    `<path transform="translate(${k.ancho + 110} ${k.alto / 2 + 125}) scale(${r(escP * 1000) / 1000})" d="${palabra.d}" fill="#fff"/></g>`;
}

async function lamina({ archivoSalida, titulo, bajada, foto }) {
  // Mismo lenguaje que el hero del sitio: foto a sangre con velo oscuro, cabecera con filete fino
  // y titular grande y liviano (IBM Plex Sans) centrado, en blanco.
  const M = 56; // margen lateral
  const anchoTexto = 880;

  let tam = 66;
  let ls = lineas(TITULAR, titulo, tam, anchoTexto, -20);
  while (ls.length > 2 && tam > 48) {
    tam -= 4;
    ls = lineas(TITULAR, titulo, tam, anchoTexto, -20);
  }
  const lh = tam * 1.02;
  const tamB = 22;
  const lb = bajada ? lineas(CUERPO, bajada, tamB, 760).slice(0, 2) : [];
  const lhB = tamB * 1.5;
  // Bloque centrado verticalmente en el área debajo de la cabecera
  const alto = (ls.length - 1) * lh + tam * 0.74 + (lb.length ? 34 + lb.length * lhB : 0);
  const y0 = 100 + (H - 100 - alto) / 2 + tam * 0.74 - 10;
  const centrado = (font, t, y, tamano, color, tracking = 0, opacidad = 1) => {
    const ancho = trazo(font, t, tracking).ancho * (tamano / font.unitsPerEm);
    return texto(font, t, (W - ancho) / 2, y, tamano, color, tracking).replace("/>", ` fill-opacity="${opacidad}"/>`);
  };
  const titular = ls.map((l, i) => centrado(TITULAR, l, y0 + i * lh, tam, "#fff", -20)).join("");
  const yB = y0 + (ls.length - 1) * lh + 34 + tamB;
  const bajadaSvg = lb.map((l, i) => centrado(CUERPO, l, yB + i * lhB, tamB, "#fff", 0, 0.86)).join("");

  const fondo = await sharp(foto).resize(W, H, { fit: "cover" }).modulate({ saturation: 0.92 }).toBuffer();
  const velo = Buffer.from(
    `<svg width="${W}" height="${H}"><defs>` +
      `<linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#061228" stop-opacity=".66"/><stop offset=".25" stop-color="#061228" stop-opacity=".34"/><stop offset=".7" stop-color="#061228" stop-opacity=".4"/><stop offset="1" stop-color="#061228" stop-opacity=".66"/></linearGradient>` +
      `<radialGradient id="c" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#061228" stop-opacity=".42"/><stop offset="1" stop-color="#061228" stop-opacity="0"/></radialGradient>` +
      `</defs><rect width="${W}" height="${H}" fill="url(#v)"/><rect width="${W}" height="${H}" fill="url(#c)"/>` +
      `<rect x="${M}" y="99" width="${W - M * 2}" height="1" fill="#fff" fill-opacity=".24"/></svg>`,
  );
  const textoSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${logo(24, 54)}${titular}${bajadaSvg}</svg>`);

  await sharp(fondo)
    .composite([{ input: velo }, { input: textoSvg }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, archivoSalida));
}

fs.mkdirSync(OUT, { recursive: true });

const servicios = fs
  .readdirSync(path.join(ROOT, "src/content/servicios"))
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => ({ id: f.replace(/\.yaml$/, ""), ...parse(fs.readFileSync(path.join(ROOT, "src/content/servicios", f), "utf8")) }))
  .sort((a, b) => a.orden - b.orden);


const leer = (f) => parse(fs.readFileSync(path.join(ROOT, "src/content/textos", f), "utf8"));
const inicio = leer("inicio.yaml");
const paginas = leer("paginas.yaml");
const sitio = leer("sitio.yaml");
const temas = leer("temas.yaml");

await lamina({ archivoSalida: "inicio.png", titulo: inicio.hero.titular, bajada: inicio.hero.bajada, foto: path.join(ROOT, "src/assets/hero/poster.jpg") });
await lamina({ archivoSalida: "servicios.png", titulo: paginas.servicios.tituloGoogle, bajada: paginas.servicios.bajada, foto: path.join(FOTOS, "seguimiento-de-proyectos.jpg") });
for (const s of servicios) {
  await lamina({ archivoSalida: `servicio-${s.id}.png`, titulo: s.titulo, bajada: s.resumen, foto: path.join(FOTOS, `${s.id}.jpg`) });
}
await lamina({ archivoSalida: "contacto.png", titulo: sitio.bloqueContacto.titulo, bajada: sitio.bloqueContacto.bajada, foto: path.join(ROOT, "src/assets/sectores/energia.jpg") });
for (const t of ["experiencia", "compromiso", "sustentabilidad", "equipo", "institucional", "sectores", "metodo"]) {
  await lamina({ archivoSalida: `${t}.png`, titulo: temas[t].palabra, bajada: temas[t].bajada, foto: path.join(ROOT, "src/assets/temas", `${t}.jpg`) });
}

console.log(`Imágenes para redes generadas en public/og (${servicios.length + 10} archivos)`);
