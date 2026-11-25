#!/usr/bin/env node
'use strict';

// PreCompact y SessionEnd: guarda una foto del estado del repo en
// .vcc/sesion.md (rama, archivos cambiados, últimos commits). No guarda
// contenido de archivos ni de la conversación.

const { perfil, leerEntrada, dirProyecto, desactivadoPorEnv, t } = require('../lib/comun');
const { guardarEstado } = require('../lib/memoria');

async function main() {
  if (perfil() === 'minimo' || desactivadoPorEnv('VCC_MEMORIA')) return;
  const entrada = await leerEntrada();
  const evento = entrada.hook_event_name || 'manual';
  const proyecto = dirProyecto(entrada);
  guardarEstado(proyecto, evento);
  if (evento === 'PreCompact') {
    process.stdout.write(t([
      'VCC guardó el estado del repo en .vcc/sesion.md. Si hay decisiones o pasos pendientes que no están en disco, considera /guardar-sesion.',
      'VCC saved the repo state to .vcc/sesion.md. If there are decisions or next steps not yet on disk, consider /save-session.',
    ]) + '\n');
  }
}

main().catch(() => {}).finally(() => process.exit(0));
