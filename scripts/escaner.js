#!/usr/bin/env node
'use strict';

// Escáner de configuración de Claude Code: permisos, hooks, servidores MCP,
// secretos en config e instrucciones sospechosas en CLAUDE.md.
// Solo lee archivos locales. Uso: node escaner.js [proyecto] [--json]

const fs = require('fs');
const os = require('os');
const path = require('path');

const RE_SECRETO = /(sk-ant-[A-Za-z0-9_-]{16,}|sk-[A-Za-z0-9_-]{32,}|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|xox[abprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|[rs]k_live_[A-Za-z0-9]{20,})/;
const RE_DESCARGA_EJECUTA = /(curl|wget)[^|;&]*\|\s*(sudo\s+)?(ba|z)?sh\b|\b(curl|wget)\b.*(-o|>)\s*\S+.*&&\s*(ba|z)?sh\b|base64\s+(-d|--decode)[^|]*\|\s*(ba|z)?sh|\beval\s+"?\$\(/;
const RE_INYECCION = /(ignore (all )?(previous|prior) instructions|ignora (todas )?las instrucciones (anteriores|previas)|you are now|disable (the )?(safety|security)|desactiva (la )?seguridad|do not tell the user|no le digas al usuario)/i;

function leerJson(ruta) {
  try { return JSON.parse(fs.readFileSync(ruta, 'utf8')); } catch { return null; }
}

function agregar(lista, severidad, archivo, mensaje, arreglo) {
  lista.push({ severidad, archivo, mensaje, arreglo });
}

function revisarSettings(ruta, cfg, h) {
  if (!cfg) return;
  const p = cfg.permissions || {};
  for (const regla of p.allow || []) {
    if (['*', 'Bash', 'Bash(*)', 'Bash(:*)'].includes(regla)) {
      agregar(h, 'alta', ruta, `Permiso amplio "${regla}": Claude puede ejecutar cualquier comando sin preguntar.`, 'Reemplázalo por comandos concretos, p. ej. "Bash(npm test:*)".');
    } else if (/^Bash\((curl|wget|rm|sudo|ssh|scp)[ :]/.test(regla)) {
      agregar(h, 'media', ruta, `Permiso "${regla}" permite acciones de red o destructivas sin preguntar.`, 'Quítalo de allow o muévelo a ask.');
    }
  }
  if (p.defaultMode === 'bypassPermissions' || cfg.skipDangerousModePermissionPrompt === true) {
    agregar(h, 'alta', ruta, 'Modo sin permisos activado por defecto.', 'Usa el modo normal y aprueba por acción.');
  }
  for (const [clave, valor] of Object.entries(cfg.env || {})) {
    if (RE_SECRETO.test(String(valor)) || (/(KEY|TOKEN|SECRET|PASSWORD)/i.test(clave) && String(valor).length > 12)) {
      agregar(h, 'alta', ruta, `Secreto escrito en "env.${clave}".`, 'Muévelo a una variable de entorno del sistema o a un gestor de secretos y rótalo.');
    }
  }
  for (const [evento, grupos] of Object.entries(cfg.hooks || {})) {
    for (const g of Array.isArray(grupos) ? grupos : []) {
      for (const hook of (g && g.hooks) || []) {
        const cmd = String((hook && hook.command) || '');
        if (RE_DESCARGA_EJECUTA.test(cmd)) agregar(h, 'alta', ruta, `Hook de ${evento} descarga y ejecuta código: ${cmd.slice(0, 80)}`, 'Elimínalo o reemplázalo por un script local revisado.');
        else if (/\/tmp\//.test(cmd)) agregar(h, 'media', ruta, `Hook de ${evento} ejecuta algo desde /tmp.`, 'Usa una ruta fija dentro de tu usuario o del proyecto.');
        if (RE_SECRETO.test(cmd)) agregar(h, 'alta', ruta, `Hook de ${evento} contiene un secreto en el comando.`, 'Léelo desde una variable de entorno y rota el secreto.');
      }
    }
  }
}

function revisarMcp(ruta, servidores, h) {
  for (const [nombre, s] of Object.entries(servidores || {})) {
    if (!s || typeof s !== 'object') continue;
    const url = String(s.url || '');
    if (url.startsWith('http://') && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])/.test(url)) {
      agregar(h, 'alta', ruta, `MCP "${nombre}" usa HTTP sin cifrar (${url}).`, 'Usa https.');
    }
    const args = (s.args || []).map(String);
    if (['npx', 'uvx', 'bunx', 'pnpx'].includes(path.basename(String(s.command || '')))) {
      const paquete = args.find((a) => !a.startsWith('-'));
      if (paquete && !/@[\d^~]/.test(paquete.replace(/^@[^/]+\//, ''))) {
        agregar(h, 'media', ruta, `MCP "${nombre}" ejecuta "${paquete}" sin versión fija: cada inicio puede bajar código distinto.`, `Fija la versión, p. ej. "${paquete}@1.2.3".`);
      }
    }
    for (const [clave, valor] of Object.entries(s.env || {})) {
      if (RE_SECRETO.test(String(valor))) agregar(h, 'alta', ruta, `MCP "${nombre}" tiene un secreto escrito en env.${clave}.`, 'Usa una variable de entorno del sistema (${VAR}) y rota el secreto.');
    }
    for (const [clave, valor] of Object.entries(s.headers || {})) {
      if (RE_SECRETO.test(String(valor))) agregar(h, 'alta', ruta, `MCP "${nombre}" tiene un secreto escrito en headers.${clave}.`, 'Usa una variable de entorno (${VAR}) y rota el secreto.');
    }
  }
}

function revisarMarkdown(ruta, h) {
  let txt;
  try { txt = fs.readFileSync(ruta, 'utf8'); } catch { return; }
  if (RE_INYECCION.test(txt)) agregar(h, 'media', ruta, 'Contiene frases típicas de inyección de instrucciones.', 'Revisa quién escribió ese texto y elimínalo si no es tuyo.');
  if (RE_DESCARGA_EJECUTA.test(txt)) agregar(h, 'media', ruta, 'Indica descargar y ejecutar código (curl | sh o similar).', 'Confirma que la fuente es confiable o elimínalo.');
  if (RE_SECRETO.test(txt)) agregar(h, 'alta', ruta, 'Contiene algo con forma de clave de API.', 'Quítalo del archivo y rota la clave.');
}

function escanear(proyecto, inicio = os.homedir()) {
  const h = [];
  const revisados = [];
  const ver = (ruta, fn) => { if (fs.existsSync(ruta)) { revisados.push(ruta); fn(ruta); } };

  ver(path.join(inicio, '.claude', 'settings.json'), (r) => revisarSettings(r, leerJson(r), h));
  ver(path.join(inicio, '.claude.json'), (r) => {
    const cfg = leerJson(r) || {};
    revisarMcp(r, cfg.mcpServers, h);
    for (const [dir, p] of Object.entries(cfg.projects || {})) {
      if (p && p.mcpServers) revisarMcp(`${r} (proyecto ${path.basename(dir)})`, p.mcpServers, h);
    }
  });
  ver(path.join(inicio, '.claude', 'CLAUDE.md'), (r) => revisarMarkdown(r, h));
  if (proyecto) {
    ver(path.join(proyecto, '.claude', 'settings.json'), (r) => revisarSettings(r, leerJson(r), h));
    ver(path.join(proyecto, '.claude', 'settings.local.json'), (r) => revisarSettings(r, leerJson(r), h));
    ver(path.join(proyecto, '.mcp.json'), (r) => revisarMcp(r, (leerJson(r) || {}).mcpServers, h));
    ver(path.join(proyecto, 'CLAUDE.md'), (r) => revisarMarkdown(r, h));
    ver(path.join(proyecto, '.claude', 'CLAUDE.md'), (r) => revisarMarkdown(r, h));
    ver(path.join(proyecto, 'AGENTS.md'), (r) => revisarMarkdown(r, h));
  }
  const orden = { alta: 0, media: 1, baja: 2 };
  h.sort((a, b) => orden[a.severidad] - orden[b.severidad]);
  return { revisados, hallazgos: h };
}

function formatear(r) {
  const icono = { alta: '🔴', media: '🟠', baja: '🟡' };
  const l = [`Archivos revisados: ${r.revisados.length}`];
  if (!r.hallazgos.length) l.push('✅ Sin hallazgos en la configuración de Claude Code.');
  for (const x of r.hallazgos) l.push('', `${icono[x.severidad]} ${x.severidad.toUpperCase()} — ${x.archivo}`, `   ${x.mensaje}`, `   Arreglo: ${x.arreglo}`);
  return l.join('\n');
}

if (require.main === module) {
  const proyecto = process.argv.slice(2).find((a) => !a.startsWith('--')) || process.cwd();
  const r = escanear(path.resolve(proyecto));
  process.stdout.write((process.argv.includes('--json') ? JSON.stringify(r, null, 2) : formatear(r)) + '\n');
  process.exit(r.hallazgos.some((x) => x.severidad === 'alta') ? 2 : 0);
}

module.exports = { escanear, formatear };
