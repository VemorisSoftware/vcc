---
description: "EN: Asks another installed agent (Codex CLI or Gemini CLI) for an independent review of the diff and compares its findings with VCC's. ES: igual que /segunda-opinion."
argument-hint: "[codex | gemini, optional]"
---

# /second-opinion

Tool: $ARGUMENTS (empty = whichever is installed; prefer `codex`).

1. Check what's installed: `command -v codex`, `command -v gemini`. If neither, say so and stop.
2. **Ask the user for confirmation** first: the diff will be sent to that tool's provider (OpenAI or Google). Confidential code may need to stay local.
3. Once confirmed, run read-only:
   - Codex: `codex exec --sandbox read-only "Review the git diff HEAD changes in this repo. Report only bugs, security risks and data loss, with file:line, scenario and fix."`
   - Gemini: `git diff HEAD | gemini -p "Review this diff. Report only bugs, security risks and data loss, with file:line, scenario and fix."`
4. Meanwhile, do your own review with the **revisor** agent.
5. Deliver a table: findings both agree on (high confidence), VCC only, other agent only. Verify each single-source finding yourself before accepting it.

Don't apply the other agent's suggested changes without reviewing them.
