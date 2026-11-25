### Rust
- `cargo clippy -- -D warnings` y `cargo fmt` limpios.
- Sin `unwrap()` fuera de pruebas; errores con `thiserror`/`anyhow`.
- Todo `unsafe` con comentario `// SAFETY:`.
- No sostener mutex a través de `.await`.
