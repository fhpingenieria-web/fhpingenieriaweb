import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const leerHtml = (ruta) => readFile(new URL(`../dist/${ruta}`, import.meta.url), "utf8");

const sectores = [
  ["Oil &amp; Gas y energía", "/sectores/oil-gas-y-energia/"],
  ["Industria", "/sectores/industria/"],
  ["Agua, saneamiento e infraestructura", "/sectores/agua-saneamiento-e-infraestructura/"],
];

const hrefSectores = sectores.map(([, href]) => href);
const metodo = [
  ["Consulta", "/metodo/consulta/"],
  ["Relevamiento", "/metodo/relevamiento/"],
  ["Definición del alcance", "/metodo/alcance/"],
  ["Desarrollo", "/metodo/desarrollo/"],
  ["Seguimiento", "/metodo/seguimiento/"],
  ["Entrega", "/metodo/entrega/"],
];

const hrefMetodo = metodo.map(([, href]) => href);

const extraerNav = (html, marcador) => {
  const inicio = html.indexOf(marcador);
  assert.notEqual(inicio, -1, `No se encontró ${marcador}`);
  const fin = html.indexOf("</nav>", inicio);
  return html.slice(inicio, fin);
};

const hrefsSubmenu = (nav, hrefPadre) => {
  const padre = nav.indexOf(`href="${hrefPadre}"`);
  assert.notEqual(padre, -1, `No se encontró el menú ${hrefPadre}`);
  const inicio = nav.indexOf("<ul", padre);
  const fin = nav.indexOf("</ul>", inicio);
  return [...nav.slice(inicio, fin).matchAll(/href="([^"]+)"/g)].map((coincidencia) => coincidencia[1]);
};

test("cada sector tiene una página navegable desde el menú y el índice", async () => {
  const inicio = await leerHtml("index.html");
  const indice = await leerHtml("sectores/index.html");
  const escritorio = extraerNav(inicio, '<nav class="cabecera-nav"');
  const movil = extraerNav(inicio, '<nav class="contenedor menu-movil-nav"');

  assert.deepEqual(hrefsSubmenu(escritorio, "/sectores/"), hrefSectores);
  assert.deepEqual(hrefsSubmenu(movil, "/sectores/"), hrefSectores);

  for (const [nombre, href] of sectores) {
    assert.match(indice, new RegExp(`href="${href}"`));

    const detalle = await leerHtml(`${href.slice(1)}index.html`);
    assert.match(detalle, /<h1[^>]*>/);
    assert.match(detalle, new RegExp(nombre));
    assert.match(detalle, /href="\/sectores\/"/);
    assert.match(detalle, /href="#contacto"/);
  }
});

test("cada etapa del método tiene una página navegable desde el menú y el índice", async () => {
  const inicio = await leerHtml("index.html");
  const indice = await leerHtml("metodo/index.html");
  const escritorio = extraerNav(inicio, '<nav class="cabecera-nav"');
  const movil = extraerNav(inicio, '<nav class="contenedor menu-movil-nav"');

  assert.deepEqual(hrefsSubmenu(escritorio, "/metodo/"), hrefMetodo);
  assert.deepEqual(hrefsSubmenu(movil, "/metodo/"), hrefMetodo);

  for (const [nombre, href] of metodo) {
    assert.match(indice, new RegExp(`href="${href}"`));

    const detalle = await leerHtml(`${href.slice(1)}index.html`);
    assert.match(detalle, /<h1[^>]*>/);
    assert.match(detalle, new RegExp(nombre));
    assert.match(detalle, /href="\/metodo\/"/);
    assert.match(detalle, /href="#contacto"/);
  }
});
