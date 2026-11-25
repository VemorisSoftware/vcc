---
name: seo
description: "ES: SEO técnico y de contenido para sitios y apps web: rastreo, indexación, rendimiento (Core Web Vitals), metadatos, datos estructurados, sitios multilingües y contenido que responde búsquedas reales. Úsalo al construir o auditar un sitio. EN: Technical and content SEO for websites and web apps: crawling, indexing, performance (Core Web Vitals), metadata, structured data, multilingual sites and content that answers real searches. Use when building or auditing a site."
---

# SEO

## Técnico
- **Rastreo:** `robots.txt` sin bloquear lo importante, `sitemap.xml` actualizado y declarado.
- **Indexación:** una URL canónica por contenido (`<link rel="canonical">`), sin páginas duplicadas por parámetros, 301 para lo que cambió de dirección.
- **HTML que se ve sin JavaScript:** el contenido principal debe estar en el HTML inicial (SSR o estático). Las SPA puras se indexan peor.
- **Rendimiento (Core Web Vitals):** LCP < 2,5 s, INP < 200 ms, CLS < 0,1. Imágenes con tamaño, `loading="lazy"` bajo el pliegue, fuentes con `font-display: swap`.
- **Móvil:** diseño adaptable y textos legibles sin zoom.

## Por página
```html
<title>Plugin de mezcla para voces | Vemoris Audio</title>          <!-- ≤ 60 caracteres -->
<meta name="description" content="…">                              <!-- ≤ 155 caracteres, con la acción -->
<meta property="og:title" content="…">
<meta property="og:image" content="https://…/og.png">              <!-- 1200×630 -->
```
Un solo `<h1>`, encabezados en orden, textos alternativos descriptivos en imágenes.

## Datos estructurados (JSON-LD)
`Organization` en la portada, `Product`/`SoftwareApplication` en productos, `Article` en blog, `FAQPage` solo si la página muestra esas preguntas, `MusicRecording`/`MusicAlbum` para música.

## Multilingüe
URLs separadas por idioma (`/es/`, `/en/`), `hreflang` recíproco entre versiones y `x-default`.

## Contenido
- Una página por intención de búsqueda; responde la pregunta en el primer párrafo.
- Investiga cómo busca la gente (Search Console, sugerencias del buscador) antes de escribir.
- Enlaces internos con texto descriptivo, no "haz clic aquí".

## Medir
Google Search Console (consultas, páginas, errores de indexación) y analítica respetuosa de la privacidad. Revisión mensual.
