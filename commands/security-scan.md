---
description: "EN: Looks for exposed secrets, vulnerable dependencies, insecure code and risky Claude Code config. ES: igual que /escanear-seguridad."
argument-hint: "[path, optional]"
---

# /security-scan

Scope: $ARGUMENTS (empty = whole repo).

1. **Secrets** in tracked files (`git ls-files`) and recent history (`git log -p -20`). Show only file, line and type; never the value.
2. **Files that shouldn't be tracked:** `.env*` (except examples), `*.pem`, `*.key`, `*.p12`, `*.mobileprovision`.
3. **Dependencies** via the ecosystem's audit.
4. **Code:** **revisor-seguridad** agent on API routes, auth, payments and file handling.
5. **Claude Code:** use the VCC path shown at session start ("VCC path: …"). If missing, find it with `ls -d ~/.claude/plugins/cache/*/vcc/*/ ~/.claude/plugins/marketplaces/vcc/ 2>/dev/null | sort -V | tail -1` and run `node "<path>/scripts/escaner.js" .` (checks permissions, hooks, MCP servers, secrets in config and suspicious instructions in CLAUDE.md/AGENTS.md). Explain each finding.

Report ordered by severity, with a fix for each item.
