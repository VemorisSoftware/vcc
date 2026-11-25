---
name: go
description: "ES: Go claro y concurrente sin fugas: estructura de paquetes, errores con contexto, goroutines con fin definido, context, interfaces pequeñas y pruebas con tablas. Úsalo al escribir o revisar Go. EN: Clear, leak-free concurrent Go: package layout, errors with context, goroutines with a defined end, context, small interfaces and table tests. Use when writing or reviewing Go."
---

# Go

## Estructura
```
cmd/servidor/main.go   arranque y cableado
internal/facturas/     lógica por dominio
internal/plataforma/   base de datos, http, config
```
Paquetes por dominio, no por tipo (`models`, `utils`).

## Errores
```go
f, err := repo.Buscar(ctx, folio)
if err != nil {
    return fmt.Errorf("buscar factura %d: %w", folio, err)
}
```
Errores centinela con `errors.New` y comparación con `errors.Is`; tipos de error con `errors.As`.

## Concurrencia
Cada goroutine tiene un dueño y una forma de terminar:
```go
g, ctx := errgroup.WithContext(ctx)
for _, id := range ids {
    g.Go(func() error { return procesar(ctx, id) })
}
if err := g.Wait(); err != nil { return err }
```
- Quien escribe en un canal lo cierra.
- `go test -race` en CI, siempre.

## Context
Primer parámetro de toda función con I/O: `ctx context.Context`. Timeouts con `context.WithTimeout`. Nunca guardes un context en un struct.

## Interfaces
Pequeñas y definidas donde se usan: `type BuscadorFacturas interface { Buscar(ctx context.Context, folio int64) (Factura, error) }`. Acepta interfaces, devuelve structs.

## Pruebas
```go
func TestValidarRut(t *testing.T) {
    casos := []struct{ rut string; ok bool }{
        {"11111111-1", true},
        {"11111111-2", false},
    }
    for _, c := range casos {
        t.Run(c.rut, func(t *testing.T) {
            if got := ValidarRut(c.rut); got != c.ok { t.Fatalf("got %v, want %v", got, c.ok) }
        })
    }
}
```
