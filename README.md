# VCC — Vemoris Claude Code

🇪🇸 Español · [🇬🇧 English](README.en.md)

Agentes, skills, comandos, memoria que aprende y hooks de seguridad **en español e inglés** para [Claude Code](https://docs.claude.com/en/docs/claude-code/overview). Incluye soporte de primera para **C-Forge**.

Liviano y auditable: los hooks no envían nada fuera de tu equipo y no dependen de ningún paquete.

## Instalación

```
/plugin marketplace add VemorisSoftware/vcc
/plugin install vcc@vcc
```

Requiere Node.js 18 o superior. Para usar VCC en **Cursor, Codex o Gemini CLI**, ver [`/exportar`](#otras-herramientas).

### VCC Extra (opcional): 64 agentes especialistas más

```
/plugin install vcc-extra@vcc
```

Con VCC Extra tienes **82 agentes** en total. Frameworks (Next.js, React Native, Svelte, Angular, Astro, NestJS, Django, FastAPI, Spring Boot, .NET, Compose, Tauri/Electron), juegos y audio (Unity, Unreal, Godot, JUCE, DSP, three.js, shaders), datos e IA (PostgreSQL, SQLite/D1, Redis, MongoDB, análisis, ML, apps con IA, servidores MCP), infraestructura (Docker, Kubernetes, Terraform, GitHub Actions, Cloudflare, AWS, observabilidad, DNS y correo), calidad y seguridad (E2E, rendimiento, accesibilidad, dependencias, concurrencia, fuzzing, criptografía, auditoría web, compiladores, WebAssembly), producto (documentación, traducción ES/EN, diseño UI, textos de interfaz, sistemas de diseño, migraciones, GraphQL) y negocio (pagos con Webpay, facturación electrónica SII, temas legales, SEO, marketing, redacción, inversionistas, gestión de proyectos, publicación de versiones y App Store).

Va aparte para que VCC siga liviano: instálalo solo si lo necesitas.

## Agentes (18)

| Agente | Para qué |
|---|---|
| `planificador` · `arquitecto` | Plan por etapas · estructura y decisiones |
| `revisor` · `revisor-seguridad` | Revisión del diff · seguridad |
| `revisor-typescript` | TypeScript, JavaScript, React, Vue, Node |
| `revisor-swift` | Swift 6, SwiftUI, Xcode |
| `revisor-cpp` | C++ moderno, JUCE, VST3, audio en tiempo real |
| `revisor-cforge` | C-Forge (`.cfv`) y el repo de C-Forge |
| `revisor-python` · `revisor-rust` · `revisor-go` | Python · Rust · Go |
| `revisor-jvm` · `revisor-php` · `revisor-flutter` | Java/Kotlin · PHP/Laravel · Dart/Flutter |
| `guia-tdd` · `depurador` | Pruebas primero · causa raíz de bugs |
| `resolvedor-build` · `refactorizador` | Build en verde · limpieza sin cambiar comportamiento |

## Skills (30)

- **Lenguajes:** `c-forge` · `typescript` · `vue` · `swiftui` · `swift-concurrencia` · `cpp-moderno` · `audio-tiempo-real` · `python` · `rust` · `go` · `java-kotlin` · `php-laravel` · `flutter`
- **Plataformas:** `cloudflare-workers` · `api-rest`
- **Forma de trabajar:** `tdd` · `listo-para-pr` · `seguridad` · `calidad-codigo` · `errores` · `git` · `dependencias` · `contexto` · `memoria-proyecto` · `reglas`
- **Negocio y contenido:** `lanzamiento-marketing` · `inversionistas` · `seo` · `redes-sociales` · `video`

## Comandos (15, en los dos idiomas)

| Español | English | Qué hace |
|---|---|---|
| `/planificar` | `/plan` | Plan + espera tu aprobación |
| `/revisar` | `/review` | Revisión del diff actual |
| `/segunda-opinion` | `/second-opinion` | Revisión cruzada con Codex o Gemini CLI |
| `/verificar` | `/verify` | ¿Listo para PR? |
| `/arreglar-build` | `/fix-build` | Deja el build en verde |
| `/depurar` | `/debug` | Encuentra y corrige la causa de un bug |
| `/refactorizar` | `/refactor` | Limpieza con confirmación |
| `/escanear-seguridad` | `/security-scan` | Secretos, dependencias y configuración de Claude Code |
| `/aprender` | `/learn` | Guarda un aprendizaje del proyecto |
| `/guardar-sesion` | `/save-session` | Guarda dónde quedó el trabajo |
| `/retomar-sesion` | `/resume-session` | Retoma desde lo guardado |
| `/reglas` | `/rules` | Instala reglas del lenguaje en el CLAUDE.md |
| `/costos` | `/costs` | Gasto por proyecto y por día |
| `/exportar` | `/export` | Lleva VCC a Cursor, Codex o Gemini CLI |
| `/barra-estado` | `/statusline` | Configura la barra de estado |

Si un nombre choca con un comando propio de Claude Code (por ejemplo `/review` o `/export`), usa el prefijo: `/vcc:export`.

## Memoria que aprende

En la carpeta `.vcc/` de cada proyecto:

- **`aprendizajes.md`** — lo que guardas con `/aprender`. Claude ve los últimos 12 al abrir el proyecto. Se puede versionar.
- **Aprendizaje automático** — al cerrar cada sesión, VCC anota qué comandos fallaron (sin guardar la conversación). Si un comando falla 3 veces o más en días distintos, al abrir el proyecto Claude lo sabe y propone guardar la causa cuando la encuentre.
- **`sesion.md`** — foto del repo antes de compactar y al cerrar, más lo que escribas con `/guardar-sesion`.

## Costos

La barra de estado muestra el costo de la sesión actual. VCC lo va guardando en `~/.vcc/` junto con los tokens de cada sesión, y `/costos` te muestra el resumen por proyecto y por día. Nada sale de tu equipo.

## Hooks

| Hook | Cuándo | Qué hace |
|---|---|---|
| Guardia de comandos | Antes de cada comando | Bloquea `rm -rf /`, `curl \| sh`, `push --force` a main, lectura de credenciales; pregunta antes de `reset --hard`, `sudo`, `DROP TABLE`, `publish` |
| Guardia de archivos | Antes de escribir | Impide guardar claves reales en el código; protege `~/.ssh` y `.git/`; pregunta antes de tocar la config de Claude Code o relajar linters |
| Formateo | Después de editar | Usa el formateador del proyecto (Prettier, swift-format, clang-format, ruff, rustfmt) |
| Revisión final | Al terminar cada respuesta | Restos de depuración, errores de TypeScript y `cforge check` en archivos `.cfv`; pide arreglarlos (una vez) |
| Notificaciones | Al terminar o al pedir aprobación | Aviso en el escritorio (macOS y Linux) |
| Memoria | Inicio, compactación y cierre | Ver arriba |

Detalles en [SEGURIDAD.md](SEGURIDAD.md).

## Otras herramientas

`/exportar cursor|codex|gemini|todos` copia las guías y reglas base al proyecto:

| Herramienta | Archivos |
|---|---|
| Cursor | `.cursor/rules/vcc-*.mdc` |
| Codex CLI (y cualquier agente que lea `AGENTS.md`) | `AGENTS.md` + `.vcc/skills/` |
| Gemini CLI | `GEMINI.md` (importa `AGENTS.md`) |

Solo se reemplaza la sección marcada de VCC. Esas herramientas no ejecutan los hooks de seguridad.

## Configuración

| Opción | Valores | Por defecto |
|---|---|---|
| `perfil` / `VCC_PERFIL` | `minimo` · `estandar` · `estricto` | `estandar` |
| `idioma` / `VCC_IDIOMA` | `es` · `en` | `es` |
| `VCC_FORMATEAR=0` | Desactiva el formateo | activo |
| `VCC_REVISION=0` | Desactiva la revisión final | activa |
| `VCC_NOTIFICAR=0` | Desactiva notificaciones | activas |
| `VCC_MEMORIA=0` | Desactiva la memoria automática | activa |
| `VCC_COSTOS=0` | Desactiva el registro de costos | activo |

El perfil `minimo` deja solo los bloqueos críticos de seguridad. Claude Code instala el plugin completo; para usar menos, ajusta el perfil y las variables.

## Desarrollo

```bash
npm test
```

## Licencia

MIT © Vemoris Software. Ver [LICENSE](LICENSE).
