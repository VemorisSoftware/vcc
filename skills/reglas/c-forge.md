### C-Forge
- `cforge check` y `cforge fmt --check` limpios en cada `.cfv` cambiado.
- Fallos esperables con `Ok`/`Error` y `coincidir` con rama `_`; `lanzar` solo para lo inesperado.
- Opcionales con `?T` y desempaque `si (x) |v| { … }`; nada de acceder a posibles `nulo`.
- SQL siempre con parámetros (`db_consulta_p`).
- Un solo idioma de palabras clave por archivo.
- En el repo de C-Forge: sin dependencias de C/C++ en el núcleo; cada cambio con prueba en `tests/` y entrada en `CHANGELOG.md`.
