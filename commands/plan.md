---
description: "EN: Prepares a staged plan for the request and waits for your approval before touching code. ES: igual que /planificar."
argument-hint: "[what to build | path to a doc]"
---

# /plan

Request: $ARGUMENTS

1. Ask the **planificador** agent for a plan for this request.
2. Show it in full: goal, out of scope, staged steps with files, tests, risks and done criteria.
3. Ask open questions first, if any.
4. **Don't write code** until the user approves ("ok", "go", "approved"). If they ask for changes, adjust and wait again.
5. Once approved, save the plan to `.vcc/plan.md` so it can be resumed.
