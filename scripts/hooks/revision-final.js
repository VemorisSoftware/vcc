#!/usr/bin/env node
'use strict';

// Stop: cuando Claude termina de responder, revisa lo que cambió:
//  - restos de depuración agregados (console.log, debugger, dbg!, …)
//  - errores de tipos en proyectos TypeScript (tsc local, sin descargar)
// Si encuentra algo, pide a Claude que lo arregle (una sola vez por turno).
// Si no, envía una notificación al escritorio.

const path = require('path');
const { perfil, leerEntrada, dirProyecto, ejecutar, existe, enPath, desactivadoPorEnv, t } = require('../lib/comun');
const { notificar } = require('../lib/notificar');

const RESTOS = [
  { re: /\bconsole\.(log|debug)\(/, ext: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte'], nombre: 'console.log' },
  { re: /^\s*debugger;?\s*$/, ext: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte'], nombre: 'debugger' },
  { re: /\bdbg!\(/, ext: ['.rs'], nombre: 'dbg!' },
  { re: /^\s*(breakpoint\(\)|import pdb|pdb\.set_trace\(\))/, ext: ['.py'], nombre: 'pdb/breakpoint' },
  { re: /^\s*(print|debugPrint|dump)\(/, ext: ['.swift'], nombre: 'print' },
  { re: /\bstd::cout\s*<<.*(DEBUG|debug|TODO)/, ext: ['.cpp', '.cc', '.h', '.hpp'], nombre: 'cout de depuración' },
];

// Analiza un diff unificado (-U0) y devuelve [{archivo, linea, nombre}].
function buscarRestos(diff) {
  const hallazgos = [];
  let archivo = null;
  let linea = 0;
  for (const l of diff.split('\n')) {
    if (l.startsWith('+++ ')) {
      archivo = l.slice(4).replace(/^b\//, '');
      continue;
    }
    const h = l.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (h) { linea = Number(h[1]); continue; }
    if (!archivo || archivo === '/dev/null') continue;
    if (l.startsWith('+') && !l.startsWith('+++')) {
      const texto = l.slice(1);
      const ext = path.extname(archivo).toLowerCase();
      for (const r of RESTOS) {
        if (r.ext.includes(ext) && r.re.test(texto)) hallazgos.push({ archivo, linea, nombre: r.nombre });
      }
      linea++;
    }
  }
  return hallazgos;
}

function revisarTipos(proyecto, cambiados) {
  if (!cambiados.some((f) => /\.(ts|tsx|mts|cts)$/.test(f))) return null;
  if (!existe(path.join(proyecto, 'tsconfig.json'))) return null;
  const tsc = path.join(proyecto, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
  if (!existe(tsc)) return null;
  const r = ejecutar(tsc, ['--noEmit', '--pretty', 'false'], { cwd: proyecto, timeout: 60000 });
  if (r.ok) return null;
  const errores = r.salida.split('\n').filter((l) => /error TS\d+/.test(l));
  return errores.length ? errores : null;
}

// C-Forge: `cforge check` sobre los .cfv cambiados (máximo 10).
function revisarCforge(proyecto, cambiados, buscarBin = enPath) {
  const cfv = cambiados.filter((f) => f.endsWith('.cfv') && existe(path.join(proyecto, f))).slice(0, 10);
  if (!cfv.length) return null;
  const bin = buscarBin('cforge');
  if (!bin) return null;
  const errores = [];
  for (const f of cfv) {
    const r = ejecutar(bin, ['check', f], { cwd: proyecto, timeout: 20000 });
    if (!r.ok) errores.push(`${f}: ${(r.salida.split('\n').find((l) => l.trim()) || 'error').trim().slice(0, 200)}`);
  }
  return errores.length ? errores : null;
}

async function main() {
  const entrada = await leerEntrada();
  const proyecto = dirProyecto(entrada);
  const p = perfil();
  const problemas = [];

  if (p !== 'minimo' && !desactivadoPorEnv('VCC_REVISION') && !entrada.stop_hook_active) {
    const git = (args) => ejecutar('git', ['-C', proyecto, ...args], { timeout: 5000 });
    const diff = git(['diff', '-U0', 'HEAD']);
    if (diff.ok && diff.salida.trim()) {
      for (const h of buscarRestos(diff.salida).slice(0, 10)) {
        problemas.push(`${h.archivo}:${h.linea} — ${h.nombre}`);
      }
      const nombres = git(['diff', '--name-only', 'HEAD']);
      const tipos = revisarTipos(proyecto, nombres.ok ? nombres.salida.split('\n') : []);
      if (tipos) problemas.push(...tipos.slice(0, 15).map((e) => `tsc: ${e}`));
      const cforge = revisarCforge(proyecto, nombres.ok ? nombres.salida.split('\n').filter(Boolean) : []);
      if (cforge) problemas.push(...cforge.map((e) => `cforge check: ${e}`));
    }
  }

  if (problemas.length) {
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason: t([
        `[VCC] Antes de terminar, revisa esto en los cambios (arréglalo o explica por qué se queda):\n${problemas.join('\n')}`,
        `[VCC] Before finishing, check these in the changes (fix them or explain why they stay):\n${problemas.join('\n')}`,
      ]),
    }));
    return;
  }

  if (!desactivadoPorEnv('VCC_NOTIFICAR')) {
    notificar('Claude Code', t([`Terminó en ${path.basename(proyecto)}`, `Finished in ${path.basename(proyecto)}`]));
  }
}

if (require.main === module) {
  main().catch(() => {}).finally(() => process.exit(0));
}

module.exports = { buscarRestos, revisarCforge };
