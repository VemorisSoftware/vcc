---
name: python
description: "ES: Python moderno y mantenible: estructura de proyecto con uv/pyproject, tipos, dataclasses y Pydantic, errores, asincronía y pruebas con pytest. Úsalo al escribir o revisar Python. EN: Modern, maintainable Python: project layout with uv/pyproject, typing, dataclasses and Pydantic, errors, async and pytest. Use when writing or reviewing Python."
---

# Python

## Proyecto
```
mi-proyecto/
  pyproject.toml   dependencias, ruff, mypy, pytest
  src/mi_paquete/
  tests/
```
Entornos y dependencias con `uv` (`uv init`, `uv add httpx`, `uv run pytest`). Lockfile versionado.

## Tipos
- Anota todas las funciones públicas; `mypy --strict` o `pyright` en CI.
- Datos internos: `@dataclass(frozen=True, slots=True)`.
- Datos que entran desde afuera (HTTP, JSON, env): modelos Pydantic.
```python
from dataclasses import dataclass
from decimal import Decimal

@dataclass(frozen=True, slots=True)
class Linea:
    descripcion: str
    cantidad: int
    precio_unitario: Decimal   # dinero: Decimal, nunca float
```

## Errores
```python
class ErrorFacturacion(Exception): ...

try:
    respuesta = cliente.get(url, timeout=10)
    respuesta.raise_for_status()
except httpx.HTTPError as e:
    raise ErrorFacturacion(f"No se pudo consultar {url}") from e
```
Nada de `except:` desnudo. Recursos siempre con `with`.

## Asincronía
`asyncio` + `httpx.AsyncClient`. Nada bloqueante dentro de `async def`; si no hay alternativa, `await asyncio.to_thread(func)`. Varias tareas: `async with asyncio.TaskGroup() as tg:`.

## Pruebas
```python
import pytest

@pytest.mark.parametrize("rut, valido", [("11111111-1", True), ("11111111-2", False)])
def test_validar_rut(rut: str, valido: bool) -> None:
    assert validar_rut(rut) is valido
```
Fixtures para preparar datos; `tmp_path` para archivos; nada de red real en pruebas unitarias.

## Calidad
`ruff check` + `ruff format` (reemplazan flake8, isort y black). f-strings, `pathlib` en vez de `os.path`, `logging` en vez de `print`.
