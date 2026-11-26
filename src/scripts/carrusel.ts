/**
 * Carrusel de la portada: el mensaje principal dura 4 segundos y cada palabra 5, con fundido, flechas, puntos,
 * teclado y deslizar con el dedo. Se detiene navegando con el teclado y con movimiento reducido.
 * En modo edición no avanza solo, para no cambiar de diapositiva mientras se escribe.
 */
const DURACION_MENSAJE = 4000;
const DURACION_PALABRA = 5000;

export function iniciarCarrusel() {
  const raiz = document.querySelector<HTMLElement>("[data-carrusel]");
  if (!raiz) return;
  const slides = [...raiz.querySelectorAll<HTMLElement>("[data-slide]")];
  const puntos = [...raiz.querySelectorAll<HTMLButtonElement>("[data-punto]")];
  const video = raiz.querySelector<HTMLVideoElement>("[data-video]");
  raiz.querySelector<HTMLElement>("[data-controles]")!.hidden = false;

  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ahorroDatos = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  let editando = new URLSearchParams(location.search).has("editar");
  try { editando ||= !!localStorage.getItem("fhp-edicion"); } catch {}

  let actual = 0;
  const pausado = reducido || editando; // preferencias del visitante o modo edición
  let enEspera = false; // foco de teclado adentro
  let visible = true;
  let timer: number | undefined;

  // El video solo corre en su diapositiva, a la vista y con la pestaña activa. Se descarga después de la carga: el poster es la imagen principal.
  const actualizarVideo = () => {
    if (!video) return;
    const corre = video.preload === "auto" && !reducido && !ahorroDatos && visible && actual === 0 && !document.hidden;
    if (corre && video.paused) video.play().catch(() => {});
    else if (!corre && !video.paused) video.pause();
  };
  if (video && !reducido && !ahorroDatos) {
    // Si el visitante ya bajó, el video no se descarga: no le compite a las fotos que está por ver
    const arrancar = () => {
      if (!visible) return;
      video.preload = "auto";
      actualizarVideo();
    };
    const enReposo = () => setTimeout(() => ("requestIdleCallback" in window ? requestIdleCallback(arrancar, { timeout: 1000 }) : arrancar()), 800);
    if (document.readyState === "complete") enReposo();
    else addEventListener("load", enReposo, { once: true });
  }
  document.addEventListener("visibilitychange", () => { actualizarVideo(); programar(); });
  new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; actualizarVideo(); programar(); }).observe(raiz);

  function programar() {
    clearTimeout(timer);
    if (pausado || enEspera || !visible || document.hidden) return;
    timer = window.setTimeout(() => ir(actual + 1), actual === 0 ? DURACION_MENSAJE : DURACION_PALABRA);
  }

  function ir(n: number) {
    actual = (n + slides.length) % slides.length;
    slides.forEach((s, i) => {
      const activa = i === actual;
      s.classList.toggle("es-activa", activa);
      s.toggleAttribute("inert", !activa);
      if (activa) s.removeAttribute("aria-hidden");
      else s.setAttribute("aria-hidden", "true");
    });
    puntos.forEach((p, i) => (i === actual ? p.setAttribute("aria-current", "true") : p.removeAttribute("aria-current")));
    actualizarVideo();
    programar();
  }

  raiz.querySelector("[data-ant]")!.addEventListener("click", () => ir(actual - 1));
  raiz.querySelector("[data-sig]")!.addEventListener("click", () => ir(actual + 1));
  puntos.forEach((p, i) => p.addEventListener("click", () => ir(i)));

  raiz.addEventListener("focusin", (e) => { if ((e.target as Element).matches(":focus-visible")) { enEspera = true; programar(); } });
  raiz.addEventListener("focusout", () => { enEspera = false; programar(); });
  raiz.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement).isContentEditable) return;
    if (e.key === "ArrowLeft") ir(actual - 1);
    if (e.key === "ArrowRight") ir(actual + 1);
  });

  // Deslizar con el dedo: solo gestos claramente horizontales, para no interferir con el scroll
  let x0: number | null = null;
  let y0 = 0;
  raiz.addEventListener("touchstart", (e) => { x0 = e.touches[0]!.clientX; y0 = e.touches[0]!.clientY; }, { passive: true });
  raiz.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0]!.clientX - x0;
    const dy = e.changedTouches[0]!.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) ir(actual + (dx < 0 ? 1 : -1));
  }, { passive: true });

  programar();
}
