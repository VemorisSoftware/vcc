---
name: contexto
description: "ES: Cuidar la ventana de contexto en sesiones largas: qué ocupa espacio, cuándo compactar, qué guardar antes y cómo recortar configuración que se carga siempre. Úsalo cuando el contexto se llena o al cambiar de etapa. EN: Managing the context window in long sessions: what takes space, when to compact, what to save first and how to trim always-loaded config. Use when context fills up or between work phases."
---

# Contexto

## Qué ocupa espacio
| Siempre cargado | Cargado al usarse |
|---|---|
| CLAUDE.md (global y del proyecto) | Cuerpo de skills |
| Descripciones de skills y agentes | Archivos leídos |
| Esquemas de herramientas MCP | Salidas de comandos |

Revisa el reparto con `/context`.

## Compactar a propósito
Buen momento: al cerrar una etapa (investigar → planificar → implementar → verificar), o antes de empezar algo no relacionado.
Mal momento: con archivos a medio editar o en mitad de una depuración.

Antes de compactar:
1. Ejecuta `/guardar-sesion` (o confirma que el hook ya lo hizo).
2. Compacta con foco: `/compact conserva el plan de la etapa 3 y el error pendiente del build`.

Sobrevive: CLAUDE.md, archivos en disco, el resumen. Se pierde: salidas largas y razonamiento intermedio.

## Gastar menos
- Pide fragmentos (`rango de líneas`, `grep`) en vez de archivos completos.
- Delega exploraciones amplias a un subagente y quédate con su conclusión.
- Corta salidas ruidosas: `| tail -50`, `--quiet`, filtros.

## Recortar lo que se carga siempre
- CLAUDE.md: reglas en una línea cada una; los ejemplos y explicaciones largas, a un skill.
- MCP: desactiva por proyecto los servidores que ese proyecto no usa.
- Skills y agentes: borra los que no usaste en el último mes.

Estimación rápida: 1 token ≈ 3,5 caracteres en español, ≈ 4 en inglés.
