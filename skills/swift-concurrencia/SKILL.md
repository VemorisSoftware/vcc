---
name: swift-concurrencia
description: "ES: Concurrencia segura en Swift 6: async/await, actores, MainActor, Sendable, tareas estructuradas, cancelación y migración desde GCD. Úsalo al escribir o revisar código concurrente en Swift. EN: Safe Swift 6 concurrency: async/await, actors, MainActor, Sendable, structured tasks, cancellation and migrating from GCD. Use when writing or reviewing concurrent Swift."
---

# Concurrencia en Swift 6

## Mapa rápido
| Situación | Herramienta |
|---|---|
| Estado compartido que varios modifican | `actor` |
| Todo lo que toca UI | `@MainActor` |
| Dos o tres cosas en paralelo | `async let` |
| N cosas en paralelo | `withThrowingTaskGroup` |
| Trabajo atado a una vista | `.task {}` |
| Pasar datos entre dominios | tipos `Sendable` (structs con valores `Sendable`) |

## Actor
```swift
actor Inventario {
  private var stock: [String: Int] = [:]

  func reservar(_ sku: String, cantidad: Int) throws {
    let actual = stock[sku, default: 0]
    guard actual >= cantidad else { throw ErrorInventario.sinStock(sku) }
    stock[sku] = actual - cantidad
  }
}
```

## Reentrada
Entre dos `await` dentro de un actor, otro llamador puede cambiar el estado. Relee y valida después de cada `await`; no guardes suposiciones de antes.

## Cancelación
- Las tareas estructuradas se cancelan con su padre; las sueltas (`Task {}`) no: guarda la referencia y cancélala.
- En bucles largos: `try Task.checkCancellation()`.
- `Task.detached` casi nunca es lo que quieres.

## Sendable sin trampas
`@unchecked Sendable` solo cuando hay sincronización real (un lock interno) y con un comentario que lo explique. Si lo usas para callar al compilador, es un bug esperando.

## Migrar desde GCD
1. Activa la concurrencia estricta en un módulo a la vez.
2. Reemplaza colas seriales que protegen estado por actores.
3. Reemplaza callbacks por `async` (usa `withCheckedThrowingContinuation` para envolver APIs viejas).
4. Marca con `@MainActor` los modelos de UI.
