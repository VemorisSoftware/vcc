---
name: tdd
description: "ES: Desarrollo guiado por pruebas en ciclos cortos rojo-verde-limpieza, con cómo elegir qué probar y cómo detectar el runner del proyecto. Úsalo al crear lógica nueva o corregir un bug. EN: Test-driven development in short red-green-clean cycles, with how to choose what to test and detect the project's runner. Use when writing new logic or fixing a bug."
---

# TDD

## El ciclo
| Paso | Qué haces | Señal de que va bien |
|---|---|---|
| 🔴 Rojo | Una prueba para el próximo comportamiento | Falla con el mensaje esperado |
| 🟢 Verde | El código mínimo para pasarla | Pasa esa y todas las anteriores |
| 🧹 Limpieza | Mejoras nombres y estructura | Todo sigue en verde |

Ciclos de minutos, no de horas.

## Encontrar el runner
| Archivo | Comando típico |
|---|---|
| `package.json` | `npm test`, `npx vitest run`, `bun test` |
| `pyproject.toml` | `pytest -q` |
| `Cargo.toml` | `cargo test` |
| `Package.swift` | `swift test` |
| `*.xcodeproj` | `xcodebuild test -scheme <esquema> -destination '…'` |
| `CMakeLists.txt` | `ctest --test-dir build --output-on-failure` |

Usa siempre el script del proyecto si existe.

## Qué probar primero
1. El caso más simple que tenga valor.
2. Los casos que cambian el resultado (bordes, errores).
3. Los casos que el usuario reportó.

## Pruebas que se sostienen
- Nombre = regla de negocio: `rechaza_rut_con_digito_verificador_incorrecto`.
- Preparar · actuar · comprobar, separados con una línea en blanco.
- Sin `sleep`, sin hora real, sin red: inyecta reloj y clientes.
- Un mock solo en el borde (HTTP, disco, pagos), nunca de tu propia lógica.

## Ejemplo
```ts
import { describe, it, expect } from 'vitest'
import { validarRut } from './rut'

describe('validarRut', () => {
  it('acepta un RUT con dígito verificador correcto', () => {
    expect(validarRut('11.111.111-1')).toBe(true)
  })

  it('rechaza un RUT con dígito verificador incorrecto', () => {
    expect(validarRut('11.111.111-2')).toBe(false)
  })

  it('acepta K mayúscula o minúscula', () => {
    expect(validarRut('10.000.013-k')).toBe(validarRut('10.000.013-K'))
  })
})
```

## Cobertura
Úsala para encontrar zonas sin probar, no como meta. Guía razonable: lógica de negocio casi completa; código de pegamento, lo que aporte.
