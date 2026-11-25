---
description: "ES: Pide una revisión independiente del diff a otro agente instalado (Codex CLI o Gemini CLI) y compara sus hallazgos con los de VCC. EN: Asks another installed agent (Codex CLI or Gemini CLI) for an independent review of the diff and compares its findings with VCC's."
argument-hint: "[codex | gemini, opcional]"
---

# /segunda-opinion

Herramienta: $ARGUMENTS (vacío = la que esté instalada; prioriza `codex`).

1. Verifica qué hay instalado: `command -v codex`, `command -v gemini`. Si no hay ninguna, dilo y detente.
2. **Pide confirmación al usuario** antes de seguir: el diff se enviará al proveedor de esa herramienta (OpenAI o Google). Si el repo tiene código confidencial, puede no querer hacerlo.
3. Con la confirmación, ejecuta en modo solo lectura:
   - Codex: `codex exec --sandbox read-only "Revisa los cambios de git diff HEAD en este repo. Reporta solo bugs, riesgos de seguridad y pérdida de datos, con archivo:línea, escenario y arreglo. Responde en español."`
   - Gemini: `git diff HEAD | gemini -p "Revisa este diff. Reporta solo bugs, riesgos de seguridad y pérdida de datos, con archivo:línea, escenario y arreglo. Responde en español."`
4. En paralelo, haz tu propia revisión con el agente **revisor**.
5. Entrega una tabla: hallazgos en que coinciden (alta confianza), solo de VCC, solo del otro agente. Verifica tú mismo cada hallazgo que solo uno encontró antes de darlo por bueno.

No apliques cambios sugeridos por el otro agente sin revisarlos.
