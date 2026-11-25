---
description: "ES: Muestra cuánto has gastado en Claude Code por proyecto y por día (costo en USD y tokens), con datos guardados solo en tu equipo. EN: Shows how much you've spent in Claude Code per project and per day (USD cost and tokens), with data stored only on your machine."
argument-hint: "[días, por defecto 30]"
---

# /costos

1. Usa la ruta de VCC indicada al inicio de la sesión ("Ruta de VCC: …"). Si no aparece, búscala con `ls -d ~/.claude/plugins/cache/*/vcc/*/ ~/.claude/plugins/marketplaces/vcc/ 2>/dev/null | sort -V | tail -1`.
2. Ejecuta `node "<ruta>/scripts/costos.js" $ARGUMENTS` y muestra el resultado.
3. Agrega 1 o 2 observaciones útiles (proyecto que más gasta, días con picos) y, si corresponde, sugiere el skill **contexto** para gastar menos.

El costo en USD se registra con la barra de estado de VCC (`/barra-estado`); los tokens, al cerrar cada sesión. Para la sesión actual también existe `/cost` de Claude Code.
