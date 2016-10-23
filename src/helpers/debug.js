// const settings = require('../settings');

function log() {
    if (!window.console || !window.console.log) return;
    /* settings.get('consoleLog').then(value => {
        if (!value) return;
        const args = Array.prototype.slice.call(arguments);
        window.console.log.apply(window.console.log, ['BTTV:'].concat(args));
    });*/
    const args = Array.prototype.slice.call(arguments);
    window.console.log.apply(window.console.log, ['BTTV:'].concat(args));
}

module.exports = {
    log
};
