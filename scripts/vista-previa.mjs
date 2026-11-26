// Mientras el sitio es un boceto (VISTA_PREVIA=1), lo oculta de los buscadores.
import fs from "node:fs";

if (process.env.VISTA_PREVIA === "1") {
  fs.appendFileSync("dist/_headers", "\n/*\n  X-Robots-Tag: noindex, nofollow\n");
  fs.writeFileSync("dist/robots.txt", "User-agent: *\nDisallow: /\n");
  console.log("Vista previa: sitio oculto para buscadores (noindex).");
}
