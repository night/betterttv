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
                    'Cannot read property \'autoWE\' of undefined',
                    'tipsy is not a function',
                    'tipsy is undefined',
                    'draggable is not a function',
                    'draggable is undefined',
                    // Emote Menu
                    'Cannot read property \'setChannelName\' of undefined',
                    'l is undefined'
                ],
                whitelistUrls: [
                    /betterttv\.js/,
                    /\.betterttv\.net/
                ],
                shouldSendCallback: data => {
                    const exception = data.exception && data.exception.values[0];
                    if (data.message && data.message.includes('betterttv.js in wrap')) return false;
                    if (data.culprit === 'wrapped(betterttv)') return false;
                    if (exception && !exception.value) return false;
                    if (exception && ['NS_ERROR_NOT_INITIALIZED', 'NS_ERROR_OUT_OF_MEMORY', 'NS_ERROR_FAILURE'].includes(exception.type)) return true;
                    return true;
                }
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
