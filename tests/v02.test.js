'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');

const RAIZ = path.join(__dirname, '..');
const { leerAprendizajes, guardarEstado, MARCA_INICIO } = require('../scripts/lib/memoria');
const { elegirFormateador } = require('../scripts/hooks/formatear');
const { buscarRestos } = require('../scripts/hooks/revision-final');
const { componer } = require('../scripts/barra-estado');
const { escaparAppleScript } = require('../scripts/lib/notificar');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'vcc-'));
}
function repo() {
  const d = tmp();
  const g = (...a) => execFileSync('git', ['-C', d, ...a], { stdio: 'ignore' });
  g('init', '-q', '-b', 'main');
  g('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'inicio');
  return d;
}
function correr(script, entrada, env = {}) {
  return spawnSync(process.execPath, [path.join(RAIZ, script)], {
    input: JSON.stringify(entrada),
    env: { ...process.env, VCC_PERFIL: '', VCC_IDIOMA: '', VCC_NOTIFICAR: '0', ...env },
    encoding: 'utf8',
  });
}

test('memoria: lee los últimos aprendizajes y recorta líneas largas', () => {
  const d = tmp();
  fs.mkdirSync(path.join(d, '.vcc'));
  const lineas = ['# Aprendizajes', ''];
  for (let i = 1; i <= 20; i++) lineas.push(`- 2026-11-24 [build] aprendizaje ${i}`);
  lineas.push('- ' + 'x'.repeat(500));
  fs.writeFileSync(path.join(d, '.vcc', 'aprendizajes.md'), lineas.join('\n'));
  const a = leerAprendizajes(d);
  assert.equal(a.length, 12);
  assert.ok(a.at(-1).length <= 220);
  assert.match(a[0], /aprendizaje 10/);
  assert.deepEqual(leerAprendizajes(tmp()), []);
});

test('memoria: guardarEstado conserva lo escrito a mano y reemplaza solo la parte automática', () => {
  const d = repo();
  fs.writeFileSync(path.join(d, 'a.txt'), 'hola');
  guardarEstado(d, 'PreCompact');
  const archivo = path.join(d, '.vcc', 'sesion.md');
  let txt = fs.readFileSync(archivo, 'utf8');
  assert.match(txt, /Rama: `main`/);
  assert.match(txt, /a\.txt/);
  fs.writeFileSync(archivo, '# Sesión\n## Objetivo\nTerminar pagos\n\n' + txt.slice(txt.indexOf(MARCA_INICIO)));
  guardarEstado(d, 'SessionEnd');
  txt = fs.readFileSync(archivo, 'utf8');
  assert.match(txt, /Terminar pagos/);
  assert.equal(txt.split(MARCA_INICIO).length, 2, 'una sola sección automática');
  assert.match(txt, /SessionEnd/);
  assert.equal(fs.readFileSync(path.join(d, '.vcc', '.gitignore'), 'utf8'), 'sesion.md\nplan.md\nobservaciones.json\n');
});

test('inicio-sesion muestra aprendizajes como notas', () => {
  const d = tmp();
  fs.mkdirSync(path.join(d, '.vcc'));
  fs.writeFileSync(path.join(d, '.vcc', 'aprendizajes.md'), '- 2026-11-24 [api] El SII responde 200 con error en el body\n');
  const r = correr('scripts/hooks/inicio-sesion.js', {}, { CLAUDE_PROJECT_DIR: d });
  assert.match(r.stdout, /no instrucciones/);
  assert.match(r.stdout, /SII responde 200/);
});

test('estado-automatico respeta el perfil minimo y VCC_MEMORIA=0', () => {
  const d = repo();
  correr('scripts/hooks/estado-automatico.js', { hook_event_name: 'PreCompact' }, { CLAUDE_PROJECT_DIR: d, VCC_PERFIL: 'minimo' });
  assert.ok(!fs.existsSync(path.join(d, '.vcc')));
  correr('scripts/hooks/estado-automatico.js', { hook_event_name: 'PreCompact' }, { CLAUDE_PROJECT_DIR: d, VCC_MEMORIA: '0' });
  assert.ok(!fs.existsSync(path.join(d, '.vcc')));
  const r = correr('scripts/hooks/estado-automatico.js', { hook_event_name: 'PreCompact' }, { CLAUDE_PROJECT_DIR: d });
  assert.ok(fs.existsSync(path.join(d, '.vcc', 'sesion.md')));
  assert.match(r.stdout, /guardar-sesion/);
});

test('formatear: solo con configuración y binario presentes', () => {
  const d = tmp();
  const ts = path.join(d, 'src', 'a.ts');
  fs.mkdirSync(path.dirname(ts), { recursive: true });
  fs.writeFileSync(ts, 'const a=1');
  assert.equal(elegirFormateador(ts, d), null, 'sin prettier instalado');
  fs.writeFileSync(path.join(d, '.prettierrc'), '{}');
  assert.equal(elegirFormateador(ts, d), null, 'config sin binario local');
  fs.mkdirSync(path.join(d, 'node_modules', '.bin'), { recursive: true });
  fs.writeFileSync(path.join(d, 'node_modules', '.bin', 'prettier'), '');
  assert.equal(path.basename(elegirFormateador(ts, d)[0]), 'prettier');

  const cpp = path.join(d, 'x.cpp');
  const falso = (b) => (b === 'clang-format' ? '/usr/bin/clang-format' : null);
  assert.equal(elegirFormateador(cpp, d, falso), null, 'sin .clang-format');
  fs.writeFileSync(path.join(d, '.clang-format'), '');
  assert.deepEqual(elegirFormateador(cpp, d, falso), ['/usr/bin/clang-format', ['-i', cpp]]);
  assert.equal(elegirFormateador(path.join(d, 'x.txt'), d, falso), null);
});

test('revision-final: detecta restos de depuración en líneas agregadas', () => {
  const diff = [
    'diff --git a/src/a.ts b/src/a.ts',
    '--- a/src/a.ts',
    '+++ b/src/a.ts',
    '@@ -10,0 +11,3 @@',
    '+const x = 1',
    '+console.log(x)',
    '+  debugger',
    'diff --git a/lib.rs b/lib.rs',
    '--- a/lib.rs',
    '+++ b/lib.rs',
    '@@ -1 +1 @@',
    '-let a = 1;',
    '+let a = dbg!(1);',
    '+++ b/README.md',
    '@@ -1 +1 @@',
    '+console.log en un README no cuenta',
  ].join('\n');
  const h = buscarRestos(diff);
  assert.deepEqual(h.map((x) => `${x.archivo}:${x.linea}:${x.nombre}`), [
    'src/a.ts:12:console.log',
    'src/a.ts:13:debugger',
    'lib.rs:1:dbg!',
  ]);
});

test('revision-final: bloquea una vez y no entra en bucle', () => {
  const d = repo();
  fs.writeFileSync(path.join(d, 'a.js'), 'x\n');
  execFileSync('git', ['-C', d, 'add', '.']);
  execFileSync('git', ['-C', d, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'a']);
  fs.writeFileSync(path.join(d, 'a.js'), 'x\nconsole.log("hola")\n');
  let r = correr('scripts/hooks/revision-final.js', { cwd: d }, { CLAUDE_PROJECT_DIR: d });
  const out = JSON.parse(r.stdout);
  assert.equal(out.decision, 'block');
  assert.match(out.reason, /a\.js:2/);
  r = correr('scripts/hooks/revision-final.js', { cwd: d, stop_hook_active: true }, { CLAUDE_PROJECT_DIR: d });
  assert.equal(r.stdout, '');
  r = correr('scripts/hooks/revision-final.js', { cwd: d }, { CLAUDE_PROJECT_DIR: d, VCC_PERFIL: 'minimo' });
  assert.equal(r.stdout, '');
});

test('barra de estado y notificaciones', () => {
  const s = componer({ model: { display_name: 'Opus' }, workspace: { current_dir: '/x/cforge' } }, { rama: 'main', cambios: 3 }, 'estandar');
  assert.equal(s, '🤖 Opus  ·  📁 cforge  ·  🌿 main ±3  ·  🛡️ estandar');
  assert.equal(escaparAppleScript('a "b" \\ c\nd'), 'a \\"b\\" \\\\ c d');
});
