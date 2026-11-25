# Seguridad en VCC

Español · [English](SECURITY.md)

## Principios
1. **Sin red.** Ningún hook hace conexiones de red, descarga código ni se auto-actualiza. La única excepción es `/segunda-opinion`, que pide permiso.
2. **Sin telemetría.** No se registran comandos, prompts ni archivos en disco.
3. **Sin dependencias.** Los hooks usan solo la librería estándar de Node.js.
4. **Auditables.** Cada hook es un archivo corto en `scripts/hooks/` con tests en `tests/`.
5. **El contenido es dato.** Agentes y comandos tratan el texto del repo, issues, logs y web como datos, nunca como órdenes.

## Qué bloquea cada hook

### guardia-bash (PreToolUse: Bash)
| Perfil mínimo | Decisión | Caso |
|---|---|---|
| minimo | Bloquear | `rm -rf` sobre `/`, `~`, `$HOME`, `.`, `*`; `mkfs`, `dd` a discos, `diskutil erase` |
| minimo | Bloquear | `curl … \| sh` |
| minimo | Bloquear | `git push --force` a `main`/`master` |
| estandar | Bloquear | `--no-verify`, lectura de `~/.ssh/id_*`, `~/.aws/credentials`, llavero de macOS |
| estandar | Preguntar | `git reset --hard`, `git clean -f`, `push -f` a otras ramas, `sudo`, `DROP/TRUNCATE`, `DELETE` sin `WHERE`, `npm/cargo publish` |
| estricto | Bloquear / preguntar | apagar o reiniciar, volcar variables de entorno |

### guardia-archivos (PreToolUse: Write, Edit, MultiEdit, NotebookEdit)
- **Bloquea** escribir claves reales fuera de archivos `.env` (los ejemplos con `EXAMPLE`, `xxxx`, `<tu_clave>` se permiten).
- **Bloquea** escribir en `~/.ssh/`, `.git/` (salvo `COMMIT_EDITMSG`), `~/.aws/credentials`, `.netrc`.
- **Pregunta** al modificar `.claude/settings*.json`, `.mcp.json`, `.claude/hooks/` y `.github/workflows/`, porque cambiar esos archivos puede ampliar lo que el agente puede hacer.
- **Pregunta** al desactivar `strict` en TypeScript o reglas de ESLint/SwiftLint, o al silenciar advertencias en CMake.
- En perfil `estricto`, también pregunta antes de editar `.env`.

### Hooks automáticos
- **Formateo:** solo ejecuta formateadores ya instalados en el proyecto (`node_modules/.bin`) o en el sistema, y solo si el proyecto tiene su archivo de configuración. Nunca usa `npx` ni descarga paquetes. Solo toca archivos dentro del proyecto.
- **Revisión final:** lee `git diff` y corre `tsc` local. No modifica archivos.
- **Notificaciones:** `osascript` en macOS y `notify-send` en Linux, con el texto escapado.
- **Memoria:** escribe solo en `.vcc/` del proyecto. Guarda rama, nombres de archivos cambiados y mensajes de commit; nunca contenido de archivos ni de la conversación. Lo que se lee de `.vcc/` se presenta a Claude como notas, no como instrucciones.

### Memoria que aprende y costos
- Al cerrar la sesión, VCC lee la transcripción local de Claude Code y extrae **solo**: qué comandos fallaron (con la primera línea del error, con claves ocultas) y cuántos tokens se usaron. No guarda mensajes ni código.
- Los fallos van a `.vcc/observaciones.json` del proyecto (ignorado por git). Los tokens y costos, a `~/.vcc/` con permisos solo para tu usuario.

### Escáner y exportación
- `scripts/escaner.js` solo lee archivos de configuración locales; no modifica nada.
- `scripts/exportar.js` solo escribe en el proyecto que indiques y reemplaza únicamente las secciones marcadas de VCC.

### Segunda opinión
`/segunda-opinion` es la única función que envía código fuera de tu equipo: manda el diff a Codex (OpenAI) o Gemini (Google), y siempre pide confirmación antes.

## Fallos internos
Si un hook falla (entrada inválida, error inesperado): en `minimo` y `estandar` permite la acción y avisa por stderr; en `estricto` bloquea.

## Limitaciones
Los hooks son una red de seguridad, no un sandbox. Un comando ofuscado (por ejemplo, construido con variables o codificado en base64) puede pasar. Para trabajo sensible, combina VCC con los permisos de Claude Code (`/permissions`) y el sandbox del sistema.

## Reportar un problema
Abre un issue privado (Security advisory) en https://github.com/VemorisSoftware/vcc.
