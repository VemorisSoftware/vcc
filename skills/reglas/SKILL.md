---
name: reglas
description: "ES: Reglas cortas por lenguaje (TypeScript, Swift, C++, Python, Rust, Go, Java/Kotlin, PHP, Flutter, C-Forge) para instalar en el CLAUDE.md de un proyecto como estándar permanente. Úsalo con /reglas o cuando el usuario quiera fijar estándares de código en un proyecto. EN: Short per-language rules (TypeScript, Swift, C++, Python, Rust, Go, Java/Kotlin, PHP, Flutter, C-Forge) to install in a project's CLAUDE.md as a permanent standard. Use with /rules or when the user wants to set code standards for a project."
---

# Reglas por lenguaje

Los archivos de reglas están en esta misma carpeta del skill: `comun.md` y uno por lenguaje (`typescript.md`, `swift.md`, `cpp.md`, `python.md`, `rust.md`, `go.md`, `jvm.md`, `php.md`, `flutter.md`, `c-forge.md`).

## Cómo instalarlas en un proyecto
1. Detecta los lenguajes del proyecto por sus manifiestos (`package.json`, `Package.swift`, `CMakeLists.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `build.gradle*`/`pom.xml`, `composer.json`, `pubspec.yaml`, `cforge.json`/`*.cfv`).
2. Propón al usuario: `comun.md` + los archivos de esos lenguajes.
3. Muestra el texto que se agregará y **espera confirmación**.
4. Agrégalo al `CLAUDE.md` del proyecto dentro de una sección marcada, reemplazando una sección VCC anterior si existe:
   ```
   <!-- vcc:reglas:inicio -->
   ## Reglas del proyecto (VCC)
   …contenido…
   <!-- vcc:reglas:fin -->
   ```
5. No toques el resto del `CLAUDE.md`.

Las reglas son cortas a propósito: se cargan en cada sesión y consumen contexto.
