'use strict';

// Notificación de escritorio sin dependencias. macOS: osascript.
// Linux: notify-send si existe. Otros: nada.

const { ejecutar, enPath } = require('./comun');

function escaparAppleScript(s) {
  return String(s).replace(/[\\"]/g, '\\$&').replace(/[\r\n]+/g, ' ').slice(0, 200);
}

function notificar(titulo, mensaje) {
  try {
    if (process.platform === 'darwin') {
      const script = `display notification "${escaparAppleScript(mensaje)}" with title "${escaparAppleScript(titulo)}" sound name "Glass"`;
      ejecutar('osascript', ['-e', script], { timeout: 3000 });
    } else if (process.platform === 'linux' && enPath('notify-send')) {
      ejecutar('notify-send', [String(titulo).slice(0, 100), String(mensaje).slice(0, 200)], { timeout: 3000 });
    }
  } catch { /* nunca falla */ }
}

module.exports = { notificar, escaparAppleScript };
