// Descarga miniaturas de candidatas de Openverse y arma una hoja de contactos para elegir.
// Uso: node scripts/openverse-contactos.mjs <id8> <id8> ...
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "research/openverse");
const THUMBS = path.join(DIR, "thumbs");
fs.mkdirSync(THUMBS, { recursive: true });

const all = new Map();
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  for (const r of data.results ?? []) all.set(r.id.slice(0, 8), r);
}

const ids = process.argv.slice(2);
const tiles = [];
for (const id of ids) {
  const r = all.get(id);
  if (!r) {
    console.warn("no encontrado", id);
    continue;
  }
  const file = path.join(THUMBS, `${id}.jpg`);
  if (!fs.existsSync(file)) {
    const res = await fetch(r.thumbnail, { signal: AbortSignal.timeout(30000) }).catch(() => null);
    if (!res?.ok) {
      console.warn("sin miniatura", id);
      continue;
    }
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const tile = await sharp(file).resize(360, 240, { fit: "cover" }).jpeg().toBuffer();
  const label = Buffer.from(
    `<svg width="360" height="28"><rect width="360" height="28" fill="#0E1215"/><text x="8" y="19" font-family="monospace" font-size="15" fill="#fff">${id}</text></svg>`,
  );
  tiles.push(await sharp({ create: { width: 360, height: 268, channels: 3, background: "#fff" } })
    .composite([{ input: tile, top: 0, left: 0 }, { input: label, top: 240, left: 0 }])
    .jpeg()
    .toBuffer());
}

const cols = 4;
const rows = Math.ceil(tiles.length / cols);
const out = path.join(DIR, `contactos-${Date.now()}.jpg`);
await sharp({ create: { width: cols * 364, height: rows * 272, channels: 3, background: "#ddd" } })
  .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * 364, top: Math.floor(i / cols) * 272 })))
  .jpeg({ quality: 80 })
  .toFile(out);
console.log(out);
