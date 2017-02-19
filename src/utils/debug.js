const storage = require('../storage');

function log() {
    if (!window.console || !window.console.log || !storage.get('consoleLog')) return;
    const args = Array.prototype.slice.call(arguments);
    window.console.log.apply(window.console.log, ['BTTV:'].concat(args));
}

module.exports = {
    log
};
