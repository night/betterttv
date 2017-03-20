(() => {
    require('babel-polyfill');

    if (window.location.pathname.endsWith('.html')) return;

    const Raven = require('raven-js');

    if (process.env.NODE_ENV !== 'development') {
        Raven.config(
            process.env.SENTRY_URL,
            {
                release: process.env.GIT_REV,
                environment: process.env.NODE_ENV,
                ignoreErrors: [
                    'Blocked a frame with origin',
                    'player-core-min',
                    'NS_ERROR_NOT_INITIALIZED'
                ],
                ignoreUrls: [
                    /\/script\/script\.min\.js$/,
                    /player\.js$/,
                    /player-core-min\.js$/,
                    /instream\/video\/client\.js$/
                ]
            }
        ).install();
    }

    const debug = require('./utils/debug');

    require('./modules/**/index.js', {mode: (base, files) => {
        return files.map(module => {
            return `
                try {
                    require('${module}');
                } catch (e) {
                    Raven.captureException(e);
                    debug.error('Failed to ${module}', e.stack);
                }
            `;
        }).join(' ');
    }});

    debug.log(`BetterTTV v${debug.version} loaded.`);
})();
