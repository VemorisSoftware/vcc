---
name: java-kotlin
description: "ES: Java 21+ y Kotlin: modelado con records y data classes, nulos, excepciones, concurrencia (virtual threads, corrutinas), Spring Boot y pruebas. Úsalo al escribir o revisar Java o Kotlin. EN: Java 21+ and Kotlin: modeling with records and data classes, nulls, exceptions, concurrency (virtual threads, coroutines), Spring Boot and tests. Use when writing or reviewing Java or Kotlin."
---

# Java y Kotlin

## Modelar
```java
public record Linea(String descripcion, int cantidad, BigDecimal precioUnitario) {
    public Linea {
        if (cantidad <= 0) throw new IllegalArgumentException("cantidad debe ser positiva");
    }
}
sealed interface Pago permits Pendiente, Aprobado, Rechazado {}
```
```kotlin
data class Linea(val descripcion: String, val cantidad: Int, val precioUnitario: BigDecimal)
sealed interface Pago { data object Pendiente : Pago; data class Aprobado(val codigo: String) : Pago }
```
Dinero en `BigDecimal`, nunca `double`.

## Nulos
- Java: `Optional` en retornos que pueden faltar; nunca `Optional` en campos ni parámetros.
- Kotlin: tipos no nulos por defecto; evita `!!`; trata los tipos que vienen de Java como posibles nulos.

## Excepciones
Específicas del dominio, con causa (`new ErrorFactura("…", e)`). Recursos con try-with-resources (Java) o `use {}` (Kotlin).

## Concurrencia
- Java 21: virtual threads (`Executors.newVirtualThreadPerTaskExecutor()`) para I/O.
- Kotlin: corrutinas estructuradas (`coroutineScope`, `viewModelScope`), nunca `GlobalScope`; `Dispatchers.IO` para bloqueos.

## Spring Boot
Inyección por constructor, `@Transactional` en métodos públicos de servicios, DTOs con `@Valid` en los controladores, consultas con `JOIN FETCH` o `@EntityGraph` para evitar N+1, configuración en `application.yml` con perfiles.

## Pruebas
JUnit 5 + AssertJ (Java) o Kotest/JUnit (Kotlin). `@SpringBootTest` solo para integración; la lógica se prueba sin Spring. Testcontainers para bases de datos reales.
