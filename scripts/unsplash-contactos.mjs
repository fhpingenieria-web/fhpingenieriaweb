// Hoja de contactos de candidatas de Unsplash (miniaturas). Uso: node scripts/unsplash-contactos.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve(import.meta.dirname, "../research/unsplash");
const cands = JSON.parse(fs.readFileSync(path.join(DIR, "candidatas.json"), "utf8"));
fs.mkdirSync(path.join(DIR, "thumbs"), { recursive: true });

const tiles = [];
for (const c of cands) {
  const f = path.join(DIR, "thumbs", `${c.id}.jpg`);
  if (!fs.existsSync(f)) {
    const r = await fetch(`https://images.unsplash.com/photo-${c.id}?w=480&q=70&fm=jpg`, { signal: AbortSignal.timeout(30000) }).catch(() => null);
    if (!r?.ok) { console.warn("falla", c.id); continue; }
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  const img = await sharp(f).resize(400, 270, { fit: "cover" }).jpeg().toBuffer();
  const lbl = Buffer.from(`<svg width="400" height="26"><rect width="400" height="26" fill="#0E1215"/><text x="6" y="18" font-family="monospace" font-size="13" fill="#fff">${c.q} ${c.id.slice(0, 13)}</text></svg>`);
  tiles.push(await sharp({ create: { width: 400, height: 296, channels: 3, background: "#fff" } }).composite([{ input: img, top: 0, left: 0 }, { input: lbl, top: 270, left: 0 }]).jpeg().toBuffer());
}
const cols = 5;
const rows = Math.ceil(tiles.length / cols);
await sharp({ create: { width: cols * 404, height: rows * 300, channels: 3, background: "#ddd" } })
  .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * 404, top: Math.floor(i / cols) * 300 })))
  .jpeg({ quality: 78 })
  .toFile(path.join(DIR, "contactos.jpg"));
console.log("ok", tiles.length);
