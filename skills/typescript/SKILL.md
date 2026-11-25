---
name: typescript
description: "ES: TypeScript con tipos que dicen la verdad: configuración estricta, modelado con uniones, validación en bordes, asincronía segura y módulos claros. Úsalo al escribir o revisar TypeScript. EN: TypeScript with truthful types: strict config, modeling with unions, boundary validation, safe async and clear modules. Use when writing or reviewing TypeScript."
---

# TypeScript

## tsconfig mínimo
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true
  }
}
```

## Modelar con tipos
Haz imposibles los estados inválidos:
```ts
type Pago =
  | { estado: 'pendiente'; creadoEn: Date }
  | { estado: 'aprobado'; creadoEn: Date; codigoAutorizacion: string }
  | { estado: 'rechazado'; creadoEn: Date; motivo: string }

function describir(p: Pago): string {
  switch (p.estado) {
    case 'pendiente': return 'Esperando confirmación'
    case 'aprobado':  return `Aprobado (${p.codigoAutorizacion})`
    case 'rechazado': return `Rechazado: ${p.motivo}`
  }
}
```
IDs que no se confunden entre sí: `type ClienteId = string & { readonly _t: 'ClienteId' }`.

## Bordes
Lo externo entra como `unknown` y sale validado:
```ts
const Factura = z.object({ folio: z.number().int(), total: z.number().nonnegative() })
type Factura = z.infer<typeof Factura>
const factura = Factura.parse(await res.json())
```

## Asincronía
- Tareas independientes en paralelo: `await Promise.all([...])`.
- Lint `no-floating-promises` activado.
- Cancelación con `AbortSignal` en fetch y tareas largas.

## Evitar
`any` (usa `unknown`) · `as` para "convencer" al compilador · `!` · `enum` (usa uniones de literales o `as const`) · tipos `Function` y `Object`.

## Módulos
Exporta lo mínimo. Tipos públicos junto a su módulo. Evita archivos `index.ts` que reexportan todo el proyecto.
