import { empresa } from "@/data/empresa";
import { sitio, rellenar } from "@/lib/textos";

const { telefonoE164, telefono, email } = empresa.contacto;

/** Mensaje inicial de WhatsApp. Si viene de un servicio, lo menciona para ahorrar un paso. */
export function whatsappUrl(servicio?: string) {
  const texto = servicio
    ? rellenar(sitio.contacto.whatsappMensajeServicio, { servicio: servicio.toLowerCase() })
    : sitio.contacto.whatsappMensaje;
  return `https://wa.me/${telefonoE164}?text=${encodeURIComponent(texto)}`;
}

export const telUrl = `tel:+${telefonoE164}`;
export const telefonoVisible = telefono.valor;
export const emailVisible = email.valor;
export const emailUrl = `mailto:${email.valor}`;
