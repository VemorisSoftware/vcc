---
name: listo-para-pr
description: "ES: Lista de comprobación final antes de un commit o pull request: compila, tipos, lint, pruebas, secretos, restos de depuración y lectura del diff. Úsalo antes de dar una tarea por terminada. EN: Final checklist before a commit or pull request: build, types, lint, tests, secrets, debug leftovers and diff read-through. Use before calling a task done."
---

# ¿Listo para PR?

Ejecuta cada punto con los comandos reales del proyecto. Si un punto no aplica, dilo; no lo inventes.

## 1. Compila
El build de producción, no solo el de desarrollo.

## 2. Tipos y lint
Sin errores nuevos. Una advertencia nueva se arregla o se justifica en el PR.

## 3. Pruebas
La suite completa, no solo las del archivo tocado. Si alguna era inestable antes, dilo explícitamente.

## 4. Nada que no debería ir
```bash
git diff --cached --name-only                         # ¿archivos inesperados?
git diff --cached | grep -nE '^\+.*(console\.log|print\(|debugger|dbg!|NSLog)'
git diff --cached | grep -niE '^\+.*(secret|token|password|api[_-]?key)\s*[:=]'
```
Tampoco: `.env`, builds, binarios, archivos de más de 1 MB, `TODO` sin dueño.

## 5. Lee el diff completo
Como si fueras otra persona. ¿Cada cambio tiene que ver con la tarea? ¿Hay algo a medias?

## 6. Resultado
```
✅ Build · ✅ Tipos · ⚠️ Lint (1 advertencia, justificada) · ✅ Pruebas 214/214
✅ Sin secretos ni restos · ✅ Diff revisado (7 archivos)
→ Listo para PR
```
Si algo falla: arréglalo y repite desde ese punto. No declares "listo" sin haber visto las salidas.
