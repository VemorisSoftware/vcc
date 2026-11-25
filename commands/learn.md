---
description: "EN: Saves a project learning to .vcc/aprendizajes.md so VCC remembers it in future sessions. ES: igual que /aprender."
argument-hint: "[the learning, optional]"
---

# /learn

Learning: $ARGUMENTS

1. If empty, propose 1–3 learnings from this session (non-obvious things that were hard to find) and ask which to save.
2. Phrase it per the **memoria-proyecto** skill: one line, today's date, a tag.
3. If a similar one exists, update it instead of duplicating.
4. Append it to `.vcc/aprendizajes.md` (create it with the title `# Aprendizajes del proyecto` if missing).
5. Never store secrets, tokens or personal data.
