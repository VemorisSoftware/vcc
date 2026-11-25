#!/usr/bin/env node
'use strict';

// PostToolUse(Write|Edit|MultiEdit): formatea el archivo editado con el
// formateador que el proyecto YA usa. Solo binarios locales o del sistema,
// nunca descarga nada (no usa npx). Si no hay formateador, no hace nada.

const path = require('path');
const { perfil, leerEntrada, dirProyecto, ejecutar, existe, enPath, buscarHaciaArriba, desactivadoPorEnv } = require('../lib/comun');

const EXT = {
  prettier: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css', '.scss', '.html', '.vue', '.svelte', '.md', '.yml', '.yaml'],
  swift: ['.swift'],
  clang: ['.c', '.cc', '.cpp', '.cxx', '.h', '.hh', '.hpp', '.hxx', '.m', '.mm'],
  python: ['.py'],
  rust: ['.rs'],
};

const PRETTIER_CONFIG = ['.prettierrc', '.prettierrc.json', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.mjs', '.prettierrc.yaml', '.prettierrc.yml', 'prettier.config.js', 'prettier.config.mjs', 'prettier.config.cjs'];

// Devuelve [binario, args] o null. Exportada para pruebas.
function elegirFormateador(archivo, proyecto, buscarBin = enPath) {
  const ext = path.extname(archivo).toLowerCase();
  const dir = path.dirname(archivo);

  if (EXT.prettier.includes(ext)) {
    const conf = buscarHaciaArriba(dir, PRETTIER_CONFIG, proyecto);
    const bin = path.join(proyecto, 'node_modules', '.bin', process.platform === 'win32' ? 'prettier.cmd' : 'prettier');
    if (conf && existe(bin)) return [bin, ['--write', '--log-level', 'warn', archivo]];
    return null;
  }
  if (EXT.swift.includes(ext)) {
    if (!buscarHaciaArriba(dir, ['.swift-format'], proyecto)) return null;
    const bin = buscarBin('swift-format');
    if (bin) return [bin, ['format', '--in-place', archivo]];
    if (process.platform === 'darwin' && buscarBin('xcrun')) return ['xcrun', ['swift-format', 'format', '--in-place', archivo]];
    return null;
  }
  if (EXT.clang.includes(ext)) {
    if (!buscarHaciaArriba(dir, ['.clang-format', '_clang-format'], proyecto)) return null;
    const bin = buscarBin('clang-format');
    return bin ? [bin, ['-i', archivo]] : null;
  }
  if (EXT.python.includes(ext)) {
    if (!buscarHaciaArriba(dir, ['ruff.toml', '.ruff.toml'], proyecto)) return null;
    const bin = buscarBin('ruff');
    return bin ? [bin, ['format', '--quiet', archivo]] : null;
  }
  if (EXT.rust.includes(ext)) {
    if (!buscarHaciaArriba(dir, ['rustfmt.toml', '.rustfmt.toml', 'Cargo.toml'], proyecto)) return null;
    const bin = buscarBin('rustfmt');
    return bin ? [bin, ['--quiet', archivo]] : null;
  }
  return null;
}

async function main() {
  if (perfil() === 'minimo' || desactivadoPorEnv('VCC_FORMATEAR')) return;
  const entrada = await leerEntrada();
  const archivo = entrada.tool_input && entrada.tool_input.file_path;
  if (!archivo || !existe(archivo)) return;
  const proyecto = dirProyecto(entrada);
  // Solo archivos dentro del proyecto.
  const rel = path.relative(proyecto, archivo);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return;
  const f = elegirFormateador(archivo, proyecto);
  if (f) ejecutar(f[0], f[1], { cwd: proyecto, timeout: 15000 });
}

if (require.main === module) {
  main().catch(() => {}).finally(() => process.exit(0));
}

module.exports = { elegirFormateador };
