---
name: cloudflare-workers
description: "ES: Construir en Cloudflare (Workers, Pages, D1, KV, R2, Durable Objects, Queues, Email Workers) con wrangler: configuración, secretos, límites, enrutamiento y pruebas locales. Úsalo al crear o revisar proyectos en Cloudflare. EN: Building on Cloudflare (Workers, Pages, D1, KV, R2, Durable Objects, Queues, Email Workers) with wrangler: config, secrets, limits, routing and local tests. Use when creating or reviewing Cloudflare projects."
---

# Cloudflare Workers

## Base
```ts
export interface Env {
  DB: D1Database
  ARCHIVOS: R2Bucket
  CACHE: KVNamespace
  API_KEY: string   // secreto
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url)
    if (url.pathname === '/salud') return Response.json({ ok: true })
    return new Response('No encontrado', { status: 404 })
  },
} satisfies ExportedHandler<Env>
```
Tipos de bindings con `wrangler types`.

## Configuración (`wrangler.jsonc`)
- `compatibility_date` reciente y fija; `compatibility_flags: ["nodejs_compat"]` si usas APIs de Node.
- Un bloque `env` por entorno (`staging`, `production`) con sus propios bindings.
- Secretos con `wrangler secret put NOMBRE`; nunca en `wrangler.jsonc` ni en el código. Locales en `.dev.vars` (ignorado por git).

## Elegir almacenamiento
| Necesito… | Usa |
|---|---|
| Datos relacionales y consultas | D1 (SQLite) |
| Lecturas muy rápidas, escrituras raras, consistencia eventual | KV |
| Archivos y objetos grandes | R2 |
| Estado con consistencia fuerte, contadores, salas, WebSockets | Durable Objects |
| Trabajo en segundo plano con reintentos | Queues |
| Tareas periódicas | Cron Triggers |

## D1
Siempre consultas preparadas: `env.DB.prepare('SELECT * FROM facturas WHERE folio = ?').bind(folio).first()`. Migraciones con `wrangler d1 migrations create/apply`. Varias escrituras atómicas con `env.DB.batch([...])`.

## Límites a recordar
CPU por petición limitada (revisa tu plan), sin sistema de archivos, memoria acotada. Trabajo que no debe bloquear la respuesta: `ctx.waitUntil(promesa)`. Tareas largas: Queues o Workflows.

## Correo
Email Routing + Email Workers para recibir y procesar; para enviar, la API de envío de Cloudflare o un proveedor transaccional. Configura SPF, DKIM y DMARC del dominio.

## Seguridad
Valida entrada con esquemas, CORS explícito, autentica cada ruta privada (Cloudflare Access o tokens), rate limiting con la regla de Cloudflare o un Durable Object.

## Local y despliegue
`wrangler dev` (usa Miniflare con bindings locales), pruebas con `@cloudflare/vitest-pool-workers`, `wrangler deploy --env production`. Revisa logs con `wrangler tail`.
