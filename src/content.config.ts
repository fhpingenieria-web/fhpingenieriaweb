import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const servicioIds = [
  "consultoria-de-ingenieria",
  "calculo-y-evaluacion-tecnica",
  "inspeccion-tecnica-de-obras",
  "seguimiento-de-proyectos",
  "control-documental",
] as const;

/** Lista con marca de verificación: si `aConfirmar`, se marca en desarrollo y se reporta en `npm run pendientes`. */
const listaVerificable = z.object({
  items: z.array(z.string()).min(1),
  aConfirmar: z.boolean().default(false),
});

const servicios = defineCollection({
  loader: glob({ base: "./src/content/servicios", pattern: "*.yaml" }),
  schema: z.object({
    titulo: z.string(),
    /** Nombre en el selector del formulario y en enlaces cortos */
    nombreCorto: z.string(),
    orden: z.number().int(),
    etapa: z.enum(["antes", "durante", "transversal"]),
    /** Una línea, máximo ~25 palabras. Se usa en listados. */
    resumen: z.string(),
    /** Definición autocontenida de 40 a 60 palabras: primer párrafo de la página (GEO). */
    definicion: z.string(),
    metaDescripcion: z.string().max(165),
    incluye: z.array(z.string()).min(2),
    situaciones: z.array(z.string()).min(2),
    entregables: listaVerificable,
    faq: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })).default([]),
    actualizado: z.coerce.date(),
  }),
});

const sectores = defineCollection({
  loader: file("./src/content/sectores.yaml"),
  schema: z.object({
    nombre: z.string(),
    nombreCorto: z.string(),
    ruta: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "debe ser una ruta en minúsculas y separada con guiones"),
    orden: z.number().int(),
    descripcion: z.string(),
    metaDescripcion: z.string().max(165),
    introduccion: z.string(),
    necesidades: z.array(z.string()).min(2),
    acompanamiento: z.array(z.string()).min(2),
    servicios: z.array(z.enum(servicioIds)).min(1),
    imagen: z.enum(["energia", "industria", "agua"]),
  }),
});

const metodo = defineCollection({
  loader: file("./src/content/metodo.yaml"),
  schema: z.object({
    orden: z.number().int(),
    nombre: z.string(),
    descripcion: z.string(),
    metaDescripcion: z.string().max(165),
    introduccion: z.string(),
    proposito: z.string(),
    actividades: z.array(z.string()).min(2),
    resultado: z.string(),
    aConfirmar: z.boolean().default(true),
  }),
});

/**
 * Obras y antecedentes. Una carpeta por obra: src/content/obras/<obra>/index.yaml + sus fotos.
 * Las carpetas que empiezan con "_" (como _plantilla) se ignoran.
 * Una obra se publica solo si `autorizada` y `publicada` son verdaderos y `secciones.obras` está activo.
 */
const obras = defineCollection({
  loader: glob({
    base: "./src/content/obras",
    pattern: "[!_]*/index.yaml",
    generateId: ({ entry }) => entry.split("/")[0]!,
  }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string().max(90),
      /** Una o dos oraciones: qué era la obra y qué hizo FHP. */
      resumen: z.string().max(320),
      sector: z.enum(["energia", "industria", "infraestructura"]),
      ubicacion: z.string(),
      periodo: z.string(),
      rol: z.string(),
      /** Solo si el cliente autorizó mencionarlo. */
      cliente: z.string().optional(),
      responsabilidades: z.array(z.string()).min(1),
      tareas: z.array(z.string()).min(1),
      /** Solo resultados comprobables. */
      resultados: z.array(z.string()).default([]),
      servicios: z.array(z.enum(servicioIds)).min(1),
      portada: z.object({ src: image(), alt: z.string().min(8) }),
      fotos: z.array(z.object({ src: image(), alt: z.string().min(8), pie: z.string().optional() })).default([]),
      autorizada: z.boolean(),
      publicada: z.boolean().default(false),
      /** Menor número = aparece primero. */
      orden: z.number().int().default(100),
    }),
});

export const collections = { servicios, sectores, metodo, obras };
