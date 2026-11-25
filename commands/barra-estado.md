---
description: "ES: Configura la barra de estado de VCC (modelo, carpeta, rama, perfil) en Claude Code. EN: Sets up the VCC status line (model, folder, branch, profile) in Claude Code."
---

# /barra-estado

1. Busca el script instalado: `ls -d ~/.claude/plugins/cache/*/vcc/*/scripts/barra-estado.js ~/.claude/plugins/marketplaces/vcc/scripts/barra-estado.js 2>/dev/null | tail -1`.
2. Si no aparece, dilo y detente.
3. Muestra al usuario el cambio que harás en `~/.claude/settings.json` y pide confirmación:
   ```json
   "statusLine": { "type": "command", "command": "node \"<ruta encontrada>\"" }
   ```
4. Con la confirmación, agrégalo conservando el resto del archivo. Si ya existe un `statusLine`, pregunta antes de reemplazarlo.
5. Indica que se verá al enviar el próximo mensaje.
