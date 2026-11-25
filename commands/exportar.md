---
description: "ES: Exporta las guías y reglas base de VCC a Cursor, Codex o Gemini CLI en este proyecto. EN: Exports VCC's guides and base rules to Cursor, Codex or Gemini CLI in this project."
argument-hint: "cursor | codex | gemini | todos"
---

# /exportar

Destino: $ARGUMENTS

1. Si no hay destino, pregunta cuál (cursor, codex, gemini o todos).
2. Explica qué archivos se crearán o actualizarán (`.cursor/rules/vcc-*.mdc`, `AGENTS.md`, `GEMINI.md`, `.vcc/skills/`) y que solo se reemplazan las secciones marcadas de VCC. Espera confirmación.
3. Usa la ruta de VCC indicada al inicio de la sesión ("Ruta de VCC: …"). Si no aparece, búscala con `ls -d ~/.claude/plugins/cache/*/vcc/*/ ~/.claude/plugins/marketplaces/vcc/ 2>/dev/null | sort -V | tail -1` y ejecuta `node "<ruta>/scripts/exportar.js" <destino> .`
4. Recuerda al usuario que esas herramientas no ejecutan los hooks de seguridad de VCC.
