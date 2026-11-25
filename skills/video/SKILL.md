---
name: video
description: "ES: Preproducción y edición de video: guion, lista de tomas, estructura, subtítulos, formatos por plataforma y automatización con ffmpeg. Úsalo al planificar, guionizar o procesar videos. EN: Video pre-production and editing: script, shot list, structure, subtitles, per-platform formats and ffmpeg automation. Use when planning, scripting or processing videos."
---

# Video

## Guion en dos columnas
| Imagen | Audio / texto |
|---|---|
| Plano detalle de manos en la consola | "Esta mezcla tardó 3 horas…" |
| Pantalla del plugin, antes/después | "…con este preset tardó 10 minutos." |

## Lista de tomas
Para cada toma: número, plano (general, medio, detalle), movimiento, lugar, duración aproximada y si lleva audio directo.

## Estructura
- **Corto (≤ 60 s):** gancho · una idea · cierre.
- **Largo:** promesa al inicio · capítulos · resumen · llamada a la acción.

## Formatos
| Destino | Relación | Resolución |
|---|---|---|
| Reels / TikTok / Shorts | 9:16 | 1080×1920 |
| YouTube | 16:9 | 1920×1080 o 3840×2160 |
| Feed cuadrado | 1:1 | 1080×1080 |

## ffmpeg útil
```bash
# Recortar sin recodificar
ffmpeg -ss 00:00:05 -to 00:00:35 -i in.mp4 -c copy corte.mp4
# Vertical 9:16 desde 16:9 (recorte centrado)
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -preset veryfast -crf 20 -c:a aac out.mp4
# Normalizar volumen para redes (-14 LUFS)
ffmpeg -i in.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 -c:v copy out.mp4
# Quemar subtítulos
ffmpeg -i in.mp4 -vf subtitles=subs.srt -c:a copy out.mp4
```

## Subtítulos
Siempre en videos de redes (la mayoría se ve sin sonido): líneas cortas (≤ 42 caracteres), 1–2 líneas por bloque, sincronizados con la voz.

## Derechos
Música, imágenes y tipografías con licencia para el uso que se les dará.
