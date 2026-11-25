---
name: cpp-moderno
description: "ES: C++17/20 seguro y claro: propiedad con RAII, interfaces sin copias innecesarias, errores, hilos, CMake y pruebas con sanitizers. Úsalo al escribir o revisar C++. EN: Safe, clear C++17/20: RAII ownership, copy-free interfaces, errors, threads, CMake and sanitizer-backed tests. Use when writing or reviewing C++."
---

# C++ moderno

## Propiedad
| Quiero… | Uso |
|---|---|
| Ser el único dueño | `std::unique_ptr<T>` o un miembro por valor |
| Compartir dueño (raro) | `std::shared_ptr<T>` |
| Mirar sin ser dueño | `T&`, `const T&`, `T*` (puede ser nulo) |
| Mirar un rango | `std::span<T>` |
| Mirar texto | `std::string_view` |

Si una clase no maneja recursos directamente, no declares destructor, copia ni move: el compilador lo hace bien.

## Interfaces
```cpp
[[nodiscard]] std::optional<Usuario> buscar(std::string_view email) const;
void procesar(std::span<const float> muestras) noexcept;
Factura(std::string folio, std::vector<Linea> lineas)  // por valor y luego std::move
  : folio_(std::move(folio)), lineas_(std::move(lineas)) {}
```

## Constantes y tipos
`constexpr` en vez de macros · `enum class` · `auto` cuando el tipo es obvio o irrelevante · `static_cast` explícitos, nunca casts estilo C.

## Errores
- Esperables: `std::optional`, `std::expected` (C++23) o un tipo resultado propio.
- Excepcionales: excepciones, pero nunca escapando de destructores ni en código de tiempo real.

## Hilos
`std::jthread` + `std::stop_token` · `std::scoped_lock` para varios mutex · `std::atomic` para banderas y contadores · documenta qué hilo es dueño de cada miembro.

## CMake
```cmake
target_compile_features(miapp PRIVATE cxx_std_20)
target_compile_options(miapp PRIVATE
  $<$<CXX_COMPILER_ID:GNU,Clang,AppleClang>:-Wall -Wextra -Wpedantic>
  $<$<CXX_COMPILER_ID:MSVC>:/W4>)
```
Configura un preset de pruebas con `-fsanitize=address,undefined` y otro con `thread`.

## Pruebas
GoogleTest o Catch2, corriendo en CI con sanitizers. Cada bug arreglado deja una prueba.
