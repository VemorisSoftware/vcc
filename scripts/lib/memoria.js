'use strict';

// Lectura y escritura de la memoria por proyecto en .vcc/

const fs = require('fs');
const path = require('path');
const { ejecutar } = require('./comun');

const MARCA_INICIO = '<!-- vcc:estado-automatico:inicio -->';
const MARCA_FIN = '<!-- vcc:estado-automatico:fin -->';
const MAX_APRENDIZAJES = 12;
const MAX_CHARS_LINEA = 220;

function dirVcc(proyecto) {
  return path.join(proyecto, '.vcc');
}

// Crea .vcc/ con un .gitignore que excluye lo efímero pero deja
// versionar aprendizajes.md si el equipo quiere.
function asegurarDirVcc(proyecto) {
  const dir = dirVcc(proyecto);
  fs.mkdirSync(dir, { recursive: true });
  const gi = path.join(dir, '.gitignore');
  if (!fs.existsSync(gi)) fs.writeFileSync(gi, 'sesion.md\nplan.md\nobservaciones.json\n');
  return dir;
}

function leerAprendizajes(proyecto, max = MAX_APRENDIZAJES) {
  let txt;
  try {
    txt = fs.readFileSync(path.join(dirVcc(proyecto), 'aprendizajes.md'), 'utf8');
  } catch {
    return [];
  }
  const lineas = txt.split('\n').filter((l) => /^\s*[-*]\s+\S/.test(l));
  return lineas
    .slice(-max)
    .map((l) => l.trim().replace(/[\u0000-\u001f]/g, ''))
    .map((l) => (l.length > MAX_CHARS_LINEA ? l.slice(0, MAX_CHARS_LINEA - 1) + '…' : l));
}

function git(proyecto, args) {
  const r = ejecutar('git', ['-C', proyecto, ...args], { timeout: 5000 });
  return r.ok ? r.salida.trimEnd() : null;
}

// Foto mecánica del estado del repo (sin contenido de archivos).
function fotoEstado(proyecto, motivo, ahora = new Date()) {
  const rama = git(proyecto, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const lineas = [MARCA_INICIO, '## Estado automático', '', `- Guardado: ${ahora.toISOString()} (${motivo})`];
  if (rama === null) {
    lineas.push('- Sin repositorio git.');
  } else {
    lineas.push(`- Rama: \`${rama}\``);
    const estado = (git(proyecto, ['status', '--short']) || '').split('\n').filter(Boolean);
    lineas.push(`- Archivos con cambios: ${estado.length}`);
    if (estado.length) {
      lineas.push('', '```', ...estado.slice(0, 30), ...(estado.length > 30 ? [`… y ${estado.length - 30} más`] : []), '```');
    }
    const log = git(proyecto, ['log', '--oneline', '-5']);
    if (log) lineas.push('', 'Últimos commits:', '```', log, '```');
  }
  lineas.push(MARCA_FIN);
  return lineas.join('\n');
}

// Reemplaza solo la sección automática; conserva lo que escribió una persona.
function guardarEstado(proyecto, motivo) {
  const dir = asegurarDirVcc(proyecto);
  const archivo = path.join(dir, 'sesion.md');
  let actual = '';
  try { actual = fs.readFileSync(archivo, 'utf8'); } catch { /* nuevo */ }
  const foto = fotoEstado(proyecto, motivo);
  const i = actual.indexOf(MARCA_INICIO);
  const j = actual.indexOf(MARCA_FIN);
  let nuevo;
  if (i !== -1 && j > i) {
    nuevo = actual.slice(0, i) + foto + actual.slice(j + MARCA_FIN.length);
  } else {
    nuevo = (actual.trim() ? actual.trimEnd() + '\n\n' : '# Sesión\n\n') + foto + '\n';
  }
  fs.writeFileSync(archivo, nuevo);
  return archivo;
}

// ---------------------------------------------------------------------------
// Aprendizaje automático: fallos repetidos de comandos entre sesiones.

const MAX_CLAVES = 200;

function leerObservaciones(proyecto) {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(dirVcc(proyecto), 'observaciones.json'), 'utf8'));
    return o && typeof o === 'object' && o.comandos ? o : { comandos: {} };
  } catch {
    return { comandos: {} };
  }
}

function registrarFallos(proyecto, fallos, fecha = new Date().toISOString().slice(0, 10)) {
  if (!fallos.length) return;
  const dir = asegurarDirVcc(proyecto);
  const obs = leerObservaciones(proyecto);
  for (const f of fallos) {
    const c = (obs.comandos[f.clave] = obs.comandos[f.clave] || { veces: 0, sesiones: [], ultimoError: '' });
    c.veces += 1;
    if (!c.sesiones.includes(fecha)) c.sesiones = [...c.sesiones, fecha].slice(-10);
    c.ultimoError = f.error;
  }
  // Conserva solo las claves más frecuentes.
  const ordenadas = Object.entries(obs.comandos).sort((a, b) => b[1].veces - a[1].veces).slice(0, MAX_CLAVES);
  obs.comandos = Object.fromEntries(ordenadas);
  fs.writeFileSync(path.join(dir, 'observaciones.json'), JSON.stringify(obs, null, 2));
}

// Comandos que fallaron al menos 3 veces en 2 o más días distintos.
function patronesRecurrentes(proyecto, minVeces = 3, minSesiones = 2) {
  const obs = leerObservaciones(proyecto);
  return Object.entries(obs.comandos)
    .filter(([, c]) => c.veces >= minVeces && c.sesiones.length >= minSesiones && !c.aprendido)
    .sort((a, b) => b[1].veces - a[1].veces)
    .slice(0, 3)
    .map(([clave, c]) => ({ clave, veces: c.veces, dias: c.sesiones.length, ultimoError: c.ultimoError }));
}

module.exports = { leerObservaciones, registrarFallos, patronesRecurrentes, leerAprendizajes, guardarEstado, fotoEstado, asegurarDirVcc, MARCA_INICIO, MARCA_FIN };
