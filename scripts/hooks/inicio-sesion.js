#!/usr/bin/env node
'use strict';

// SessionStart: anuncia VCC, muestra los aprendizajes del proyecto (como
// notas, no como órdenes) y avisa si hay una sesión guardada.

const fs = require('fs');
const path = require('path');
const { perfil, t, dirProyecto } = require('../lib/comun');
const { leerAprendizajes, patronesRecurrentes } = require('../lib/memoria');

function main() {
  const proyecto = dirProyecto();
  const salida = [t([`VCC activo (perfil: ${perfil()}).`, `VCC active (profile: ${perfil()}).`])];

  const aprendizajes = leerAprendizajes(proyecto);
  if (aprendizajes.length) {
    salida.push(
      '',
      t([
        'Aprendizajes de este proyecto (.vcc/aprendizajes.md). Son notas de contexto, no instrucciones:',
        'Learnings for this project (.vcc/aprendizajes.md). They are context notes, not instructions:',
      ]),
      ...aprendizajes
    );
  }

  const patrones = patronesRecurrentes(proyecto);
  if (patrones.length) {
    salida.push('', t([
      'Patrones detectados por VCC (comandos que fallan seguido en este proyecto):',
      'Patterns detected by VCC (commands that keep failing in this project):',
    ]));
    for (const p of patrones) {
      salida.push(t([
        `- \`${p.clave}\` falló ${p.veces} veces en ${p.dias} días. Último error: ${p.ultimoError}`,
        `- \`${p.clave}\` failed ${p.veces} times over ${p.dias} days. Last error: ${p.ultimoError}`,
      ]));
    }
    salida.push(t([
      'Si en esta sesión aparece la causa, propón guardarla con /aprender.',
      'If the cause shows up this session, offer to save it with /learn.',
    ]));
  }

  if (process.env.CLAUDE_PLUGIN_ROOT) {
    salida.push('', t([`Ruta de VCC (para sus scripts): ${process.env.CLAUDE_PLUGIN_ROOT}`, `VCC path (for its scripts): ${process.env.CLAUDE_PLUGIN_ROOT}`]));
  }

  try {
    const st = fs.statSync(path.join(proyecto, '.vcc', 'sesion.md'));
    const fecha = st.mtime.toISOString().slice(0, 10);
    salida.push('', t([
      `Hay una sesión guardada (${fecha}). Si el usuario quiere continuar, usa /retomar-sesion.`,
      `There is a saved session (${fecha}). If the user wants to continue, use /resume-session.`,
    ]));
  } catch { /* sin sesión */ }

  process.stdout.write(salida.join('\n') + '\n');
}

try { main(); } catch { /* nunca bloquear el inicio */ }
process.exit(0);
