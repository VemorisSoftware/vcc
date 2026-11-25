#!/usr/bin/env node
'use strict';

// Notification: avisa en el escritorio cuando Claude necesita tu atención
// (por ejemplo, para aprobar un permiso).

const path = require('path');
const { leerEntrada, dirProyecto, desactivadoPorEnv, t } = require('../lib/comun');
const { notificar } = require('../lib/notificar');

async function main() {
  if (desactivadoPorEnv('VCC_NOTIFICAR')) return;
  const entrada = await leerEntrada();
  const proyecto = path.basename(dirProyecto(entrada));
  const msg = typeof entrada.message === 'string' && entrada.message
    ? entrada.message
    : t(['Claude necesita tu atención', 'Claude needs your attention']);
  notificar(`Claude Code · ${proyecto}`, msg);
}

main().catch(() => {}).finally(() => process.exit(0));
