# Obras y antecedentes

Cada obra es una carpeta con su ficha (`index.yaml`) y sus fotos:

```
src/content/obras/
  _plantilla/          ← modelo para copiar (no se publica)
  planta-compresora-anelo/
    index.yaml
    01.jpg  02.jpg  03.jpg ...
```

1. Copiar `_plantilla`, renombrar la carpeta (sin espacios ni acentos) y poner las fotos adentro.
2. Completar `index.yaml` siguiendo los comentarios. Solo datos verificables.
3. Marcar `autorizada: true` y `publicada: true`.
4. La primera vez, activar la sección: `secciones.obras = true` en `src/data/empresa.ts`.

Con la sección activa y al menos una obra publicada aparecen: la página `/obras/`, una página por obra,
el bloque "Obras" en el inicio y el enlace en el menú. Sin obras publicadas no se genera nada.

Para revisar el formato sin obras reales: `npm run dev` y abrir `/obras/vista-previa/` (solo en desarrollo,
con fotos ilustrativas marcadas como ejemplo).
