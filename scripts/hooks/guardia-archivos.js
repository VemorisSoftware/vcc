#!/usr/bin/env node
'use strict';

// PreToolUse(Write|Edit|MultiEdit|NotebookEdit):
//  1. Bloquea escribir secretos reales en archivos que no son .env.
//  2. Protege rutas sensibles (credenciales, .git interno).
//  3. Pide confirmación al tocar la configuración de seguridad de Claude Code
//     o al debilitar linters/compiladores.

const path = require('path');
const { perfil, nivel, leerEntrada, denegar, preguntar, permitir, manejarFallo, t } = require('../lib/comun');

const SECRETOS = [
  [/\bAKIA[0-9A-Z]{16}\b/, ['clave de acceso de AWS', 'AWS access key']],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/, ['token de GitHub', 'GitHub token']],
  [/\bgithub_pat_[A-Za-z0-9_]{60,}\b/, ['token de GitHub', 'GitHub token']],
  [/\bsk-ant-[A-Za-z0-9_-]{20,}/, ['clave de API de Anthropic', 'Anthropic API key']],
  [/\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/, ['clave de API de OpenAI', 'OpenAI API key']],
  [/\b[sr]k_live_[A-Za-z0-9]{20,}\b/, ['clave live de Stripe', 'Stripe live key']],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/, ['token de Slack', 'Slack token']],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, ['clave de API de Google', 'Google API key']],
  [/-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/, ['clave privada', 'private key']],
  [/\bxi-api-key\s*[:=]\s*['"]?[a-f0-9]{32}/i, ['clave de API de ElevenLabs', 'ElevenLabs API key']],
  [/\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^:\s/]+:[^@\s]{4,}@/, ['URL de base de datos con contraseña', 'database URL with password']],
];

// Valores que claramente son ejemplos.
const MARCADOR_EJEMPLO = /(?:EXAMPLE|example|ejemplo|xxxx|XXXX|placeholder|your[_-]?key|tu[_-]?clave|<[^>]+>|\.\.\.)/;

const RUTAS_PROHIBIDAS = [
  [/(?:^|\/)\.ssh\//, ['la carpeta ~/.ssh', 'the ~/.ssh folder']],
  [/(?:^|\/)\.aws\/credentials$/, ['las credenciales de AWS', 'AWS credentials']],
  [/(?:^|\/)\.git\/(?!COMMIT_EDITMSG$)/, ['el interior de .git', 'the inside of .git']],
  [/(?:^|\/)\.netrc$/, ['.netrc', '.netrc']],
  [/(?:^|\/)\.config\/gh\/hosts\.yml$/, ['las credenciales de gh', 'gh credentials']],
];

const RUTAS_SENSIBLES = [
  [/(?:^|\/)\.claude\/settings(?:\.local)?\.json$/, ['la configuración de permisos de Claude Code', 'Claude Code permission settings']],
  [/(?:^|\/)\.mcp\.json$/, ['los servidores MCP del proyecto', 'the project MCP servers']],
  [/(?:^|\/)\.claude\/hooks\//, ['los hooks de Claude Code', 'Claude Code hooks']],
  [/(?:^|\/)\.github\/workflows\/[^/]+\.ya?ml$/, ['un workflow de CI', 'a CI workflow']],
];

// Cambios que debilitan controles de calidad.
const DEBILITAR = [
  [/(?:^|\/)tsconfig[^/]*\.json$/, /"strict"\s*:\s*false|"noImplicitAny"\s*:\s*false/, ['desactiva el modo estricto de TypeScript', 'disables TypeScript strict mode']],
  [/(?:^|\/)(?:\.eslintrc[^/]*|eslint\.config\.[cm]?[jt]s)$/, /['"]off['"]|:\s*0\b/, ['desactiva reglas de ESLint', 'disables ESLint rules']],
  [/(?:^|\/)\.swiftlint\.ya?ml$/, /disabled_rules/, ['desactiva reglas de SwiftLint', 'disables SwiftLint rules']],
  [/(?:^|\/)CMakeLists\.txt$/, /-Wno-error|-w\b/, ['silencia advertencias del compilador', 'silences compiler warnings']],
];

function esArchivoEnv(ruta) {
  const base = path.basename(ruta);
  return /^\.env(?:\.[\w-]+)?$/.test(base) && !/\.(?:example|sample|template|ejemplo)$/.test(base);
}

function textoNuevo(input) {
  if (!input) return '';
  if (typeof input.content === 'string') return input.content;
  if (typeof input.new_string === 'string') return input.new_string;
  if (typeof input.new_source === 'string') return input.new_source;
  if (Array.isArray(input.edits)) return input.edits.map((e) => (e && e.new_string) || '').join('\n');
  return '';
}

function buscarSecreto(texto) {
  for (const linea of texto.split('\n')) {
    for (const [re, tipo] of SECRETOS) {
      const m = linea.match(re);
      if (m && !MARCADOR_EJEMPLO.test(m[0]) && !MARCADOR_EJEMPLO.test(linea)) return tipo;
    }
  }
  return null;
}

function evaluarEscritura(ruta, texto, p = 'estandar') {
  if (typeof ruta !== 'string' || !ruta) return null;
  const r = ruta.replace(/\\/g, '/');
  const n = nivel(p);

  for (const [re, nombre] of RUTAS_PROHIBIDAS) {
    if (re.test(r)) return { decision: 'deny', motivo: [`No se permite escribir en ${nombre[0]}.`, `Writing to ${nombre[1]} is not allowed.`] };
  }

  const tipo = buscarSecreto(texto || '');
  if (tipo && !esArchivoEnv(r)) {
    return {
      decision: 'deny',
      motivo: [
        `El contenido parece incluir una ${tipo[0]}. Guárdala en una variable de entorno o en .env (ignorado por git) y léela desde ahí.`,
        `The content seems to include a ${tipo[1]}. Store it in an environment variable or in .env (git-ignored) and read it from there.`,
      ],
    };
  }

  if (n >= nivel('estandar')) {
    for (const [re, nombre] of RUTAS_SENSIBLES) {
      if (re.test(r)) return { decision: 'ask', motivo: [`Se va a modificar ${nombre[0]}.`, `About to modify ${nombre[1]}.`] };
    }
    for (const [reRuta, reCont, desc] of DEBILITAR) {
      if (reRuta.test(r) && reCont.test(texto || '')) {
        return { decision: 'ask', motivo: [`Este cambio ${desc[0]}. Arregla el código en vez de relajar la regla, salvo que el usuario lo apruebe.`, `This change ${desc[1]}. Fix the code instead of relaxing the rule, unless the user approves.`] };
      }
    }
  }

  if (n >= nivel('estricto') && esArchivoEnv(r)) {
    return { decision: 'ask', motivo: ['Se va a modificar un archivo .env.', 'About to modify a .env file.'] };
  }
  return null;
}

async function main() {
  const entrada = await leerEntrada();
  if (entrada._excedido || entrada._invalido) {
    if (perfil() === 'estricto') denegar(t(['Entrada del hook inválida o demasiado grande.', 'Invalid or oversized hook input.']));
    permitir();
  }
  const input = entrada.tool_input || {};
  const ruta = input.file_path || input.notebook_path;
  const r = evaluarEscritura(ruta, textoNuevo(input), perfil());
  if (!r) permitir();
  if (r.decision === 'deny') denegar(t(r.motivo));
  preguntar(t(r.motivo));
}

if (require.main === module) {
  main().catch((e) => manejarFallo('guardia-archivos', e));
}

module.exports = { evaluarEscritura, buscarSecreto, textoNuevo, esArchivoEnv };
