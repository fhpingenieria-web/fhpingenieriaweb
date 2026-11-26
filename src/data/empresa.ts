/**
 * Datos institucionales de FHP.
 *
 * Regla del proyecto: ningún dato provisional se presenta como definitivo.
 * - `null` = dato desconocido: el sitio no lo muestra.
 * - `aConfirmar: true` = dato provisional: se muestra, pero en desarrollo aparece marcado
 *   y `npm run pendientes` lo lista antes de publicar.
 */

import { sitio, inicio } from "@/lib/textos";

// Los textos que el cliente edita desde el panel viven en src/content/textos/*.yaml.
const dt = inicio.direccionTecnica;

export type Dato<T> = { valor: T; aConfirmar?: boolean; nota?: string };

export const empresa = {
  nombre: "FHP Consultora e Ingeniería",
  sigla: "FHP",
  descriptor: "Consultoría, ingeniería e inspección técnica",
  ambito: sitio.ambito,
  idioma: "es-AR",
  copyright: "FHP Consultora e Ingeniería",

  mensajes: {
    principal: "Ingeniería, inspección y consultoría para proyectos que exigen precisión.",
    /** Titular del hero: máximo 2 líneas en escritorio. */
    titular: inicio.hero.titular,
    /** Bajada del hero: máximo 20 palabras. */
    bajadaHero: inicio.hero.bajada,
    bajada:
      "Control documental, inspección y seguimiento técnico para proyectos industriales y de infraestructura.",
    institucional: sitio.descripcionInstitucional,
    firma: sitio.firma,
  },

  mision: dt.mision,
  vision:
    "Consolidar una consultora reconocida por su seriedad, confiabilidad y calidad profesional en Argentina y el Mercosur.",
  valores: dt.valores,

  director: {
    nombre: "Facundo Hernán Porta",
    nombreCorto: "Facundo H. Porta",
    titulo: "Ing.",
    cargo: "Dirección técnica",
    experiencia: {
      valor: "Más de 20 años de experiencia profesional",
      nota: "Confirmado por el cliente el 22/10/2026. Es trayectoria del fundador, no antigüedad de la empresa.",
    } satisfies Dato<string>,
    areas: {
      valor: dt.especialidades,
      aConfirmar: true,
      nota: "Figura como 'experiencia profesional de referencia' en la fuente.",
    } satisfies Dato<string[]>,
    participacion: {
      valor: dt.participacion,
      aConfirmar: true,
    } satisfies Dato<string[]>,
    matricula: null as string | null,
    /** Ruta a un retrato en src/assets/equipo/. Sin retrato, la sección se resuelve sin imagen. */
    retrato: null as string | null,
    linkedin: null as string | null,
  },

  contacto: {
    email: {
      valor: sitio.contacto.email,
      aConfirmar: true,
      nota: "Genérico provisorio. consultas.com es un dominio de terceros: reemplazar antes de publicar.",
    } satisfies Dato<string>,
    telefono: {
      /** Formato para mostrar */
      valor: sitio.contacto.telefono,
      nota: "Confirmado por el cliente el 22/10/2026.",
    } satisfies Dato<string>,
    /** Formato E.164 sin signos, para tel: y WhatsApp */
    telefonoE164: sitio.contacto.telefono.replace(/\D/g, ""),
    whatsapp: true,
    ciudad: null as string | null,
  },

  legal: {
    razonSocial: null as string | null,
    cuit: null as string | null,
  },
} as const;

/** Secciones que se activan cuando hay información verificada. */
export const secciones = {
  /** Obras y antecedentes: se activa cuando Facundo envíe fotos y datos verificados. */
  obras: false,
};

export const pendientesGenerales: { item: string; bloquea: "publicacion" | "nada" }[] = [
  { item: "Dominio definitivo (variable SITE_URL)", bloquea: "publicacion" },
  { item: "Razón social y CUIT para el pie legal y la política de privacidad", bloquea: "publicacion" },
  { item: "Revisión legal de la política de privacidad", bloquea: "publicacion" },
  { item: "Retrato profesional de Facundo", bloquea: "nada" },
  { item: "Matrícula profesional (si es publicable)", bloquea: "nada" },
  { item: "Fotos y datos verificados de obras", bloquea: "nada" },
];
