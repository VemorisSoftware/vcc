#!/usr/bin/env node
'use strict';

// Barra de estado para Claude Code: modelo · carpeta · rama (+cambios) · perfil VCC.
// Se configura con /barra-estado (o /statusline). Sin red.

const path = require('path');
const { leerEntrada, ejecutar, perfil, desactivadoPorEnv } = require('./lib/comun');
const { registrarCosto } = require('./lib/uso');

function componer(entrada, gitInfo, p) {
  const modelo = (entrada.model && (entrada.model.display_name || entrada.model.id)) || 'Claude';
  const dir = (entrada.workspace && entrada.workspace.current_dir) || entrada.cwd || process.cwd();
  const partes = [`🤖 ${modelo}`, `📁 ${path.basename(dir)}`];
  if (gitInfo && gitInfo.rama) partes.push(`🌿 ${gitInfo.rama}${gitInfo.cambios ? ` ±${gitInfo.cambios}` : ''}`);
  const usd = entrada.cost && entrada.cost.total_cost_usd;
  if (typeof usd === 'number' && isFinite(usd)) partes.push(`💰 US$${usd.toFixed(2)}`);
  partes.push(`🛡️ ${p}`);
  return partes.join('  ·  ');
}

async function main() {
  const entrada = await leerEntrada();
  const dir = (entrada.workspace && entrada.workspace.current_dir) || entrada.cwd || process.cwd();
  let gitInfo = null;
  const rama = ejecutar('git', ['-C', dir, 'rev-parse', '--abbrev-ref', 'HEAD'], { timeout: 1500 });
  if (rama.ok) {
    const st = ejecutar('git', ['-C', dir, 'status', '--porcelain'], { timeout: 1500 });
    gitInfo = { rama: rama.salida.trim(), cambios: st.ok ? st.salida.split('\n').filter(Boolean).length : 0 };
  }
  process.stdout.write(componer(entrada, gitInfo, perfil()));
  if (!desactivadoPorEnv('VCC_COSTOS') && entrada.cost && entrada.session_id) {
    try { registrarCosto(entrada.session_id, path.basename(dir), entrada.cost.total_cost_usd); } catch { /* ignorar */ }
  }
}

if (require.main === module) {
  main().catch(() => process.stdout.write('VCC')).finally(() => process.exit(0));
}

module.exports = { componer };
