---
description: "EN: Sets up the VCC status line (model, folder, branch, profile) in Claude Code. ES: igual que /barra-estado."
---

# /statusline

1. Find the installed script: `ls -d ~/.claude/plugins/cache/*/vcc/*/scripts/barra-estado.js ~/.claude/plugins/marketplaces/vcc/scripts/barra-estado.js 2>/dev/null | tail -1`.
2. If nothing is found, say so and stop.
3. Show the user the change to `~/.claude/settings.json` and ask for confirmation:
   ```json
   "statusLine": { "type": "command", "command": "node \"<found path>\"" }
   ```
4. Once confirmed, add it keeping the rest of the file. If a `statusLine` already exists, ask before replacing it.
5. Say it will show after the next message.
