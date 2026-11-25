---
name: audio-tiempo-real
description: "ES: Reglas para el hilo de audio y código de latencia crítica (plugins VST3/AU, JUCE, motores de audio, DSP): qué está prohibido, cómo comunicar hilos, preparación y cómo medir. Úsalo al escribir o revisar procesamiento de audio. EN: Rules for the audio thread and latency-critical code (VST3/AU plugins, JUCE, audio engines, DSP): what's forbidden, cross-thread communication, preparation and measurement. Use when writing or reviewing audio processing."
---

# Audio en tiempo real

## El presupuesto
Cada bloque tiene un plazo fijo: `tamaño_bloque / frecuencia`. A 64 muestras y 48 kHz son 1,33 ms, y el host necesita parte de ese tiempo. Si te pasas una vez, se escucha un click.

## Prohibido dentro de `process` / `processBlock`
| Prohibido | Por qué | En su lugar |
|---|---|---|
| `new`, `malloc`, `push_back` que crece, `std::string`, `std::function` que reserva | El asignador puede bloquear | Buffers reservados en `prepare` |
| `std::mutex`, esperas, `sleep` | Inversión de prioridad | Atómicos y colas sin bloqueo |
| Archivos, red, logs, `printf` | Llamadas al sistema | Cola de mensajes hacia un hilo de baja prioridad |
| Excepciones | Tiempo impredecible | Códigos de estado |
| Llamadas a UI o a código desconocido | No sabes qué hacen | Mensajes asíncronos |

## Comunicar hilos
- **Parámetros:** `std::atomic<float>` escrito por la UI; el hilo de audio lo lee una vez por bloque y lo suaviza muestra a muestra.
- **Eventos:** cola de un productor y un consumidor, de capacidad fija.
- **Objetos pesados** (respuestas al impulso, tablas, modelos): se construyen fuera, se entregan con un intercambio atómico de puntero, y el objeto viejo se destruye fuera del hilo de audio.

## Preparación
En `prepareToPlay` / `setupProcessing`: reserva todo según el bloque máximo y la frecuencia, precalcula coeficientes, resetea estados. Si la frecuencia cambia, todo se recalcula ahí, no en `process`.

## Números
- Activa flush-to-zero / denormals-are-zero al inicio del callback (`juce::ScopedNoDenormals`).
- Usa `float`; acumula en `double` solo donde el error se nota (filtros IIR de orden alto, osciladores largos).

## Medir
- Tiempo por bloque en percentiles altos (p99, p99,9), nunca el promedio.
- Prueba con bloques de 16 a 2048 muestras y frecuencias de 44,1 a 192 kHz.
- Pruebas nulas: misma entrada contra una salida de referencia, diferencia por debajo de -120 dBFS.
- TSan en las pruebas y, si existe, un detector de reservas en tiempo real.

## Optimizar en este orden
Algoritmo → acceso a memoria contiguo → sacar ramas del bucle interno → vectorizar (SIMD) solo después de medir.
