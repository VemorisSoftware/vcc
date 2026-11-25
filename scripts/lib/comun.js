'use strict';

// Utilidades compartidas por los hooks de VCC.
// Sin dependencias, sin red, sin telemetría: solo lee stdin y responde.

const PERFILES = ['minimo', 'estandar', 'estricto'];
const MAX_ENTRADA = 5 * 1024 * 1024; // 5 MB

function perfil() {
  const valor = (
    process.env.VCC_PERFIL ||
    process.env.CLAUDE_PLUGIN_OPTION_PERFIL ||
    process.env.CLAUDE_PLUGIN_OPTION_perfil ||
    'estandar'
  ).trim().toLowerCase();
  return PERFILES.includes(valor) ? valor : 'estandar';
}

// Idioma de los mensajes: es (por defecto) o en.
function idioma() {
  const v = (process.env.VCC_IDIOMA || process.env.CLAUDE_PLUGIN_OPTION_IDIOMA || process.env.CLAUDE_PLUGIN_OPTION_idioma || 'es')
    .trim().toLowerCase();
  return v.startsWith('en') ? 'en' : 'es';
}

// t(['texto ES', 'text EN']) devuelve el texto en el idioma activo.
function t(par) {
  if (!Array.isArray(par)) return String(par);
  return idioma() === 'en' ? par[1] : par[0];
}

function nivel(p) {
  return PERFILES.indexOf(p);
}

function leerEntrada() {
  return new Promise((resolve) => {
    let datos = '';
    let excedido = false;
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (trozo) => {
      if (excedido) return;
      datos += trozo;
      if (datos.length > MAX_ENTRADA) excedido = true;
    });
    process.stdin.on('end', () => {
      if (excedido) return resolve({ _excedido: true });
      try {
        resolve(JSON.parse(datos || '{}'));
      } catch {
        resolve({ _invalido: true });
      }
    });
  });
}

// Respuestas para PreToolUse.
function responder(decision, motivo) {
  const salida = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision, // 'deny' | 'ask'
      permissionDecisionReason: `[VCC] ${motivo}`,
    },
  };
  process.stdout.write(JSON.stringify(salida));
  process.exit(0);
}

const denegar = (motivo) => responder('deny', motivo);
const preguntar = (motivo) => responder('ask', motivo);
const permitir = () => process.exit(0);

// Ante un error interno: el perfil estricto falla cerrado; los demás, abierto.
function manejarFallo(nombre, error) {
  const det = error && error.message ? error.message : error;
  const msg = t([`${nombre}: error interno (${det})`, `${nombre}: internal error (${det})`]);
  if (perfil() === 'estricto') denegar(`${msg}. ${t(['Perfil estricto: se bloquea por precaución.', 'Strict profile: blocked as a precaution.'])}`);
  process.stderr.write(`[VCC] ${msg}. ${t(['Se permite la acción.', 'Action allowed.'])}\n`);
  process.exit(0);
}

module.exports = { perfil, idioma, t, nivel, leerEntrada, denegar, preguntar, permitir, manejarFallo, PERFILES };

// ---------------------------------------------------------------------------
// Utilidades de proyecto (v0.2)

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function dirProyecto(entrada) {
  return process.env.CLAUDE_PROJECT_DIR || (entrada && entrada.cwd) || process.cwd();
}

// Ejecuta un binario sin shell. Devuelve { ok, salida }. Nunca lanza.
function ejecutar(bin, args, opciones = {}) {
  try {
    const salida = execFileSync(bin, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: opciones.timeout || 10000,
      cwd: opciones.cwd,
      maxBuffer: 4 * 1024 * 1024,
    });
    return { ok: true, salida };
  } catch (e) {
    return { ok: false, salida: `${e.stdout || ''}${e.stderr || ''}`, codigo: e.status };
  }
}

function existe(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

// Busca un binario en PATH (sin ejecutar nada).
function enPath(bin) {
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    if (dir && existe(path.join(dir, bin))) return path.join(dir, bin);
  }
  return null;
}

// Sube desde `desde` hasta `tope` buscando alguno de los nombres.
function buscarHaciaArriba(desde, nombres, tope) {
  let dir = desde;
  const limite = path.resolve(tope || path.parse(desde).root);
  for (;;) {
    for (const n of nombres) {
      const p = path.join(dir, n);
      if (existe(p)) return p;
    }
    if (path.resolve(dir) === limite) return null;
    const padre = path.dirname(dir);
    if (padre === dir) return null;
    dir = padre;
  }
}

function desactivadoPorEnv(nombre) {
  const v = (process.env[nombre] || '').trim().toLowerCase();
  return v === '0' || v === 'false' || v === 'no';
}

module.exports.dirProyecto = dirProyecto;
module.exports.ejecutar = ejecutar;
module.exports.existe = existe;
module.exports.enPath = enPath;
module.exports.buscarHaciaArriba = buscarHaciaArriba;
module.exports.desactivadoPorEnv = desactivadoPorEnv;
