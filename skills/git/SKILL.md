---
name: git
description: "ES: Uso de git en el día a día: ramas cortas, mensajes de commit claros, pull requests revisables, sincronización y cómo salir de los problemas comunes. Úsalo al hacer commits, PRs o al resolver un enredo de git. EN: Day-to-day git: short branches, clear commit messages, reviewable pull requests, syncing and getting out of common messes. Use for commits, PRs or untangling git."
---

# Git

## Ramas
- `main` siempre funciona. Todo cambio entra por rama + PR.
- Nombre: `tipo/tema-corto` → `feat/pago-webpay`, `fix/redondeo-iva`.
- Ramas que viven días, no semanas.

## Commits
Formato:
```
tipo(alcance): qué cambia, en imperativo

Por qué hacía falta (si no es obvio).
```
Tipos: `feat` · `fix` · `refactor` · `perf` · `test` · `docs` · `build` · `ci` · `chore`.

Un commit = un cambio que se entiende solo. Antes de cada commit: `git diff --staged` completo.

## Pull requests
- Título igual que un commit.
- Cuerpo: **qué**, **por qué**, **cómo lo probé**, **riesgos**.
- Pequeños: si pasa de ~400 líneas, probablemente son dos PRs.

## Mantenerse al día
```bash
git fetch origin
git rebase origin/main       # en tu rama, antes de abrir el PR
git push --force-with-lease  # solo en tu rama
```
Nunca reescribas `main` ni ramas que otros usan.

## Salir de problemas
| Situación | Comando |
|---|---|
| Deshacer el último commit, mantener cambios | `git reset --soft HEAD~1` |
| Quitar un archivo del stage | `git restore --staged <archivo>` |
| Recuperar un commit "perdido" | `git reflog` → `git checkout -b rescate <sha>` |
| Revertir algo ya publicado | `git revert <sha>` |
| Guardar cambios a medias | `git stash push -m "descripción"` |
| Conflicto en rebase | resolver → `git add` → `git rebase --continue` (o `--abort`) |

## Si subiste un secreto
Rotar el secreto ya. Después limpiar el historial con `git filter-repo` y avisar a quien tenga clones.
