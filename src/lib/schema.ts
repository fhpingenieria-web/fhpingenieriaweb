/**
 * Datos estructurados (schema.org, JSON-LD) para buscadores y motores de respuesta con IA.
 * Solo se declaran datos que el sitio muestra: nada inventado ni oculto.
 */
import { empresa } from "@/data/empresa";

type Json = Record<string, unknown>;

export function orgId(site: URL) {
  return new URL("/#organizacion", site).href;
}
export function personaId(site: URL) {
  return new URL("/equipo/#direccion-tecnica", site).href;
}

export function organizacion(site: URL, servicios: string[]): Json {
  const d = empresa.director;
  return {
    "@type": "Organization",
    "@id": orgId(site),
    name: empresa.nombre,
    alternateName: empresa.sigla,
    url: new URL("/", site).href,
    logo: new URL("/marca/fhp-logo.svg", site).href,
    image: new URL("/og-default.png", site).href,
    description: empresa.mensajes.institucional,
    slogan: empresa.mensajes.firma,
    email: empresa.contacto.email.valor,
    telephone: `+${empresa.contacto.telefonoE164}`,
    areaServed: [
      { "@type": "Country", name: "Argentina" },
      { "@type": "Place", name: "Mercosur" },
    ],
    knowsAbout: servicios,
    founder: { "@id": personaId(site) },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "consultas comerciales",
      telephone: `+${empresa.contacto.telefonoE164}`,
      email: empresa.contacto.email.valor,
      availableLanguage: ["es"],
      areaServed: "AR",
    },
    employee: { "@id": personaId(site) },
    ...(d.linkedin ? { sameAs: [d.linkedin] } : {}),
  };
}

export function persona(site: URL): Json {
  const d = empresa.director;
  return {
    "@type": "Person",
    "@id": personaId(site),
    name: d.nombre,
    honorificPrefix: d.titulo,
    jobTitle: "Director técnico",
    worksFor: { "@id": orgId(site) },
    knowsAbout: d.areas.valor,
    ...(d.linkedin ? { sameAs: [d.linkedin] } : {}),
  };
}

export function sitioWeb(site: URL): Json {
  return {
    "@type": "WebSite",
    "@id": new URL("/#sitio", site).href,
    url: new URL("/", site).href,
    name: empresa.nombre,
    inLanguage: empresa.idioma,
    publisher: { "@id": orgId(site) },
  };
}

export function servicio(
  site: URL,
  s: { titulo: string; definicion: string; url: string; etapa: string },
): Json {
  return {
    "@type": "Service",
    "@id": `${s.url}#servicio`,
    name: s.titulo,
    serviceType: s.titulo,
    description: s.definicion,
    url: s.url,
    provider: { "@id": orgId(site) },
    areaServed: [
      { "@type": "Country", name: "Argentina" },
      { "@type": "Place", name: "Mercosur" },
    ],
    audience: { "@type": "BusinessAudience", name: "Proyectos industriales y de infraestructura" },
  };
}

export function migas(items: { nombre: string; url: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.nombre,
      item: it.url,
    })),
  };
}

export function preguntas(faq: { pregunta: string; respuesta: string }[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: { "@type": "Answer", text: f.respuesta },
    })),
  };
}

export function grafo(nodos: Json[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodos });
}
