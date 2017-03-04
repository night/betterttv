const storage = require('../storage');

const VERSION = process.env.EXT_VER;

function log(type, ...args) {
    if (!window.console || !storage.get('consoleLog')) return;
    window.console[type].apply(window.console[type], ['BTTV:'].concat(args));
}

module.exports = {
    log: log.bind(this, 'log'),
    error: log.bind(this, 'error'),
    warn: log.bind(this, 'warn'),
    version: VERSION
};
