#!/usr/bin/env node
'use strict';

// Resumen local de uso: costo en USD (según la barra de estado de Claude Code)
// y tokens por proyecto. Uso: node costos.js [dias=30] [--json]

const { leerCostos, leerTokens } = require('./lib/uso');

function resumir(costos, tokens, dias, hoy = new Date()) {
  const desde = new Date(hoy.getTime() - dias * 86400000).toISOString().slice(0, 10);
  const porProyecto = {};
  const porDia = {};
  let totalUsd = 0;
  for (const c of Object.values(costos)) {
    if (!c || c.fecha < desde) continue;
    const p = (porProyecto[c.proyecto || '?'] = porProyecto[c.proyecto || '?'] || { usd: 0, sesiones: 0, tokens: 0 });
    p.usd += c.usd; p.sesiones += 1;
    porDia[c.fecha] = (porDia[c.fecha] || 0) + c.usd;
    totalUsd += c.usd;
  }
  let totalTokens = 0;
  for (const r of tokens) {
    if (!r || String(r.fecha).slice(0, 10) < desde) continue;
    let n = 0;
    for (const t of Object.values(r.modelos || {})) n += (t.entrada || 0) + (t.salida || 0) + (t.cacheEscritura || 0) + (t.cacheLectura || 0);
    const p = (porProyecto[r.proyecto || '?'] = porProyecto[r.proyecto || '?'] || { usd: 0, sesiones: 0, tokens: 0 });
    p.tokens += n;
    totalTokens += n;
  }
  return { dias, desde, totalUsd: Math.round(totalUsd * 100) / 100, totalTokens, porProyecto, porDia };
}

function formatear(r) {
  const fmtN = (n) => n.toLocaleString('es-CL');
  const filas = Object.entries(r.porProyecto).sort((a, b) => b[1].usd - a[1].usd || b[1].tokens - a[1].tokens);
  const lineas = [
    `Uso de los últimos ${r.dias} días (desde ${r.desde})`,
    `Total: US$${r.totalUsd.toFixed(2)} · ${fmtN(r.totalTokens)} tokens`,
    '',
    'Proyecto              US$       Sesiones   Tokens',
  ];
  for (const [nombre, p] of filas) {
    lineas.push(`${nombre.slice(0, 20).padEnd(20)}  ${p.usd.toFixed(2).padStart(8)}  ${String(p.sesiones).padStart(8)}   ${fmtN(p.tokens)}`);
  }
  if (!filas.length) lineas.push('(sin datos todavía: el costo se registra con la barra de estado de VCC y los tokens al cerrar cada sesión)');
  return lineas.join('\n');
}

if (require.main === module) {
  const dias = Number(process.argv.find((a) => /^\d+$/.test(a)) || 30);
  const r = resumir(leerCostos(), leerTokens(), dias);
  process.stdout.write((process.argv.includes('--json') ? JSON.stringify(r, null, 2) : formatear(r)) + '\n');
}

module.exports = { resumir, formatear };
