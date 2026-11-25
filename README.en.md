# VCC — Vemoris Claude Code

[🇪🇸 Español](README.md) · 🇬🇧 English

Bilingual (Spanish/English) agents, skills, commands, learning memory and security hooks for [Claude Code](https://docs.claude.com/en/docs/claude-code/overview). First-class **C-Forge** support included.

Lean and auditable: the hooks send nothing off your machine and depend on no packages.

## Install

```
/plugin marketplace add VemorisSoftware/vcc
/plugin install vcc@vcc
```

Requires Node.js 18+. To use VCC in **Cursor, Codex or Gemini CLI**, see [`/export`](#other-tools).

### VCC Extra (optional): 64 more specialist agents

```
/plugin install vcc-extra@vcc
```

With VCC Extra you get **82 agents** in total. Frameworks (Next.js, React Native, Svelte, Angular, Astro, NestJS, Django, FastAPI, Spring Boot, .NET, Compose, Tauri/Electron), games and audio (Unity, Unreal, Godot, JUCE, DSP, three.js, shaders), data and AI (PostgreSQL, SQLite/D1, Redis, MongoDB, analysis, ML, AI apps, MCP servers), infrastructure (Docker, Kubernetes, Terraform, GitHub Actions, Cloudflare, AWS, observability, DNS and email), quality and security (E2E, performance, accessibility, dependencies, concurrency, fuzzing, cryptography, web auditing, compilers, WebAssembly), product (docs, ES/EN translation, UI design, UX copy, design systems, migrations, GraphQL) and business (Webpay payments, Chilean SII e-invoicing, legal topics, SEO, marketing, writing, investors, project management, releases and App Store).

It ships separately so VCC stays lean: install it only if you need it.

## Agents (18)

| Agent | Purpose |
|---|---|
| `planificador` · `arquitecto` | Staged plan · structure and decisions |
| `revisor` · `revisor-seguridad` | Diff review · security |
| `revisor-typescript` | TypeScript, JavaScript, React, Vue, Node |
| `revisor-swift` | Swift 6, SwiftUI, Xcode |
| `revisor-cpp` | Modern C++, JUCE, VST3, real-time audio |
| `revisor-cforge` | C-Forge (`.cfv`) and the C-Forge repo |
| `revisor-python` · `revisor-rust` · `revisor-go` | Python · Rust · Go |
| `revisor-jvm` · `revisor-php` · `revisor-flutter` | Java/Kotlin · PHP/Laravel · Dart/Flutter |
| `guia-tdd` · `depurador` | Test-first · bug root cause |
| `resolvedor-build` · `refactorizador` | Green build · behavior-preserving cleanup |

Agents reply in the language you write in.

## Skills (30)

- **Languages:** `c-forge` · `typescript` · `vue` · `swiftui` · `swift-concurrencia` · `cpp-moderno` · `audio-tiempo-real` · `python` · `rust` · `go` · `java-kotlin` · `php-laravel` · `flutter`
- **Platforms:** `cloudflare-workers` · `api-rest`
- **Ways of working:** `tdd` · `listo-para-pr` · `seguridad` · `calidad-codigo` · `errores` · `git` · `dependencias` · `contexto` · `memoria-proyecto` · `reglas`
- **Business and content:** `lanzamiento-marketing` · `inversionistas` · `seo` · `redes-sociales` · `video`

## Commands (15, in both languages)

| English | Español | What it does |
|---|---|---|
| `/plan` | `/planificar` | Plan + waits for approval |
| `/review` | `/revisar` | Review the current diff |
| `/second-opinion` | `/segunda-opinion` | Cross-review with Codex or Gemini CLI |
| `/verify` | `/verificar` | Ready for PR? |
| `/fix-build` | `/arreglar-build` | Get the build green |
| `/debug` | `/depurar` | Find and fix a bug's root cause |
| `/refactor` | `/refactorizar` | Cleanup with confirmation |
| `/security-scan` | `/escanear-seguridad` | Secrets, dependencies and Claude Code config |
| `/learn` | `/aprender` | Save a project learning |
| `/save-session` | `/guardar-sesion` | Save where the work stands |
| `/resume-session` | `/retomar-sesion` | Resume from the saved state |
| `/rules` | `/reglas` | Install language rules into CLAUDE.md |
| `/costs` | `/costos` | Spend per project and per day |
| `/export` | `/exportar` | Bring VCC to Cursor, Codex or Gemini CLI |
| `/statusline` | `/barra-estado` | Set up the status line |

If a name clashes with a built-in Claude Code command (e.g. `/review` or `/export`), use the prefix: `/vcc:export`.

## Learning memory

In each project's `.vcc/` folder:

- **`aprendizajes.md`** — what you save with `/learn`. Claude sees the latest 12 when the project opens. Can be committed.
- **Automatic learning** — when each session ends, VCC notes which commands failed (without storing the conversation). If a command fails 3+ times across different days, Claude knows when the project opens and offers to save the cause once found.
- **`sesion.md`** — repo snapshot before compaction and at session end, plus whatever you write with `/save-session`.

## Costs

The status line shows the current session's cost. VCC keeps it in `~/.vcc/` along with each session's tokens, and `/costs` shows the summary per project and per day. Nothing leaves your machine.

## Hooks

| Hook | When | What it does |
|---|---|---|
| Command guard | Before each command | Blocks `rm -rf /`, `curl \| sh`, force-push to main, reading credentials; asks before `reset --hard`, `sudo`, `DROP TABLE`, `publish` |
| File guard | Before writing | Stops real keys landing in code; protects `~/.ssh` and `.git/`; asks before touching Claude Code config or relaxing linters |
| Formatting | After editing | Uses the project's formatter (Prettier, swift-format, clang-format, ruff, rustfmt) |
| Final review | When each reply ends | Debug leftovers, TypeScript errors and `cforge check` on `.cfv` files; asks to fix them (once) |
| Notifications | When done or when approval is needed | Desktop alert (macOS and Linux) |
| Memory | Start, compaction and end | See above |

Details in [SECURITY.md](SECURITY.md).

## Other tools

`/export cursor|codex|gemini|todos` copies the guides and base rules into the project:

| Tool | Files |
|---|---|
| Cursor | `.cursor/rules/vcc-*.mdc` |
| Codex CLI (and any agent that reads `AGENTS.md`) | `AGENTS.md` + `.vcc/skills/` |
| Gemini CLI | `GEMINI.md` (imports `AGENTS.md`) |

Only VCC's marked section is replaced. Those tools don't run the security hooks.

## Settings

| Option | Values | Default |
|---|---|---|
| `perfil` / `VCC_PERFIL` | `minimo` · `estandar` · `estricto` | `estandar` |
| `idioma` / `VCC_IDIOMA` | `es` · `en` | `es` |
| `VCC_FORMATEAR=0` | Disable formatting | on |
| `VCC_REVISION=0` | Disable final review | on |
| `VCC_NOTIFICAR=0` | Disable notifications | on |
| `VCC_MEMORIA=0` | Disable automatic memory | on |
| `VCC_COSTOS=0` | Disable cost tracking | on |

The `minimo` profile keeps only the critical safety blocks. Claude Code installs the whole plugin; to use less, adjust the profile and variables.

## Development

```bash
npm test
```

## License

MIT © Vemoris Software. See [LICENSE](LICENSE).
