/**
 * Banda curva: una fila de fotos sobre el interior de un cilindro (CSS 3D).
 * Cada foto se corta en TIRAS verticales, cada una girada su parte del arco; la foto
 * entera (preserve-3d) se mueve con un solo rotateY alrededor del eje del cilindro.
 * Solo transform en el compositor. Cuando una foto sale de cuadro, toma la siguiente imagen.
 */
const TIRAS = 16;
const CAMARA = 1.6;
const ANCHO_MAX = 55;

type Opciones = {
  imagenes: { src: string }[];
  velocidad: number;
  altoFoto: number;
  relacion: number;
  separacion: number;
  eje: number;
  curva: number;
  desvanecido: number;
};

/** Radio del cilindro (fracción del ancho) que deja el borde del cuadro a `curva` radianes del arco. */
const arco = (curva: number) => (CAMARA - 1 + Math.cos(curva)) / (2 * CAMARA * Math.sin(curva));

function medir(ancho: number, alto: number, o: Opciones, curva: number) {
  const h = Math.min((o.altoFoto / 100) * alto, ((ANCHO_MAX / 100) * ancho) / o.relacion);
  const radio = ancho * arco(curva);
  if (!(h > 0) || !(radio > 0)) return { columnas: 2, barrido: 0, unidad: 0, limite: 0 };
  const grados = (r: number) => (r * 180) / Math.PI;
  const unidad = grados(h / radio);
  const paso = (o.relacion + o.separacion / 100) * unidad;
  const limite = grados(curva) + (o.relacion * unidad) / 2;
  const columnas = Math.min(60, Math.max(2, Math.ceil((2 * limite) / paso)));
  const red = (n: number) => +n.toFixed(4);
  const barrido = red((columnas * paso) / 2);
  return { columnas, barrido, unidad: red(unidad), limite: red(Math.min(barrido, limite)) };
}

let contador = 0;

function montar(raiz: HTMLElement) {
  const o = JSON.parse(raiz.dataset.banda!) as Opciones;
  if (!o.imagenes.length) return;
  const id = `bc${++contador}`;
  const curva = (Math.min(85, Math.max(5, o.curva)) * Math.PI) / 180;
  const r = 100 * arco(curva);
  const radio = `${+r.toFixed(3)}cqw`;
  const u = (n: number) =>
    `calc(${+n.toFixed(4)} * min(${o.altoFoto}cqh, ${+(ANCHO_MAX / o.relacion).toFixed(4)}cqw))`;
  const girar = (g: number) => `translateZ(${radio}) rotateY(${+g.toFixed(4)}deg) translateZ(-${radio})`;
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Precarga: una foto toma la siguiente justo antes de volver a verse.
  for (const { src } of o.imagenes) new Image().src = src;

  const estilo = document.createElement("style");
  const escena = document.createElement("div");
  escena.className = "banda-escena";
  escena.style.perspective = `${+(r * CAMARA).toFixed(3)}cqw`;
  escena.style.perspectiveOrigin = `50% ${o.eje}%`;
  const mascara = `linear-gradient(90deg,transparent,#000 ${o.desvanecido}%,#000 ${100 - o.desvanecido}%,transparent)`;
  escena.style.maskImage = mascara;
  escena.style.webkitMaskImage = mascara;
  raiz.prepend(estilo, escena);

  let ultimo = "";
  const construir = () => {
    const { width, height } = raiz.getBoundingClientRect();
    const m = medir(width, height, o, curva);
    const clave = `${m.columnas}|${m.barrido}|${m.unidad}`;
    if (clave === ultimo) return;
    ultimo = clave;

    const oculto = +(((m.barrido - m.limite) / (2 * m.barrido || 1)) * 100).toFixed(4);
    estilo.textContent =
      `@keyframes ${id}{from{transform:${girar(-m.barrido)}}to{transform:${girar(m.barrido)}}` +
      `0%,${oculto}%,${100 - oculto}%,100%{visibility:hidden}` +
      `${oculto + 0.001}%,${100 - oculto - 0.001}%{visibility:visible}}` +
      `.${id}{animation-play-state:${reducido ? "paused" : "running"}}`;

    const parte = o.relacion / TIRAS;
    const duracion = m.columnas * o.velocidad;
    escena.replaceChildren();

    for (let t = 0; t < m.columnas; t++) {
      const primera = m.columnas - 1 - t;
      const foto = document.createElement("div");
      foto.className = id;
      Object.assign(foto.style, {
        position: "absolute",
        left: `calc(50% - ${u(o.relacion / 2)})`,
        top: `calc(${o.eje}% - ${u(0.5)})`,
        width: u(o.relacion),
        height: u(1),
        transformStyle: "preserve-3d",
        animation: `${id} ${duracion}s linear ${-t * o.velocidad}s infinite`,
      });
      const imgs: HTMLImageElement[] = [];
      for (let k = 0; k < TIRAS; k++) {
        const tira = document.createElement("div");
        tira.className = "banda-tira";
        Object.assign(tira.style, {
          left: u((o.relacion - parte) / 2),
          width: k === TIRAS - 1 ? u(parte) : `calc(${u(parte)} + 1px)`,
          height: u(1),
          transform: girar((o.relacion / 2 - (k + 0.5) * parte) * m.unidad),
        });
        const img = document.createElement("img");
        img.alt = "";
        img.draggable = false;
        img.decoding = "async";
        Object.assign(img.style, { left: u(-k * parte), width: u(o.relacion), height: u(1) });
        img.src = o.imagenes[primera % o.imagenes.length]!.src;
        tira.append(img);
        foto.append(tira);
        imgs.push(img);
      }
      // Al dar la vuelta (fuera de cuadro) la foto toma la imagen siguiente.
      foto.addEventListener("animationiteration", (e) => {
        const vuelta = Math.round(e.elapsedTime / duracion);
        const src = o.imagenes[(vuelta * m.columnas + primera) % o.imagenes.length]!.src;
        if (imgs[0]!.src !== src) imgs.forEach((i) => (i.src = src));
      });
      escena.append(foto);
    }
    requestAnimationFrame(() => escena.classList.add("lista"));
  };

  new ResizeObserver(construir).observe(raiz);
  // Fuera de pantalla, pausa: no gasta recursos.
  new IntersectionObserver(([e]) => {
    if (reducido) return;
    escena.style.setProperty("--estado", e?.isIntersecting ? "running" : "paused");
    escena.querySelectorAll<HTMLElement>(`.${id}`).forEach((f) => (f.style.animationPlayState = e?.isIntersecting ? "running" : "paused"));
  }).observe(raiz);
}

export function iniciarBandas() {
  document.querySelectorAll<HTMLElement>("[data-banda]").forEach((b) => {
    if (b.dataset.montada) return;
    b.dataset.montada = "1";
    montar(b);
  });
}
