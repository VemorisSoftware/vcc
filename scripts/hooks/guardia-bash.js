#!/usr/bin/env node
'use strict';

// PreToolUse(Bash): bloquea comandos destructivos o peligrosos y pide
// confirmación para los riesgosos. La lógica está en evaluarComando()
// para poder testearla sin Claude Code.

const { perfil, nivel, leerEntrada, denegar, preguntar, permitir, manejarFallo, t } = require('../lib/comun');

// Cada regla: [perfil mínimo en que aplica, decisión, regex, [motivo ES, motivo EN]]
const REGLAS = [
  // --- Destrucción del sistema de archivos ---
  ['minimo', 'deny', /\brm\s+(?:-{1,2}[a-zA-Z-]*\s+)*(?:-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)\s+(?:-{1,2}[a-zA-Z-]+\s+)*(?:--\s+)?["']?(?:\/|~|\$HOME|\$\{HOME\}|\/\*|~\/\*|\$HOME\/\*|\.\.?\/?|\*)["']?(?:\s|$|;|&|\|)/,
    ['rm recursivo sobre /, ~, $HOME, ., .. o * está bloqueado.', 'Recursive rm on /, ~, $HOME, ., .. or * is blocked.']],
  ['minimo', 'deny', /\brm\s+.*--no-preserve-root/, ['rm con --no-preserve-root está bloqueado.', 'rm with --no-preserve-root is blocked.']],
  ['minimo', 'deny', /\b(?:mkfs(?:\.\w+)?|fdisk|diskutil\s+(?:erase\w*|partition\w*|zero\w*|secureErase\w*|apfs\s+delete\w*))\b/, ['Formatear o particionar discos está bloqueado.', 'Formatting or partitioning disks is blocked.']],
  ['minimo', 'deny', /\bdd\b[^|;&]*\bof=\/dev\/(?!null\b)/, ['Escribir con dd sobre un dispositivo está bloqueado.', 'Writing to a device with dd is blocked.']],
  ['minimo', 'deny', />\s*\/dev\/(?:sd|disk|nvme|hd)\w*/, ['Redirigir salida a un disco está bloqueado.', 'Redirecting output to a disk is blocked.']],
  ['minimo', 'deny', /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;?\s*:/, ['Fork bomb detectada.', 'Fork bomb detected.']],

  // --- Ejecutar código descargado ---
  ['minimo', 'deny', /\b(?:curl|wget)\b[^|]*\|\s*(?:sudo\s+)?(?:ba|z|da|k)?sh\b/, ['Descargar y ejecutar en un shell (curl | sh) está bloqueado. Descarga, revisa y luego ejecuta.', 'Download-and-run in a shell (curl | sh) is blocked. Download, review, then run.']],
  ['estandar', 'deny', /\b(?:curl|wget)\b[^|]*\|\s*(?:sudo\s+)?(?:python3?|node|perl|ruby)\b/, ['Descargar y ejecutar con un intérprete está bloqueado.', 'Download-and-run with an interpreter is blocked.']],
  ['estandar', 'deny', /\b(?:ba|z)?sh\s+<\(\s*(?:curl|wget)\b/, ['Ejecutar un script descargado al vuelo está bloqueado.', 'Running a script downloaded on the fly is blocked.']],

  // --- Git ---
  ['minimo', 'deny', /\bgit\s+push\b(?=.*\s(?:-f|--force)(?:\s|$))(?!.*--force-with-lease)(?=.*\b(?:main|master)\b)/, ['git push --force a main/master está bloqueado.', 'git push --force to main/master is blocked.']],
  ['estandar', 'deny', /\bgit\s+(?:commit|push|merge|rebase)\b.*--no-verify\b/, ['Saltar hooks de git con --no-verify está bloqueado.', 'Skipping git hooks with --no-verify is blocked.']],
  ['estandar', 'ask', /\bgit\s+push\b.*\s(?:-f|--force)(?:\s|$)/, ['git push --force reescribe historia remota. Usa --force-with-lease.', 'git push --force rewrites remote history. Use --force-with-lease.']],
  ['estandar', 'ask', /\bgit\s+reset\s+--hard\b/, ['git reset --hard descarta cambios sin commit.', 'git reset --hard discards uncommitted changes.']],
  ['estandar', 'ask', /\bgit\s+clean\s+-[a-zA-Z]*f/, ['git clean -f borra archivos sin seguimiento.', 'git clean -f deletes untracked files.']],
  ['estandar', 'ask', /\bgit\s+(?:checkout|restore)\s+(?:--\s+)?\.(?:\s|$)/, ['Esto descarta todos los cambios locales.', 'This discards all local changes.']],
  ['estandar', 'ask', /\bgit\s+branch\s+-D\b/, ['Borrar una rama sin verificar si está mergeada.', 'Deleting a branch without checking it is merged.']],

  // --- Permisos y sistema ---
  ['minimo', 'deny', /\bchmod\s+(?:-R\s+)?0?777\s+\/(?:\s|$)/, ['chmod 777 sobre / está bloqueado.', 'chmod 777 on / is blocked.']],
  ['estandar', 'ask', /\bchmod\s+-R\s+0?777\b/, ['chmod -R 777 deja archivos abiertos a todos.', 'chmod -R 777 leaves files open to everyone.']],
  ['estandar', 'ask', /\bsudo\b/, ['Comando con sudo.', 'Command with sudo.']],
  ['estricto', 'deny', /\b(?:shutdown|reboot|halt|launchctl\s+(?:unload|bootout))\b/, ['Apagar o reiniciar el sistema está bloqueado.', 'Shutting down or rebooting the system is blocked.']],

  // --- Secretos y credenciales ---
  ['estandar', 'deny', /(?:~|\$HOME|\/Users\/[^/\s]+|\/home\/[^/\s]+)\/\.(?:ssh\/id_[a-z0-9]+(?!\.pub)|aws\/credentials|config\/gh\/hosts\.yml|netrc|npmrc|docker\/config\.json|kube\/config)\b/,
    ['Leer o mover archivos de credenciales está bloqueado.', 'Reading or moving credential files is blocked.']],
  ['estandar', 'deny', /\bsecurity\s+(?:find-generic-password|find-internet-password|dump-keychain)\b/, ['Leer el llavero de macOS está bloqueado.', 'Reading the macOS keychain is blocked.']],
  ['estricto', 'ask', /\b(?:printenv|env)\s*(?:$|\|)/, ['Volcar todas las variables de entorno puede exponer secretos.', 'Dumping all environment variables may expose secrets.']],

  // --- Bases de datos ---
  ['estandar', 'ask', /\b(?:DROP\s+(?:DATABASE|SCHEMA|TABLE)|TRUNCATE\s+TABLE)\b/i, ['Operación SQL destructiva.', 'Destructive SQL operation.']],
  ['estandar', 'ask', /\bDELETE\s+FROM\s+\w+\s*(?:;|"|'|$)/i, ['DELETE sin WHERE borra la tabla completa.', 'DELETE without WHERE wipes the whole table.']],

  // --- Publicación ---
  ['estandar', 'ask', /\b(?:npm|pnpm|yarn)\s+publish\b|\bcargo\s+publish\b|\btwine\s+upload\b|\bpod\s+trunk\s+push\b/, ['Publicar un paquete es público e irreversible.', 'Publishing a package is public and irreversible.']],
];

function evaluarComando(comando, p = 'estandar') {
  if (typeof comando !== 'string' || !comando.trim()) return null;
  const n = nivel(p);
  for (const [min, decision, regex, motivo] of REGLAS) {
    if (nivel(min) > n) continue;
    if (regex.test(comando)) return { decision, motivo };
  }
  return null;
}

async function main() {
  const entrada = await leerEntrada();
  if (entrada._excedido || entrada._invalido) {
    if (perfil() === 'estricto') denegar(t(['Entrada del hook inválida o demasiado grande.', 'Invalid or oversized hook input.']));
    permitir();
  }
  const comando = entrada.tool_input && entrada.tool_input.command;
  const r = evaluarComando(comando, perfil());
  if (!r) permitir();
  if (r.decision === 'deny') denegar(t(r.motivo));
  preguntar(t(r.motivo));
}

if (require.main === module) {
  main().catch((e) => manejarFallo('guardia-bash', e));
}

module.exports = { evaluarComando, REGLAS };
