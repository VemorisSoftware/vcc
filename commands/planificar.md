---
description: "ES: Prepara un plan por etapas para el pedido y espera tu aprobación antes de tocar código. EN: Prepares a staged plan for the request and waits for your approval before touching code."
argument-hint: "[qué quieres construir | ruta a un documento]"
---

# /planificar

Pedido: $ARGUMENTS

1. Pídele al agente **planificador** el plan para este pedido.
2. Muéstralo completo: objetivo, fuera de alcance, etapas con archivos, pruebas, riesgos y criterio de término.
3. Si hay preguntas abiertas, hazlas primero.
4. **No escribas código** hasta que el usuario apruebe ("ok", "dale", "aprobado"). Si pide cambios, ajusta y vuelve a esperar.
5. Con la aprobación, guarda el plan en `.vcc/plan.md` para poder retomarlo.
