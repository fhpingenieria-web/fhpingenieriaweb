/**
 * Textos editables del sitio (src/content/textos/*.yaml), los que el cliente cambia desde el panel (Pages CMS).
 * Se validan al compilar: si falta un texto o queda vacío, la publicación se detiene con un mensaje claro
 * y el sitio en línea sigue con la última versión buena.
 */
import { parse } from "yaml";
import { z } from "astro/zod";
import sitioRaw from "@/content/textos/sitio.yaml?raw";
import inicioRaw from "@/content/textos/inicio.yaml?raw";
import paginasRaw from "@/content/textos/paginas.yaml?raw";
import privacidadRaw from "@/content/textos/privacidad.yaml?raw";
import temasRaw from "@/content/textos/temas.yaml?raw";

const t = z.string().trim().min(1, "no puede quedar vacío");
const lista = z.array(t).min(1);

const Sitio = z.object({
  contacto: z.object({
    telefono: t.refine((v) => v.replace(/\D/g, "").length >= 8, "el teléfono debe tener al menos 8 números"),
    email: z.string().trim().pipe(z.email("el correo no es válido")),
    whatsappMensaje: t,
    whatsappMensajeServicio: t,
  }),
  ambito: t,
  firma: t,
  descripcionInstitucional: t,
  menu: z.object({ inicio: t, institucional: t, experiencia: t, compromiso: t, sustentabilidad: t, servicios: t, sectores: t, obras: t, metodo: t, equipo: t, contacto: t, direccionTecnica: t }),
  botonContacto: t,
  bloqueContacto: z.object({ titulo: t, bajada: t, tituloEnServicio: t }),
  pie: z.object({ direccionTecnica: t, ambito: t, contacto: t, servicios: t, privacidad: t, creditos: t }),
});

const Inicio = z.object({
  descripcionGoogle: t,
  hero: z.object({ titular: t, bajada: t, botonSecundario: t }),
  enlaceServicio: t,
  grillaServicios: z.object({ titulo: t }),
  grillaInstitucional: z.object({ titulo: t }),
  credenciales: z.array(z.object({ dato: t, detalle: t })).min(1),
  situaciones: z.object({
    titulo: t,
    bajada: t,
    filas: z.array(z.object({ servicio: t, texto: t, enlace: t })).min(1),
  }),
  sectores: z.object({ titulo: t, bajada: t, nota: t, enlaceObras: t }),
  obras: z.object({ titulo: t, bajada: t, boton: t }),
  metodo: z.object({ titulo: t, bajada: t }),
  direccionTecnica: z.object({
    nombre: t,
    experiencia: t,
    rol: t,
    texto: t,
    mision: t,
    rotuloMision: t,
    tituloEspecialidades: t,
    especialidades: lista,
    tituloParticipacion: t,
    participacion: lista,
    tituloValores: t,
    valores: lista,
  }),
});

const Paginas = z.object({
  servicios: z.object({ tituloGoogle: t, descripcionGoogle: t, titulo: t, bajada: t }),
  servicio: z.object({
    tituloIncluye: t,
    tituloConviene: t,
    tituloEntregables: t,
    notaEntregables: t,
    tituloPreguntas: t,
    siguiente: t,
    actualizado: t,
  }),
  contacto: z.object({ descripcionGoogle: t }),
  noEncontrada: z.object({ titulo: t, bajada: t, botonInicio: t, enlaceServicios: t }),
});

const Privacidad = z.object({
  descripcionGoogle: t,
  titulo: t,
  secciones: z.array(z.object({ titulo: t, parrafos: lista })).min(1),
  creditos: z.object({ titulo: t, texto: t }),
});

const Bloques = z.array(z.object({ titulo: t, texto: t })).min(1);
const TemaBase = { palabra: t, bajada: t, descripcionGoogle: t, intro: lista, bloques: Bloques.optional() };
const Temas = z.object({
  verMas: t,
  experiencia: z.object(TemaBase),
  compromiso: z.object(TemaBase),
  sustentabilidad: z.object(TemaBase),
  equipo: z.object(TemaBase),
  institucional: z.object({ ...TemaBase, tituloQuienes: t, tituloMision: t, tituloVision: t, vision: t, tituloValores: t }),
  sectores: z.object(TemaBase),
  metodo: z.object(TemaBase),
});

function leer<T extends z.ZodTypeAny>(archivo: string, raw: string, esquema: T): z.infer<T> {
  const r = esquema.safeParse(parse(raw));
  if (r.success) return r.data;
  const errores = r.error.issues.map((i) => `  - ${i.path.join(" › ")}: ${i.message}`).join("\n");
  throw new Error(`Hay un problema en los textos (src/content/textos/${archivo}):\n${errores}`);
}

export const sitio = leer("sitio.yaml", sitioRaw, Sitio);
export const inicio = leer("inicio.yaml", inicioRaw, Inicio);
export const paginas = leer("paginas.yaml", paginasRaw, Paginas);
export const privacidad = leer("privacidad.yaml", privacidadRaw, Privacidad);
export const temas = leer("temas.yaml", temasRaw, Temas);

/** Reemplaza {clave} por su valor: "Consultá por {servicio}" → "Consultá por control documental". */
export const rellenar = (texto: string, valores: Record<string, string>) =>
  texto.replace(/\{(\w+)\}/g, (m, k: string) => valores[k] ?? m);
