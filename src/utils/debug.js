const $ = require('jquery');
const storage = require('../storage');

const VERSION = process.env.EXT_VER;

// Twitch is overwriting the console logging with their own..
// so try to steal a console off an iframe
let console = window.console;
try {
    console = $('iframe')[0].contentWindow.console;
} catch (e) {}

function log(type, ...args) {
    if (!console || !storage.get('consoleLog')) return;
    console[type].apply(console, ['BTTV:'].concat(args));
}

module.exports = {
    log: log.bind(this, 'log'),
    error: log.bind(this, 'error'),
    warn: log.bind(this, 'warn'),
    info: log.bind(this, 'info'),
    version: VERSION
};
