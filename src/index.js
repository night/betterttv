(() => {
    if (!window._babelPolyfill) {
        require('babel-polyfill');
    }

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
                    'InvalidAccessError',
                    'wrapped(betterttv)',
                    'Access is denied.',
                    /^<anonymous> in/,
                    /^null$/,
                    /^undefined$/,
                    // Users that have broken jQuery
                    'this.dom.draggable is not a function',
                    'Cannot read property \'autoNS\' of undefined',
                    'jQuery(...).tipsy is not a function',
                    'jQuery(...).draggable is not a function'
                ],
                whitelistUrls: [
                    /betterttv\.js/,
                    /\.betterttv\.net/
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

    window.BetterTTV = {
        version: debug.version,
        settings: require('./settings')
    };
})();
