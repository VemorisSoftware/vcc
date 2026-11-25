---
description: "EN: Reviews current changes and reports only real problems, ordered by severity. ES: igual que /revisar."
argument-hint: "[path or commit range, optional]"
---

# /review

Scope: $ARGUMENTS (empty = everything changed vs HEAD).

1. Check which languages and areas the diff touches.
2. Run the **revisor** agent and, as relevant, **revisor-typescript**, **revisor-swift**, **revisor-cpp** and **revisor-seguridad** (auth, payments, uploads, personal data or secrets).
3. Merge results without duplicates: 🔴 blocking, 🟠 important, 🟡 minor.
4. End with a verdict: ✅ ready · ⚠️ ready with changes · ⛔ don't merge.

Don't apply changes unless asked.
