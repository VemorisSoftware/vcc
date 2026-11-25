#!/usr/bin/env node
'use strict';

// SessionEnd: foto del estado del repo, aprendizaje automático (fallos
// repetidos de comandos) y registro local de tokens. Todo local.

const path = require('path');
const { perfil, leerEntrada, dirProyecto, desactivadoPorEnv } = require('../lib/comun');
const { guardarEstado, registrarFallos } = require('../lib/memoria');
const { fallosBash, usoTokens } = require('../lib/transcripcion');
const { registrarTokens } = require('../lib/uso');

async function main() {
  const entrada = await leerEntrada();
  const proyecto = dirProyecto(entrada);
  const transcripcion = typeof entrada.transcript_path === 'string' ? entrada.transcript_path : null;
  const minimo = perfil() === 'minimo';

  if (!minimo && !desactivadoPorEnv('VCC_MEMORIA')) {
    try { guardarEstado(proyecto, 'SessionEnd'); } catch { /* sin permisos de escritura */ }
    if (transcripcion) {
      try { registrarFallos(proyecto, fallosBash(transcripcion)); } catch { /* ignorar */ }
    }
  }

  if (transcripcion && !desactivadoPorEnv('VCC_COSTOS')) {
    try {
      const porModelo = usoTokens(transcripcion);
      if (Object.keys(porModelo).length) {
        registrarTokens({
          fecha: new Date().toISOString(),
          sesion: entrada.session_id || null,
          proyecto: path.basename(proyecto),
          modelos: porModelo,
        });
      }
    } catch { /* ignorar */ }
  }
}

main().catch(() => {}).finally(() => process.exit(0));
