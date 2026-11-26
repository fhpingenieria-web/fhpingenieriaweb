// Quita de la foto de stock de Inspección los logos de otra empresa (remera, carpeta y máquina).
// Original: assets-fuente/fotos-originales/. Uso: node scripts/retocar-foto-inspeccion.cjs
const sharp = require("sharp");
(async () => {
  const src = "assets-fuente/fotos-originales/inspeccion-tecnica-de-obras.jpg";
  const k = 2400 / 1400;
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const col = (x, y) => { const i = (Math.round(y * k) * info.width + Math.round(x * k)) * info.channels; return `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`; };
  const elipse = (x, y, rx, ry, g, fill) => `<ellipse cx="${x * k}" cy="${y * k}" rx="${rx * k}" ry="${ry * k}" transform="rotate(${g} ${x * k} ${y * k})" fill="${fill}" filter="url(#b)"/>`;
  const svg = (cuerpo) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}"><defs><filter id="b" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${2.5 * k}"/></filter></defs>${cuerpo}</svg>`);
  // Remera y carpeta verde: color plano del entorno, porque el fondo es parejo
  const planos = svg(
    elipse(877, 632, 22, 22, 0, "#121211") +
    elipse(755, 688, 44, 13, -52, col(715, 725)) + elipse(690, 726, 36, 11, -46, col(715, 725)) + elipse(675, 757, 26, 11, -42, col(715, 725)),
  );
  // Carpeta gris y máquina: difuminado de la propia foto, así conserva el degradado de la zona
  const borroso = await sharp(src).blur(38).png().toBuffer();
  const mascara = svg(elipse(889, 722, 40, 11, -48, "#fff") + elipse(1081, 577, 28, 12, 6, "#fff"));
  const parche = await sharp(borroso).composite([{ input: mascara, blend: "dest-in" }]).png().toBuffer();
  const salida = await sharp(src).composite([{ input: parche }, { input: planos }]).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  require("fs").writeFileSync("src/assets/servicios/inspeccion-tecnica-de-obras.jpg", salida);
})();
