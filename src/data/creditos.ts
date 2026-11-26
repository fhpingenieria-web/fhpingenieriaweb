/**
 * Fotografías ilustrativas de terceros. Ninguna muestra trabajos, personas ni obras de FHP.
 * Licencia Unsplash: uso comercial gratuito, sin atribución obligatoria. La incluimos por transparencia.
 */
export type Credito = { descripcion: string; autor: string; pagina: string };

const u = (slug: string) => `https://unsplash.com/photos/${slug}`;

export const creditosServicios: Record<string, Credito> = {
  "consultoria-de-ingenieria": {
    descripcion: "Dos profesionales revisan un plano sobre una mesa de trabajo",
    autor: "ThisisEngineering",
    pagina: u("people-in-uniforms-pointing-at-map-xYCBw1uIP_M"),
  },
  "calculo-y-evaluacion-tecnica": {
    descripcion: "Bridas mecanizadas sobre planos de fabricación",
    autor: "EnCata PD",
    pagina: u("two-metal-mechanical-parts-on-engineering-blueprints-SRqJ3eli-4I"),
  },
  "inspeccion-tecnica-de-obras": {
    descripcion: "Inspección de equipos en una planta industrial",
    autor: "TECNIC Bioprocess Solutions",
    pagina: u("a-man-inspects-machinery-in-a-factory-VFrbWve7eAs"),
  },
  "seguimiento-de-proyectos": {
    descripcion: "Dos profesionales con equipo de protección revisan registros en obra",
    autor: "RONNAKORN TRIRAGANON",
    pagina: u("construction-workers-review-plans-at-a-job-site-IvEYfb-3B70"),
  },
  "control-documental": {
    descripcion: "Juego de planos técnicos con instrumentos de dibujo",
    autor: "Lucas Kepner",
    pagina: u("architectural-blueprints-with-drafting-tools-Yn8D5B8C-eY"),
  },
};

export const creditosSectores: Record<"energia" | "industria" | "agua", Credito> = {
  energia: {
    descripcion: "Refinería con tanques de almacenamiento",
    autor: "Red Shuheart",
    pagina: u("industrial-refinery-with-storage-tanks-Wb4vcBqyGT8"),
  },
  industria: {
    descripcion: "Cañerías y estructuras en una planta industrial",
    autor: "Reza Setiawan",
    pagina: u("a-large-factory-with-many-pipes-2b0itU3a5-o"),
  },
  agua: {
    descripcion: "Vista aérea de una planta de tratamiento de agua",
    autor: "Ivan Bandura",
    pagina: u("water-treatment-tanks-from-above-6wSevhW1Dzc"),
  },
};

export const creditosHero: Credito[] = [
  { descripcion: "Columnas y cañerías de una refinería", autor: "Christian Harb", pagina: u("a-factory-with-a-lot-of-red-and-white-pipes-76yzygeNLT0") },
  { descripcion: "Red de cañerías y válvulas en una planta industrial", autor: "Ricardo Gomez Angel", pagina: u("industrial-metal-pipes-and-valves-41X6FwTwPh4") },
  { descripcion: "Vista aérea de una planta de tratamiento de agua", autor: "Ivan Bandura", pagina: u("water-treatment-tanks-from-above-6wSevhW1Dzc") },
];

/** Fotos de las páginas temáticas que no salen de las colecciones anteriores. */
export const creditosTemas: Credito[] = [
  {
    descripcion: "Aerogeneradores junto a la costa en Oulu, Finlandia (dominio público CC0)",
    autor: "Estormiz, Wikimedia Commons",
    pagina: "https://commons.wikimedia.org/wiki/File:Wind_turbines_Vihre%C3%A4saari_Oulu_20060613.jpg",
  },
];
