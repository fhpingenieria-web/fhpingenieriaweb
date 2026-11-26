import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import { secciones } from "@/data/empresa";

export type Foto = { src: ImageMetadata; alt: string; pie?: string | undefined };
export type ServicioId =
  | "consultoria-de-ingenieria"
  | "calculo-y-evaluacion-tecnica"
  | "inspeccion-tecnica-de-obras"
  | "seguimiento-de-proyectos"
  | "control-documental";

export type ObraVista = {
  slug: string;
  titulo: string;
  resumen: string;
  sector: "energia" | "industria" | "infraestructura";
  ubicacion: string;
  periodo: string;
  rol: string;
  cliente?: string | undefined;
  responsabilidades: string[];
  tareas: string[];
  resultados: string[];
  servicios: ServicioId[];
  portada: Foto;
  fotos: Foto[];
};

export const nombreSector = {
  energia: "Oil & Gas y energía",
  industria: "Industria",
  infraestructura: "Agua, saneamiento e infraestructura",
} as const;

export const iconoSector = { energia: "energia", industria: "industria", infraestructura: "agua" } as const;

/** Obras reales publicables. Vacío si la sección está desactivada. */
export async function obrasPublicadas(): Promise<ObraVista[]> {
  if (!secciones.obras) return [];
  const todas = await getCollection("obras", (o) => o.data.publicada && o.data.autorizada);
  return todas
    .sort((a, b) => a.data.orden - b.data.orden || a.data.titulo.localeCompare(b.data.titulo))
    .map((o) => ({ slug: o.id, ...o.data }));
}

/**
 * Lo que se muestra en menú e inicio: obras reales; si no hay y estamos en desarrollo,
 * las de ejemplo (para revisar el diseño integrado). En producción sin obras: nada.
 */
export async function obrasParaMostrar(): Promise<{ obras: ObraVista[]; base: string; ejemplo: boolean }> {
  const reales = await obrasPublicadas();
  if (reales.length) return { obras: reales, base: "/obras/", ejemplo: false };
  if (import.meta.env.DEV) return { obras: await obrasEjemplo(), base: "/obras/vista-previa/", ejemplo: true };
  return { obras: [], base: "/obras/", ejemplo: false };
}

/**
 * Obras de EJEMPLO para revisar la plantilla en desarrollo. No se publican nunca:
 * las rutas de vista previa solo existen con `npm run dev`.
 */
export async function obrasEjemplo(): Promise<ObraVista[]> {
  // Fotos de obra de dominio público (CC0, ver src/assets/obras-ejemplo/CREDITOS.json).
  // Distintas de las de servicios y sectores: solo ilustran el formato.
  const f = import.meta.glob<{ default: ImageMetadata }>("/src/assets/obras-ejemplo/*.jpg", { eager: true });
  const o = (n: string): Foto => ({ src: f[`/src/assets/obras-ejemplo/${n}.jpg`]!.default, alt: "Foto de obra de ejemplo" });
  const base = {
    responsabilidades: ["Responsabilidad de ejemplo", "Otra responsabilidad de ejemplo"],
    tareas: ["Tarea de ejemplo", "Otra tarea de ejemplo", "Una tercera tarea de ejemplo"],
    resultados: ["Resultado comprobable de ejemplo"],
  };
  return [
    { slug: "ejemplo-planta-de-proceso", titulo: "Ejemplo: planta de proceso", resumen: "Texto de ejemplo. Aquí va qué era la obra y cuál fue la participación de FHP.", sector: "energia", ubicacion: "Ciudad, provincia", periodo: "2024 - 2025", rol: "Inspección técnica", servicios: ["inspeccion-tecnica-de-obras", "control-documental"], portada: o("planta-montaje"), fotos: [o("planta-estructura"), o("obra-sitio"), o("andamios-fachada")], ...base },
    { slug: "ejemplo-ampliacion-industrial", titulo: "Ejemplo: ampliación de instalación industrial", resumen: "Texto de ejemplo para una obra industrial.", sector: "industria", ubicacion: "Ciudad, provincia", periodo: "2023", rol: "Seguimiento de proyecto", servicios: ["seguimiento-de-proyectos"], portada: o("andamios-azules"), fotos: [o("andamios-pasillo"), o("sala-equipos")], ...base },
    { slug: "ejemplo-planta-de-tratamiento", titulo: "Ejemplo: planta de tratamiento de agua", resumen: "Texto de ejemplo para una obra de agua y saneamiento.", sector: "infraestructura", ubicacion: "Ciudad, provincia", periodo: "2022 - 2023", rol: "Control documental", servicios: ["control-documental", "inspeccion-tecnica-de-obras"], portada: o("planta-agua"), fotos: [o("piletas-agua")], ...base, resultados: [] },
    { slug: "ejemplo-revision-de-ingenieria", titulo: "Ejemplo: revisión de ingeniería de detalle", resumen: "Texto de ejemplo para una consultoría.", sector: "industria", ubicacion: "Ciudad, provincia", periodo: "2022", rol: "Consultoría de ingeniería", servicios: ["consultoria-de-ingenieria", "calculo-y-evaluacion-tecnica"], portada: o("estructura-hormigon"), fotos: [o("grua-edificio")], ...base },
    { slug: "ejemplo-obra-de-infraestructura", titulo: "Ejemplo: obra de infraestructura", resumen: "Texto de ejemplo.", sector: "infraestructura", ubicacion: "Ciudad, provincia", periodo: "2021", rol: "Inspección técnica", servicios: ["inspeccion-tecnica-de-obras"], portada: o("puente-montaje"), fotos: [o("puente-estructura")], ...base },
  ];
}
