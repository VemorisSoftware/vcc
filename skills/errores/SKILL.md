---
name: errores
description: "ES: Cómo diseñar el manejo de errores: esperados vs inesperados, propagación con contexto, reintentos seguros, mensajes para usuarios y logs útiles. Úsalo al escribir o revisar cómo falla un sistema. EN: Designing error handling: expected vs unexpected, propagation with context, safe retries, user messages and useful logs. Use when writing or reviewing how a system fails."
---

# Errores

## Dos familias
| | Esperados | Inesperados |
|---|---|---|
| Ejemplos | Validación, no encontrado, sin saldo | Bug, invariante rota, disco lleno |
| Cómo representarlos | Valor de retorno (`Result`, unión de tipos) | Excepción / panic |
| Quién los maneja | El llamador, siempre | Un manejador global |
| Al usuario | Mensaje específico | Mensaje genérico + id para soporte |

## Propagar con contexto
Cada capa agrega lo que sabe y no repite lo que ya está:
```ts
try {
  await guardarFactura(f)
} catch (e) {
  throw new Error(`No se pudo guardar la factura ${f.folio}`, { cause: e })
}
```
Swift: `enum` que conforma `Error` por dominio. Rust: `thiserror` en librerías, `anyhow` + `.context()` en aplicaciones. C++: `std::expected` o un tipo resultado propio.

## Nunca
- `catch {}` vacío.
- Capturar, loguear y seguir como si nada.
- Devolver `null`/`false`/`0` para indicar "falló" sin decir por qué.
- Valores por defecto que esconden fallos (`?? []` sobre una respuesta de error).

## Reintentos
Solo si: el error es transitorio (timeout, 429, 502/503/504), la operación es idempotente y hay un tope. Espera exponencial con variación aleatoria: 0,5 s · 1 s · 2 s · 4 s.

## Logs
Una línea estructurada por error con: qué operación, id de petición, ids de entidades, causa. Sin contraseñas, tokens, números de tarjeta ni RUT completos.

## En interfaces
Cada pantalla tiene estado de error con salida: reintentar, volver o contactar. Un error nunca deja la app en blanco.
