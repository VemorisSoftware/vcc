'use strict';

// Lectura defensiva de la transcripción JSONL de Claude Code.
// Solo extrae: comandos Bash que fallaron y uso de tokens.
// Nunca guarda el contenido de la conversación.

const fs = require('fs');

const MAX_BYTES = 50 * 1024 * 1024;

const RE_SECRETO = /(sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[abprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|:\/\/[^:\s/]+:[^@\s]+@)/g;

function redactar(texto) {
  return String(texto).replace(RE_SECRETO, '[oculto]');
}

function leerLineas(ruta) {
  try {
    const st = fs.statSync(ruta);
    if (!st.isFile() || st.size > MAX_BYTES) return [];
    return fs.readFileSync(ruta, 'utf8').split('\n');
  } catch {
    return [];
  }
}

function* entradas(ruta) {
  for (const l of leerLineas(ruta)) {
    if (!l.trim()) continue;
    try { yield JSON.parse(l); } catch { /* línea corrupta */ }
  }
}

function contenido(e) {
  const c = e && e.message && e.message.content;
  return Array.isArray(c) ? c : [];
}

function textoDe(resultado) {
  const c = resultado.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map((x) => (x && typeof x.text === 'string' ? x.text : '')).join('\n');
  return '';
}

// Clave estable para agrupar comandos parecidos: los dos primeros "tokens"
// significativos, sin rutas ni argumentos variables.
function claveComando(cmd) {
  const limpio = String(cmd)
    .replace(/^\s*(cd\s+\S+\s*&&\s*)+/, '')
    .replace(/^\s*(sudo|env\s+\S+=\S+)\s+/, '')
    .trim();
  const partes = limpio.split(/\s+/).filter((p) => p && !p.startsWith('-') && !/[/\\.]/.test(p.slice(1)) && !/^["'$]/.test(p));
  const clave = partes.slice(0, partes[0] && /^(npm|pnpm|yarn|bun|npx|cargo|go|swift|xcodebuild|make|cmake|ctest|python3?|pytest|uv|pip|git|docker|wrangler|cforge|flutter|dart|gradle|\.\/gradlew|mvn|php|composer|ruff|tsc|node)$/.test(partes[0]) ? 3 : 2);
  return clave.join(' ').slice(0, 60) || limpio.slice(0, 30);
}

function primeraLineaError(texto) {
  const lineas = String(texto).split('\n').map((l) => l.trim()).filter(Boolean);
  const interesante = lineas.find((l) => /(error|failed|fatal|cannot|not found|undefined|exception|panic|denied|falló|no se)/i.test(l)) || lineas[0] || '';
  return redactar(interesante.replace(/\d{2,}/g, 'N')).slice(0, 160);
}

// Devuelve [{clave, error}] de comandos Bash cuyo resultado fue error.
function fallosBash(ruta) {
  const usos = new Map();
  const fallos = [];
  for (const e of entradas(ruta)) {
    for (const b of contenido(e)) {
      if (b && b.type === 'tool_use' && b.name === 'Bash' && b.input && typeof b.input.command === 'string') {
        usos.set(b.id, b.input.command);
      } else if (b && b.type === 'tool_result' && b.is_error === true && usos.has(b.tool_use_id)) {
        fallos.push({ clave: claveComando(usos.get(b.tool_use_id)), error: primeraLineaError(textoDe(b)) });
      }
    }
  }
  return fallos;
}

// Suma de tokens por modelo, sin contar dos veces el mismo mensaje.
function usoTokens(ruta) {
  const vistos = new Set();
  const porModelo = {};
  for (const e of entradas(ruta)) {
    const m = e && e.message;
    if (!m || !m.usage) continue;
    const id = m.id || e.uuid;
    if (id && vistos.has(id)) continue;
    if (id) vistos.add(id);
    const modelo = m.model || 'desconocido';
    const u = m.usage;
    const t = (porModelo[modelo] = porModelo[modelo] || { entrada: 0, salida: 0, cacheEscritura: 0, cacheLectura: 0 });
    t.entrada += u.input_tokens || 0;
    t.salida += u.output_tokens || 0;
    t.cacheEscritura += u.cache_creation_input_tokens || 0;
    t.cacheLectura += u.cache_read_input_tokens || 0;
  }
  return porModelo;
}

module.exports = { fallosBash, usoTokens, claveComando, primeraLineaError, redactar };
