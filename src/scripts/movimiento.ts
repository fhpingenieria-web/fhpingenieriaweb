/**
 * Constantes de movimiento del sitio. Un solo lugar para duraciones y curvas.
 * Criterio: el movimiento explica (revela, conecta, confirma). Nunca decora.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

/** Curva principal: arranque decidido, llegada precisa. */
CustomEase.create("fhp", "0.16, 1, 0.3, 1");
/** Para recorridos de cámara: entrada y salida suaves. */
CustomEase.create("fhp-recorrido", "0.65, 0, 0.35, 1");

export const DUR = {
  corta: 0.32,
  media: 0.7,
  larga: 1.1,
  revelado: 1.7,
} as const;

export const ESCALON = 0.08;

export const reducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText };
