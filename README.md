# Sitio web FHP

Proyecto Astro para publicar en Vercel.

## Publicación

Vercel instala las dependencias con `npm ci`, ejecuta `npm run build` y publica la carpeta `dist`.

Antes de la primera publicación definitiva, crear la variable de entorno `SITE_URL` en Vercel con el dominio canónico completo, por ejemplo `https://www.ejemplo.com.ar`. Esa variable actualiza las URL canónicas, el sitemap y las etiquetas Open Graph.

El directorio `../sitio` es una exportación estática de vista previa creada para Netlify; no es el directorio a conectar a Vercel.

## Desarrollo local

Requiere Node 22 o superior y un administrador de paquetes npm disponible.

```powershell
npm ci
npm run dev
```
