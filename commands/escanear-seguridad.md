---
description: "ES: Busca secretos expuestos, dependencias vulnerables, código inseguro y configuración riesgosa de Claude Code. EN: Looks for exposed secrets, vulnerable dependencies, insecure code and risky Claude Code config."
argument-hint: "[ruta, opcional]"
---

# /escanear-seguridad

Alcance: $ARGUMENTS (vacío = repo completo).

1. **Secretos** en archivos versionados (`git ls-files`) y en el historial reciente (`git log -p -20`). Muestra solo archivo, línea y tipo; nunca el valor.
2. **Archivos que no deberían estar versionados:** `.env*` (salvo ejemplos), `*.pem`, `*.key`, `*.p12`, `*.mobileprovision`.
3. **Dependencias** con la auditoría del ecosistema.
4. **Código:** agente **revisor-seguridad** sobre rutas de API, autenticación, pagos y manejo de archivos.
5. **Claude Code:** usa la ruta de VCC indicada al inicio de la sesión ("Ruta de VCC: …"). Si no aparece, búscala con `ls -d ~/.claude/plugins/cache/*/vcc/*/ ~/.claude/plugins/marketplaces/vcc/ 2>/dev/null | sort -V | tail -1` y ejecuta `node "<ruta>/scripts/escaner.js" .` (revisa permisos, hooks, servidores MCP, secretos en la configuración e instrucciones sospechosas en CLAUDE.md/AGENTS.md). Explica cada hallazgo.

Informe ordenado por gravedad, con el arreglo para cada punto.
