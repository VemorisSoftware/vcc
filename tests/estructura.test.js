'use strict';

// Valida que agentes, skills, comandos y manifiestos tengan la forma que
// Claude Code espera.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');

function frontmatter(archivo) {
  const txt = fs.readFileSync(archivo, 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(m, `${archivo}: falta frontmatter`);
  const campos = {};
  for (const linea of m[1].split('\n')) {
    const i = linea.indexOf(':');
    if (i > 0) campos[linea.slice(0, i).trim()] = linea.slice(i + 1).trim().replace(/^"|"$/g, '');
  }
  return { campos, cuerpo: txt.slice(m[0].length) };
}

test('plugin.json válido y sin campos que el validador rechaza', () => {
  const p = JSON.parse(fs.readFileSync(path.join(RAIZ, '.claude-plugin/plugin.json'), 'utf8'));
  assert.equal(p.name, 'vcc');
  assert.match(p.version, /^\d+\.\d+\.\d+$/);
  assert.ok(!('agents' in p), 'no debe declarar agents');
  assert.ok(!('hooks' in p), 'no debe declarar hooks (se cargan por convención)');
  assert.ok(Array.isArray(p.skills) && Array.isArray(p.commands));
  const m = JSON.parse(fs.readFileSync(path.join(RAIZ, '.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(m.plugins[0].version, p.version, 'versiones sincronizadas');
});

test('hooks.json apunta a scripts que existen', () => {
  const h = JSON.parse(fs.readFileSync(path.join(RAIZ, 'hooks/hooks.json'), 'utf8'));
  for (const grupos of Object.values(h.hooks)) {
    for (const g of grupos) {
      for (const hook of g.hooks) {
        const m = hook.command.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^"]+)/);
        assert.ok(m, hook.command);
        assert.ok(fs.existsSync(path.join(RAIZ, m[1])), `no existe ${m[1]}`);
      }
    }
  }
});

test('agentes con name, description y tools escalares', () => {
  const dir = path.join(RAIZ, 'agents');
  for (const f of fs.readdirSync(dir)) {
    const { campos } = frontmatter(path.join(dir, f));
    assert.equal(campos.name, f.replace(/\.md$/, ''), f);
    assert.ok(campos.description && campos.description.length > 20, f);
    assert.ok(campos.tools && !campos.tools.startsWith('['), `${f}: tools debe ser escalar`);
  }
});

test('skills con name igual a la carpeta y descripción', () => {
  const dir = path.join(RAIZ, 'skills');
  for (const d of fs.readdirSync(dir)) {
    const { campos, cuerpo } = frontmatter(path.join(dir, d, 'SKILL.md'));
    assert.ok(campos.description.includes('ES:') && campos.description.includes('EN:'), d);
    assert.equal(campos.name, d);
    assert.ok(campos.description && campos.description.length <= 1024, d);
    assert.ok(cuerpo.trim().length > 200, `${d}: cuerpo muy corto`);
  }
});

test('comandos con descripción', () => {
  const dir = path.join(RAIZ, 'commands');
  for (const f of fs.readdirSync(dir)) {
    const { campos } = frontmatter(path.join(dir, f));
    assert.ok(campos.description, f);
  }
});

test('licencia a nombre de Vemoris Software', () => {
  assert.match(fs.readFileSync(path.join(RAIZ, 'LICENSE'), 'utf8'), /Copyright \(c\) 2026 Vemoris Software\n/);
});

test('comandos en español e inglés tienen el mismo número', () => {
  const n = fs.readdirSync(path.join(RAIZ, 'commands')).length;
  assert.equal(n % 2, 0);
});

test('VCC Extra: 64 agentes válidos, sin nombres repetidos con VCC', () => {
  const dirExtra = path.join(RAIZ, 'plugins', 'vcc-extra', 'agents');
  const extra = fs.readdirSync(dirExtra);
  assert.equal(extra.length, 64);
  const base = new Set(fs.readdirSync(path.join(RAIZ, 'agents')));
  assert.equal(base.size + extra.length, 82, 'VCC + VCC Extra = 82 agentes');
  for (const f of extra) {
    assert.ok(!base.has(f), `nombre repetido: ${f}`);
    const { campos, cuerpo } = frontmatter(path.join(dirExtra, f));
    assert.equal(campos.name, f.replace(/\.md$/, ''));
    assert.match(campos.description, /ES:.*EN:/);
    assert.ok(campos.tools && campos.model, f);
    assert.match(cuerpo, /## Reglas de VCC/);
  }
  const m = JSON.parse(fs.readFileSync(path.join(RAIZ, '.claude-plugin/marketplace.json'), 'utf8'));
  const pe = JSON.parse(fs.readFileSync(path.join(RAIZ, 'plugins/vcc-extra/.claude-plugin/plugin.json'), 'utf8'));
  assert.deepEqual(m.plugins.map((p) => p.name), ['vcc', 'vcc-extra']);
  assert.equal(m.plugins[1].version, pe.version);
});
