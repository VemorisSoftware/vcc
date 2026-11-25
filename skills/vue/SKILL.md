---
name: vue
description: "ES: Vue 3 con Composition API y TypeScript: reactividad sin trampas, componentes con props y emits tipados, composables, Pinia, rendimiento y pruebas. Úsalo al escribir o revisar Vue o Nuxt. EN: Vue 3 with Composition API and TypeScript: pitfall-free reactivity, typed props and emits, composables, Pinia, performance and tests. Use when writing or reviewing Vue or Nuxt."
---

# Vue

## Componentes
```vue
<script setup lang="ts">
const props = defineProps<{ factura: Factura }>()
const emit = defineEmits<{ anular: [folio: number] }>()
const total = computed(() => props.factura.lineas.reduce((s, l) => s + l.cantidad * l.precio, 0))
</script>

<template>
  <article>
    <h2>Factura {{ factura.folio }}</h2>
    <p>Total: {{ total }}</p>
    <button @click="emit('anular', factura.folio)">Anular</button>
  </article>
</template>
```
Las props no se mutan: se emite un evento.

## Reactividad
- `ref` para valores, `reactive` para objetos que no vas a reemplazar.
- Desestructurar un `reactive` pierde la reactividad: usa `toRefs`.
- `computed` para valores derivados; `watch` solo para efectos (llamar una API, guardar).

## Composables
Lógica reutilizable en `useAlgo()`: recibe refs, devuelve refs, limpia lo que crea con `onScopeDispose`.

## Estado global
Pinia con stores pequeños por dominio. No metas en Pinia lo que es estado de un solo componente.

## Rendimiento
`v-for` con `:key` estable, `v-show` para alternar seguido y `v-if` para lo que rara vez aparece, componentes asíncronos para pantallas pesadas, `shallowRef` para datos grandes que no cambian por dentro.

## Seguridad
`v-html` solo con HTML confiable o sanitizado.

## Pruebas
Vitest + Vue Test Utils; Playwright para los flujos completos.
