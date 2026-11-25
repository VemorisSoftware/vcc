---
description: "EN: Saves where the work stands to .vcc/sesion.md so it can be resumed later. ES: igual que /guardar-sesion."
---

# /save-session

Write `.vcc/sesion.md` (create the folder if missing). If the hook already left an "Estado automático" section, keep it and add above it (headings in the user's language):

```markdown
# Session — YYYY-MM-DD HH:MM
## Goal
## Done (with evidence: commands, tests, commits)
## Tried without success (and why)
## Decisions
## Pending / blockers
## Exact next step
```

Be concrete: real paths, commands and error messages. No secrets. If you learned something worth always remembering, offer to save it with `/learn`.
