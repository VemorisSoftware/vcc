---
description: "EN: Shows how much you've spent in Claude Code per project and per day (USD cost and tokens), with data stored only on your machine. ES: igual que /costos."
argument-hint: "[days, default 30]"
---

# /costs

1. Use the VCC path shown at session start ("VCC path: …"). If missing, find it with `ls -d ~/.claude/plugins/cache/*/vcc/*/ ~/.claude/plugins/marketplaces/vcc/ 2>/dev/null | sort -V | tail -1`.
2. Run `node "<path>/scripts/costos.js" $ARGUMENTS` and show the result.
3. Add 1–2 useful observations (most expensive project, spike days) and, if relevant, suggest the **contexto** skill to spend less.

USD cost is recorded by the VCC status line (`/statusline`); tokens when each session ends. For the current session there's also Claude Code's `/cost`.
