---
name: php-laravel
description: "ES: PHP 8.3+ y Laravel: tipos estrictos, validación con Form Requests, autorización con Policies, Eloquent sin N+1, colas y pruebas con Pest/PHPUnit. Úsalo al escribir o revisar PHP o Laravel. EN: PHP 8.3+ and Laravel: strict types, Form Request validation, Policy authorization, N+1-free Eloquent, queues and Pest/PHPUnit tests. Use when writing or reviewing PHP or Laravel."
---

# PHP y Laravel

## Base
`declare(strict_types=1);` en cada archivo, tipos en parámetros, retornos y propiedades, `readonly` y enums nativos.

## Flujo de una petición
```
Ruta → Form Request (valida) → Controller (delgado) → Action/Service (lógica) → Model
                                   ↑ Policy (autoriza)
```
```php
public function store(GuardarFacturaRequest $request, CrearFactura $crear): JsonResponse
{
    $this->authorize('create', Factura::class);
    $factura = $crear($request->validated());
    return FacturaResource::make($factura)->response()->setStatusCode(201);
}
```

## Eloquent
- `$fillable` explícito; nunca `$guarded = []`.
- Carga relaciones con `with()`; activa `Model::preventLazyLoading()` en desarrollo.
- Tablas grandes: `chunkById` o `cursor`.
- Dinero en enteros (pesos) o `decimal` con casts.

## Seguridad
Blade escapa con `{{ }}`; `{!! !!}` solo con HTML confiable. Nada de `DB::raw` con variables. Archivos subidos con `store()` y nombre generado. `APP_DEBUG=false` en producción.

## Colas
Trabajos lentos (correos, PDFs, APIs externas) a la cola, con `$tries`, `backoff` y `failed()`. Que sean idempotentes.

## Pruebas
```php
it('crea una factura', function () {
    $usuario = User::factory()->create();
    $this->actingAs($usuario)
        ->postJson('/api/facturas', ['cliente_id' => 1, 'lineas' => []])
        ->assertCreated();
});
```
Factories para datos, `RefreshDatabase`, y `Http::fake()` para servicios externos.
