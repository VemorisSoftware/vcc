'use strict';

// Registro local de uso y costo en ~/.vcc (o $VCC_HOME). Nada sale del equipo.

const fs = require('fs');
const os = require('os');
const path = require('path');

function dirInicio() {
  return process.env.VCC_HOME || path.join(os.homedir(), '.vcc');
}

function asegurar() {
  const d = dirInicio();
  fs.mkdirSync(d, { recursive: true, mode: 0o700 });
  return d;
}

// Tokens por sesión, una línea JSON por sesión cerrada.
function registrarTokens(registro) {
  const d = asegurar();
  fs.appendFileSync(path.join(d, 'uso.jsonl'), JSON.stringify(registro) + '\n', { mode: 0o600 });
}

// Costo en USD que informa Claude Code a la barra de estado, por sesión.
function registrarCosto(sesionId, proyecto, usd, ahora = new Date()) {
  if (!sesionId || typeof usd !== 'number' || !isFinite(usd)) return;
  const d = asegurar();
  const archivo = path.join(d, 'costos.json');
  let datos = {};
  try { datos = JSON.parse(fs.readFileSync(archivo, 'utf8')); } catch { /* nuevo */ }
  const previo = datos[sesionId];
  if (previo && Math.abs(previo.usd - usd) < 0.0005) return; // sin cambios
  datos[sesionId] = { usd: Math.round(usd * 10000) / 10000, proyecto, fecha: ahora.toISOString().slice(0, 10) };
  // Mantener las 2.000 sesiones más recientes.
  const entradas = Object.entries(datos).sort((a, b) => (a[1].fecha < b[1].fecha ? 1 : -1)).slice(0, 2000);
  fs.writeFileSync(archivo, JSON.stringify(Object.fromEntries(entradas)), { mode: 0o600 });
}

function leerCostos() {
  try { return JSON.parse(fs.readFileSync(path.join(dirInicio(), 'costos.json'), 'utf8')); } catch { return {}; }
}

function leerTokens() {
  try {
    return fs.readFileSync(path.join(dirInicio(), 'uso.jsonl'), 'utf8')
      .split('\n').filter(Boolean)
      .map((l) => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  } catch {
    return [];
  }
}

module.exports = { dirInicio, registrarTokens, registrarCosto, leerCostos, leerTokens };
