---
name: dependencias
description: "ES: Decidir si reutilizar, adoptar una librería o escribir algo propio, y cómo evaluar una dependencia (mantenimiento, licencia, seguridad, tamaño). Úsalo antes de escribir una utilidad nueva o de agregar un paquete. EN: Deciding whether to reuse, adopt a library or write your own, and how to vet a dependency (maintenance, license, security, size). Use before writing a new utility or adding a package."
---

# Dependencias

## Antes de escribir algo
1. **¿Ya existe en el repo?** Busca por concepto, no solo por nombre (`git grep -i "rut\|dígito verificador"`).
2. **¿Lo resuelve algo ya instalado?** Revisa el manifiesto (`package.json`, `Package.swift`, `Cargo.toml`, `CMakeLists.txt`).
3. **¿Lo resuelve la plataforma?** `Intl`, `crypto.randomUUID`, `URL`, Foundation, la librería estándar.
4. **¿Existe un paquete bueno?** Evalúalo con la tabla de abajo.

## Evaluar un paquete
| Criterio | Bien | Alerta |
|---|---|---|
| Mantenimiento | Releases en el último año, issues respondidos | Archivado, PRs abandonados |
| Licencia | MIT, Apache-2.0, BSD, ISC | GPL/AGPL en producto cerrado, sin licencia |
| Seguridad | Sin avisos abiertos | CVEs sin parche |
| Peso | Proporcional a lo que aporta | 2 MB para formatear una fecha |
| Dependencias propias | Pocas | Árbol enorme |
| Instalación | Sin scripts de instalación | `postinstall` que descarga o ejecuta cosas |

## Decidir
- Menos de ~30 líneas y sin casos raros → escríbelo tú, con pruebas.
- Algo con muchos bordes (fechas, criptografía, parsers, Unicode) → librería probada; nunca lo improvises.
- Criptografía → siempre la librería estándar o una reconocida.

## Al agregarla
Versión fijada en el lockfile, nota de por qué en el PR, y auditoría (`npm audit`, `cargo audit`, `pip-audit`) en CI.
