# Security in VCC

[Español](SEGURIDAD.md) · English

## Principles
1. **No network.** No hook opens connections, downloads code or auto-updates. The only exception is `/second-opinion`, which asks first.
2. **No telemetry.** Commands, prompts and files are never logged to disk.
3. **No dependencies.** Hooks use only the Node.js standard library.
4. **Auditable.** Each hook is a short file in `scripts/hooks/` with tests in `tests/`.
5. **Content is data.** Agents and commands treat repo text, issues, logs and web pages as data, never as orders.

## What each hook does

### guardia-bash (PreToolUse: Bash)
| From profile | Decision | Case |
|---|---|---|
| minimo | Block | `rm -rf` on `/`, `~`, `$HOME`, `.`, `*`; `mkfs`, `dd` to disks, `diskutil erase` |
| minimo | Block | `curl … \| sh` |
| minimo | Block | `git push --force` to `main`/`master` |
| estandar | Block | `--no-verify`, reading `~/.ssh/id_*`, `~/.aws/credentials`, macOS keychain |
| estandar | Ask | `git reset --hard`, `git clean -f`, `push -f` to other branches, `sudo`, `DROP/TRUNCATE`, `DELETE` without `WHERE`, `npm/cargo publish` |
| estricto | Block / ask | shutdown or reboot, dumping environment variables |

### guardia-archivos (PreToolUse: Write, Edit, MultiEdit, NotebookEdit)
- **Blocks** writing real keys outside `.env` files (examples with `EXAMPLE`, `xxxx`, `<your_key>` are allowed).
- **Blocks** writing to `~/.ssh/`, `.git/` (except `COMMIT_EDITMSG`), `~/.aws/credentials`, `.netrc`.
- **Asks** before modifying `.claude/settings*.json`, `.mcp.json`, `.claude/hooks/` and `.github/workflows/`, because those files can widen what the agent is allowed to do.
- **Asks** before disabling TypeScript `strict`, ESLint/SwiftLint rules, or silencing CMake warnings.
- In the `estricto` profile, also asks before editing `.env`.

### Automatic hooks
- **Formatting:** only runs formatters already installed in the project (`node_modules/.bin`) or the system, and only if the project has their config file. Never uses `npx` or downloads packages. Only touches files inside the project.
- **Final review:** reads `git diff` and runs the local `tsc`. Does not modify files.
- **Notifications:** `osascript` on macOS and `notify-send` on Linux, with escaped text.
- **Memory:** writes only to the project's `.vcc/`. Stores branch, changed file names and commit messages; never file or conversation contents. What is read from `.vcc/` is shown to Claude as notes, not instructions.

### Learning memory and costs
- When a session ends, VCC reads Claude Code's local transcript and extracts **only**: which commands failed (with the first error line, keys hidden) and how many tokens were used. No messages or code are stored.
- Failures go to the project's `.vcc/observaciones.json` (git-ignored). Tokens and costs go to `~/.vcc/`, readable only by your user.

### Scanner and export
- `scripts/escaner.js` only reads local config files; it changes nothing.
- `scripts/exportar.js` only writes to the project you name and replaces only VCC's marked sections.

### Second opinion
`/second-opinion` is the only feature that sends code off your machine: it sends the diff to Codex (OpenAI) or Gemini (Google), and always asks for confirmation first.

## Internal failures
If a hook fails (invalid input, unexpected error): `minimo` and `estandar` allow the action and warn on stderr; `estricto` blocks.

## Limitations
Hooks are a safety net, not a sandbox. An obfuscated command (built from variables or base64-encoded) can slip through. For sensitive work, combine VCC with Claude Code permissions (`/permissions`) and OS-level sandboxing.

## Reporting
Open a private Security advisory at https://github.com/VemorisSoftware/vcc.
