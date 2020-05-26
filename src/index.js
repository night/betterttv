(() => {
    if (!String.prototype.includes || !Array.prototype.findIndex) return;
    if (window.location.pathname.endsWith('.html')) return;
    if (!['www.twitch.tv', 'canary.twitch.tv', 'clips.twitch.tv', 'dashboard.twitch.tv'].includes(window.location.hostname)) return;
    if (window.Ember) return;

    const debug = require('./utils/debug');
    const watcher = require('./watcher');

    require('./modules/**/index.js', {mode: (base, files) => {
        return files.map(module => {
            return `
                try {
                    require('${module}');
                } catch (e) {
                    debug.error('Failed to ${module}', e.stack);
                }
            `;
        }).join(' ');
    }});

    debug.log(`BetterTTV v${debug.version} loaded. ${process.env.NODE_ENV} @ ${process.env.GIT_REV}`);

    window.BetterTTV = {
        version: debug.version,
        settings: require('./settings'),
        watcher: {
            emitLoad: name => watcher.emit(`load.${name}`),
        },
    };
})();
