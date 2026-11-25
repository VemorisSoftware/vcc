# Cambios

## 0.4.0 — 2026-11-25
- **VCC Extra:** segundo plugin opcional con 64 agentes especialistas (`/plugin install vcc-extra@vcc`). Con VCC suman 82 agentes.
- Primera versión pública.

## 0.3.0 — 2026-11-24
- **C-Forge:** skill `c-forge`, agente `revisor-cforge`, reglas y `cforge check` automático en la revisión final.
- **Más lenguajes:** revisores y skills de Python, Rust, Go, Java/Kotlin, PHP/Laravel y Flutter; Vue en el revisor de TypeScript; skill de Cloudflare Workers.
- **Negocio y contenido:** skills de lanzamiento y marketing, inversionistas, SEO, redes sociales y video.
- **Aprendizaje automático:** VCC detecta comandos que fallan seguido entre sesiones y lo avisa al iniciar.
- **Costos:** costo en la barra de estado, registro local por sesión y `/costos`.
- **Escáner de configuración** de Claude Code (permisos, hooks, MCP, secretos, inyecciones) en `/escanear-seguridad`.
- **Segunda opinión** con Codex o Gemini CLI (`/segunda-opinion`).
- **Reglas por lenguaje** para el CLAUDE.md (`/reglas`).
- **Exportar** a Cursor, Codex y Gemini CLI (`/exportar`).

## 0.2.0 — 2026-11-24
- 11 agentes, 15 skills y 11 comandos (en español e inglés), escritos por Vemoris Software.
- Memoria por proyecto en `.vcc/`: `/aprender`, aprendizajes al iniciar sesión y foto automática del estado antes de compactar y al cerrar.
- Hooks automáticos: formateo con las herramientas del proyecto, revisión final (restos de depuración y errores de TypeScript) y notificaciones de escritorio.
- Barra de estado con modelo, carpeta, rama y perfil (`/barra-estado`).
- Hooks de seguridad para comandos y archivos, con perfiles `minimo` / `estandar` / `estricto` y mensajes en español o inglés.
- Sin red, sin telemetría y sin dependencias.
