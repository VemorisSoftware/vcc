---
description: "ES: Revisa los cambios actuales y entrega solo problemas reales, ordenados por gravedad. EN: Reviews current changes and reports only real problems, ordered by severity."
argument-hint: "[ruta o rango de commits, opcional]"
---

# /revisar

Alcance: $ARGUMENTS (vacío = todo lo que cambió respecto de HEAD).

1. Mira qué lenguajes y zonas toca el diff.
2. Lanza el agente **revisor** y, según corresponda, **revisor-typescript**, **revisor-swift**, **revisor-cpp** y **revisor-seguridad** (si hay autenticación, pagos, archivos subidos, datos personales o secretos).
3. Une los resultados sin duplicados: 🔴 bloqueantes, 🟠 importantes, 🟡 menores.
4. Cierra con un veredicto: ✅ listo · ⚠️ listo con cambios · ⛔ no mergear.

No apliques cambios salvo que el usuario lo pida.
