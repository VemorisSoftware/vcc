---
name: rust
description: "ES: Rust idiomático: modelado con enums y structs, manejo de errores con thiserror/anyhow, préstamos sin clones de más, async con tokio, unsafe justificado y pruebas. Úsalo al escribir o revisar Rust. EN: Idiomatic Rust: modeling with enums and structs, errors with thiserror/anyhow, borrowing without extra clones, async with tokio, justified unsafe and tests. Use when writing or reviewing Rust."
---

# Rust

## Modelar
Haz imposibles los estados inválidos con enums y newtypes:
```rust
pub struct Rut(String);          // solo se construye validado

impl TryFrom<&str> for Rut {
    type Error = ErrorRut;
    fn try_from(s: &str) -> Result<Self, Self::Error> { /* validar */ }
}

pub enum EstadoPago {
    Pendiente,
    Aprobado { codigo: String },
    Rechazado { motivo: String },
}
```

## Errores
```rust
#[derive(Debug, thiserror::Error)]
pub enum ErrorFactura {
    #[error("folio {0} no existe")]
    NoExiste(u64),
    #[error("error de base de datos")]
    Db(#[from] sqlx::Error),
}
```
Aplicaciones: `anyhow::Result` y `.context("qué estaba haciendo")`. `unwrap()` solo en pruebas o con un invariante comentado.

## Préstamos
- Parámetros: `&str`, `&[T]`, `impl AsRef<Path>`; devuelve tipos dueños.
- Si clonas para calmar al compilador, revisa el diseño primero.
- `Cow<'_, str>` cuando a veces se modifica y a veces no.

## Async (tokio)
- Nada bloqueante en tareas async; usa `tokio::task::spawn_blocking`.
- No sostengas un `std::sync::Mutex` a través de `.await`; usa `tokio::sync::Mutex` o reduce el alcance.
- Cancela con `tokio::select!` y `CancellationToken`.

## Unsafe
Encapsúlalo en una función segura pequeña, con `// SAFETY:` que explique por qué se cumplen los invariantes, y pruébalo con Miri si es posible.

## Calidad
`cargo fmt`, `cargo clippy -- -D warnings`, `cargo test`, `cargo audit`. Pruebas unitarias en `#[cfg(test)] mod tests`, de integración en `tests/`.
