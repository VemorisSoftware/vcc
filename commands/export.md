---
description: "EN: Exports VCC's guides and base rules to Cursor, Codex or Gemini CLI in this project. ES: igual que /exportar."
argument-hint: "cursor | codex | gemini | todos"
---

# /export

Target: $ARGUMENTS

1. If no target, ask which (cursor, codex, gemini or todos).
2. Explain which files will be created or updated (`.cursor/rules/vcc-*.mdc`, `AGENTS.md`, `GEMINI.md`, `.vcc/skills/`) and that only VCC's marked sections are replaced. Wait for confirmation.
3. Use the VCC path shown at session start ("VCC path: …"). If missing, find it with `ls -d ~/.claude/plugins/cache/*/vcc/*/ ~/.claude/plugins/marketplaces/vcc/ 2>/dev/null | sort -V | tail -1` and run `node "<path>/scripts/exportar.js" <target> .`
4. Remind the user those tools don't run VCC's security hooks.
