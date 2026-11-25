---
name: api-rest
description: "ES: Diseño de APIs HTTP/REST predecibles: rutas, métodos, códigos de estado, errores, paginación, idempotencia, versionado y documentación. Úsalo al crear o revisar endpoints. EN: Predictable HTTP/REST API design: routes, methods, status codes, errors, pagination, idempotency, versioning and docs. Use when creating or reviewing endpoints."
---

# APIs REST

## Rutas
- Recursos en plural y minúsculas: `/facturas`, `/facturas/{id}/lineas`.
- Acciones que no encajan en CRUD como sub-recurso: `POST /facturas/{id}/anulacion`.
- No más de dos niveles de anidación.

## Métodos y respuestas
| Acción | Método | Éxito |
|---|---|---|
| Listar | GET /recursos | 200 |
| Ver uno | GET /recursos/{id} | 200 · 404 si no existe |
| Crear | POST /recursos | 201 + `Location` |
| Reemplazar | PUT /recursos/{id} | 200 |
| Modificar parte | PATCH /recursos/{id} | 200 |
| Borrar | DELETE /recursos/{id} | 204 |

Errores del cliente: `400` mal formado · `401` sin sesión · `403` sin permiso · `409` conflicto de estado · `422` no pasa validación · `429` demasiadas peticiones.

## Errores con forma fija
```json
{
  "error": {
    "codigo": "SALDO_INSUFICIENTE",
    "mensaje": "El saldo no alcanza para esta operación.",
    "campos": { "monto": "Debe ser menor o igual a 15000" }
  }
}
```
`codigo` es para programas; `mensaje` para personas. Nunca stack traces al cliente.

## Listas
- Paginación por cursor: `GET /facturas?limite=50&despues=abc123` → devuelve `siguiente`.
- Límite máximo impuesto por el servidor.
- Filtros y orden explícitos: `?estado=pagada&orden=-emitida_en`.

## Idempotencia
`POST` que cobra, envía o crea algo importante acepta `Idempotency-Key`; la misma clave devuelve la misma respuesta sin repetir el efecto.

## Fechas y dinero
Fechas en ISO 8601 con zona (`2026-11-24T22:30:00-03:00`). Dinero en enteros de la unidad mínima más moneda: `{ "monto": 15990, "moneda": "CLP" }`.

## Versionado
`/v1/` en la ruta. Agregar campos no rompe; quitar o renombrar sí → nueva versión y aviso de retiro.

## Documentación
Esquema OpenAPI generado desde el código, con un ejemplo por endpoint.
