---
name: c-forge
description: "ES: Programar en C-Forge (archivos .cfv, CLI cforge): sintaxis bilingüe, tipos, Ok/Error y coincidir, async, punteros seguros, comptime, biblioteca estándar, interoperabilidad con C/C++/Rust/JS/Java/.NET, pruebas y compilación nativa o wasm. Úsalo al escribir, revisar o depurar código C-Forge o el propio repo de C-Forge. EN: Programming in C-Forge (.cfv files, cforge CLI): bilingual syntax, types, Ok/Error and match, async, safe pointers, comptime, stdlib, interop with C/C++/Rust/JS/Java/.NET, tests and native or wasm builds. Use when writing, reviewing or debugging C-Forge code or the C-Forge repo itself."
---

# C-Forge

Lenguaje de Vemoris Software. Archivos `.cfv` en UTF-8, CLI `cforge`. Compilador, runtime y biblioteca estándar escritos en C-Forge.

## Antes de escribir código
- Revisa la versión: `cforge --version`. Lo que no esté en `ESPECIFICACION.md`, `capabilities.json` o en `tests/cfv/` del repo de C-Forge se considera experimental: no lo inventes.
- Para dudas de sintaxis, busca un ejemplo real en `tests/cfv/*.cfv` o `ejemplos/` antes de suponer.

## Sintaxis base
```cfv
// comentario; el punto y coma es opcional
sea nombre = "C-Forge"
sea intentos: numero = 3
sea activo: booleano = verdadero

funcion sumar(a: numero, b: numero): numero {
    retornar a + b
}

si (intentos > 0) { mostrar("quedan") } sino { mostrar("no quedan") }
mientras (intentos > 0) { intentos = intentos - 1 }
para x en [1, 2, 3] { mostrar(x) }

clase Contador {
    funcion constructor(inicial) { esto.valor = inicial }
    funcion incrementar() { esto.valor = esto.valor + 1 }
}
sea c = nuevo Contador(0)
```
Tipos de valor: `nulo`, `numero`, `entero`, `texto`, `booleano`, `lista`, `mapa`, `tupla`, `conjunto`. Los enteros no tienen límite (no se desbordan).

**Bilingüe:** las palabras clave en inglés son alias (`function`, `let`, `if`, `for`, `return`, `class`, `this`, `try`/`catch`, `print`, `assert`). En un mismo archivo usa un solo idioma; en el repo de C-Forge, el estilo es español.

## Errores
```cfv
intentar { lanzar "fallo" } capturar (e) { mostrar(e) } finalmente { mostrar("fin") }

funcion dividir(a, b) {
    si (b == 0) { retornar Error("división por cero") }
    retornar Ok(a / b)
}
funcion mas_uno(a, b) {
    sea q = dividir(a, b)?        // ? propaga Error / Ninguno
    retornar Ok(q + 1)
}
sea texto = coincidir dividir(10, 2) {
    Ok(v) => "ok " + v,
    Error(e) => "error: " + e,
    _ => "otro"
}
sea nombre = usuario?.nombre ?? "Anónimo"
```
Prefiere `Ok`/`Error` y `Alguno`/`Ninguno` para fallos esperables; `lanzar` para lo inesperado.

## Asincronía
```cfv
async funcion cuadrado(x) { retornar x * x }     // también: asincrona funcion
sea total = await cuadrado(4)                    // también: aguardar
```
Llamar a una función async devuelve una tarea; lanza varias y espéralas después para paralelizar.

## Punteros seguros y comptime
```cfv
funcion buscar(inicio: *Nodo, x: entero): ?*Nodo { … }   // *T nunca nulo, ?T opcional
si (r) |nodo| { mostrar(nodo.valor) }                     // desempaque seguro
```
Usa `?T` + desempaque en vez de comparar con `nulo` y acceder directo.

## Biblioteca estándar
`importar "modulo"`: `matematica`, `lista`, `mapa`, `colecciones`, `algoritmos`, `texto`, `json`, `errores`, `fecha`, `numero`, `base64`, `regex`, `concurrencia`, `crypto`, `red` (HTTP/HTTPS, TCP, UDP, WebSocket), `tls`, `redis`, `db`, `sqlite`, `sdl`, `gl`, `apple`, `navegador` y más en `stdlib/`.
```cfv
importar "db"
sea db = db_conectar("datos.db")
db_consulta_p(db, "INSERT INTO notas (texto) VALUES (?)", ["hola"])   // siempre parámetros
```

## Interoperabilidad
| Origen | Cómo |
|---|---|
| C | `extern "libc" funcion strlen(s: texto): largo` o `cforge bindgen cabecera.h --lib nombre` |
| C++ | `cforge bindgen geo.hpp --fuentes geo.cpp` → `importar "cpp:geo"` |
| Rust | `cforge bindgen rust:crate[@versión]` → `importar "rust:crate"` |
| JS / npm | `extern "npm:paquete" funcion f(…)` con `--target wasm` |
| TypeScript | `cforge bindgen paquete/index.d.ts --lib paquete` |
| Java | `importar "java"` (JNI) |
| C# / .NET | `importar "dotnet"` |
| HTML / CSS | `importar "navegador"` |
Los objetos de C++/Rust llegan como valores opacos (`Clase_nuevo`, `Clase_metodo`, `Clase_liberar`): libéralos siempre.

## CLI
| Tarea | Comando |
|---|---|
| Ejecutar | `cforge archivo.cfv` |
| Verificar sin ejecutar | `cforge check archivo.cfv` |
| Pruebas | `cforge test archivo.cfv` (usa `afirmar(cond, "mensaje")`) |
| Formato | `cforge fmt --check rutas` |
| Ejecutable nativo | `cforge build archivo.cfv -o app [--release] [--target windows\|macos]` |
| WebAssembly | `cforge build app.cfv --target wasm --release -o app` |
| Biblioteca | `cforge build archivo.cfv --lib -o libx.a` |
| Proyecto nuevo | `cforge new nombre` · `cforge init` |
| Documentación | `cforge doc archivo.cfv` |
| Diagnóstico | `cforge doctor` |

## Pruebas
```cfv
funcion igual(a, b, que) { afirmar(a == b, que + ": " + a + " != " + b) }
igual(sumar(2, 3), 5, "suma simple")
```
Un archivo de prueba por tema; cada bug arreglado deja una prueba.

## Trabajar en el repo de C-Forge
- Construir: `make` (la semilla compila `./cforge`). Gate completo: `make release-check`.
- Pruebas puntuales: `make test`, `make stdlib-check`, `make tipos-check`, `make wasm-check`.
- Todo cambio con prueba en `tests/` y entrada en `CHANGELOG.md` (sección "Sin publicar").
- No agregar dependencias de C, C++ ni de otros lenguajes al núcleo: C-Forge es 100 % autoalojado. La interoperabilidad vive en `bindgen` y en módulos opcionales.
- Nombres de librerías portadas: propios de C-Forge, no los del original.
- Seguridad primero: entradas hostiles no deben cerrar el runtime; los errores deben ser capturables.
