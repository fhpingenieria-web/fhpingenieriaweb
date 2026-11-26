/**
 * Modo edición: con ?editar en la dirección, cada texto marcado (data-t) se puede tocar y cambiar.
 * Se guarda solo (al dejar de escribir o al salir del texto) en /api/textos. El modo queda activo en este
 * navegador hasta tocar "Salir".
 */
const LLAVE = "fhp-edicion";

const leerClave = () => {
  try { return localStorage.getItem(LLAVE); } catch { return null; }
};
const guardarClave = (v: string | null) => {
  try { v ? localStorage.setItem(LLAVE, v) : localStorage.removeItem(LLAVE); } catch {}
};

async function enviar(datos: Record<string, unknown>) {
  const r = await fetch("/api/textos", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(datos) });
  const j = (await r.json().catch(() => ({}))) as { error?: string };
  return { ok: r.ok, status: r.status, error: j.error };
}

export async function iniciarEditor() {
  const url = new URL(location.href);
  if (url.searchParams.has("editar")) {
    guardarClave("1");
    url.searchParams.delete("editar");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  if (!leerClave()) return;

  document.documentElement.classList.add("editando");
  const estilo = document.createElement("style");
  estilo.textContent = `
    .editando [data-t] { outline: 1px dashed rgb(63 143 204 / 0.8); outline-offset: 3px; border-radius: 2px; cursor: text; }
    .editando [data-t]:hover, .editando [data-t]:focus { outline-style: solid; outline-width: 2px; background: rgb(63 143 204 / 0.14); }
    .editor-barra { position: fixed; left: 50%; top: 12px; transform: translateX(-50%); z-index: 9999; display: flex; gap: 14px; align-items: center;
      max-width: calc(100vw - 24px); padding: 10px 12px 10px 18px; background: #0a1f3f; color: #fff; border-radius: 6px;
      font: 500 14px/1.3 system-ui, sans-serif; box-shadow: 0 8px 30px rgb(0 0 0 / 0.3); }
    .editor-barra strong { color: #7db8e8; font-weight: 600; }
    .editor-estado { color: rgb(255 255 255 / 0.75); white-space: nowrap; }
    .editor-barra button { font: inherit; color: #0a1f3f; background: #fff; border: 0; border-radius: 4px; padding: 7px 12px; cursor: pointer; }
    @media (max-width: 560px) { .editor-ayuda { display: none; } }
  `;
  document.head.append(estilo);

  const barra = document.createElement("div");
  barra.className = "editor-barra";
  barra.setAttribute("role", "status");
  barra.innerHTML = `<span><strong>Modo edición</strong> <span class="editor-ayuda">· Tocá un texto para cambiarlo. Se guarda solo.</span></span><span class="editor-estado"></span><button type="button">Salir</button>`;
  const estado = barra.querySelector<HTMLElement>(".editor-estado")!;
  barra.querySelector("button")!.addEventListener("click", () => {
    guardarClave(null);
    location.reload();
  });
  document.body.append(barra);
  const mostrar = (t: string) => (estado.textContent = t);

  const elementos = [...document.querySelectorAll<HTMLElement>("[data-t]")];
  const guardado = new Map<string, string>();
  const timers = new Map<string, number>();
  const conMismaClave = (k: string) => elementos.filter((e) => e.dataset.t === k);

  async function guardar(el: HTMLElement) {
    const k = el.dataset.t!;
    clearTimeout(timers.get(k));
    const texto = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (texto === guardado.get(k)) return;
    if (!texto) {
      conMismaClave(k).forEach((e) => (e.textContent = guardado.get(k) ?? ""));
      mostrar("El texto no puede quedar vacío");
      return;
    }
    mostrar("Guardando…");
    const r = await enviar({ k, texto });
    if (r.ok) {
      guardado.set(k, texto);
      mostrar("Guardado ✓");
    } else mostrar(r.error ?? "No se pudo guardar. Probá de nuevo.");
  }

  for (const el of elementos) {
    const k = el.dataset.t!;
    if (!guardado.has(k)) guardado.set(k, (el.textContent ?? "").trim());
    try { el.contentEditable = "plaintext-only"; } catch { el.contentEditable = "true"; }
    if (el.contentEditable !== "plaintext-only") el.contentEditable = "true";
    el.spellcheck = true;

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); el.blur(); }
    });
    el.addEventListener("input", () => {
      // El mismo texto puede aparecer en varios lugares (p. ej. el nombre de un servicio): se actualizan juntos
      conMismaClave(k).forEach((e) => e !== el && (e.textContent = el.textContent));
      clearTimeout(timers.get(k));
      timers.set(k, window.setTimeout(() => guardar(el), 1000));
      mostrar("Escribiendo…");
    });
    el.addEventListener("blur", () => guardar(el));
  }

  // Tocar un texto dentro de un botón o enlace edita el texto en lugar de navegar
  document.addEventListener(
    "click",
    (e) => {
      if ((e.target as Element | null)?.closest?.("[data-t]")) e.preventDefault();
    },
    true,
  );
}
