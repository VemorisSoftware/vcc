---
name: seguridad
description: "ES: Prácticas de seguridad para aplicaciones: entrada externa, inyección, sesiones, permisos, secretos, archivos subidos, datos personales y despliegue. Úsalo al construir o revisar funciones sensibles. EN: Application security practices: external input, injection, sessions, permissions, secrets, uploads, personal data and deployment. Use when building or reviewing sensitive features."
---

# Seguridad

## Regla base
Todo lo que viene de afuera es hostil hasta validarlo: body, query, headers, cookies, archivos, webhooks y respuestas de terceros.

## Entrada
- Valida con un esquema en el borde y trabaja con el resultado tipado.
- Limita tamaños: cuerpo, archivos, listas, longitud de strings.
- Rechaza lo inesperado en vez de intentar limpiarlo.

## Inyección
| Destino | Seguro | Peligroso |
|---|---|---|
| SQL | Parámetros (`$1`, `?`) u ORM | Concatenar strings |
| Shell | `execFile(cmd, [args])` | `exec("cmd " + x)` |
| HTML | Escapado del framework | `innerHTML`, `v-html`, `dangerouslySetInnerHTML` |
| Rutas | `resolve` + verificar prefijo | `join(base, entradaUsuario)` sin verificar |
| URLs salientes | Lista permitida de hosts | Pedir cualquier URL que mande el usuario |

## Sesiones y contraseñas
- Contraseñas con argon2id (o bcrypt con costo ≥ 12).
- Cookies `HttpOnly`, `Secure`, `SameSite=Lax` o `Strict`.
- Rota la sesión al iniciar sesión; invalídala al cerrarla.
- Límite de intentos en login y recuperación.

## Permisos
Cada acción verifica en el servidor que *este* usuario puede hacer *esto* sobre *este* recurso. Ocultar un botón no es seguridad.

## Secretos
- Fuera del repo: variables de entorno o gestor de secretos.
- Uno por entorno; rotables sin redeploy de código.
- Si se filtró uno: rotarlo primero, investigar después.

## Archivos subidos
Verifica tipo por contenido (no por extensión), renombra, guarda fuera de la raíz pública, sirve con `Content-Disposition: attachment` si no son imágenes.

## Datos personales
Guarda lo mínimo, define cuánto tiempo, cifra lo sensible, nunca en logs. Considera la Ley 19.628 (Chile) y su actualización, y el RGPD si hay usuarios en Europa.

## Despliegue
HTTPS obligatorio, cabeceras (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`), CORS solo para orígenes conocidos, dependencias auditadas en CI.
