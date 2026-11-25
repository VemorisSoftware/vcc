---
name: calidad-codigo
description: "ES: Criterios de código legible y mantenible en cualquier lenguaje: nombres, tamaño, flujo, estado, comentarios y organización por funcionalidad. Úsalo al escribir o revisar código. EN: Readable, maintainable code criteria in any language: naming, size, flow, state, comments and feature-based organization. Use when writing or reviewing code."
---

# Calidad de código

## La prueba
¿Alguien que no lo escribió entiende qué hace y puede cambiarlo sin miedo en 10 minutos?

## Nombres
- Dicen el *qué*, no el *cómo*: `clientesMorosos` mejor que `listaFiltrada`.
- Booleanos que se leen como pregunta: `estaActivo`, `puedeEditar`.
- Funciones con verbo: `calcularTotal`, `enviarFactura`.
- Un solo idioma para identificadores en todo el proyecto.

## Tamaño y flujo
- Una función hace una cosa; si necesitas "y" para describirla, son dos.
- Retornos tempranos en vez de `if` anidados.
- Más de 3 o 4 parámetros → agrúpalos en un objeto.
- Archivos que pasan ~400 líneas suelen esconder dos módulos.

## Estado
- Prefiere valores que no cambian; muta solo donde sea necesario y local.
- Nada de estado global mutable.
- Un dato vive en un solo lugar; el resto se calcula.

## Comentarios
Explican *por qué* (una restricción, un bug de un tercero, una decisión de negocio). El *qué* lo debe contar el código. El código comentado se borra.

## Organización
Agrupa por funcionalidad:
```
src/
  facturas/   modelo, servicio, rutas, pruebas
  clientes/
  compartido/ solo lo realmente común
```

## Señales de problema
Números mágicos · banderas booleanas que cambian el comportamiento de una función · `utils` gigantes · duplicación con pequeñas diferencias · capturar errores para ignorarlos.
