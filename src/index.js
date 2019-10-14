(() => {
    if (!String.prototype.includes || !Array.prototype.findIndex) return;
    if (window.location.pathname.endsWith('.html')) return;
    if (!['www.twitch.tv', 'canary.twitch.tv', 'clips.twitch.tv', 'dashboard.twitch.tv'].includes(window.location.hostname)) return;
    if (window.Ember) return;

    const IS_PROD = process.env.NODE_ENV !== 'development';

    const Raven = require('raven-js');

    if (IS_PROD) {
        Raven.config(
            process.env.SENTRY_URL,
            {
                release: process.env.GIT_REV,
                environment: process.env.NODE_ENV,
                captureUnhandledRejections: false,
                ignoreErrors: [
                    'InvalidAccessError',
                    'out of memory',
                    'InvalidStateError',
                    'QuotaExceededError',
                    'NotFoundError',
                    'SecurityError',
                    'AbortError',
                    'TypeMismatchError',
                    'HierarchyRequestError',
                    'IndexSizeError',
                    /^undefined$/,
                ],
                whitelistUrls: [
                    /betterttv\.js/,
                    /\.betterttv\.net/
                ],
                shouldSendCallback: data => {
                    if (data.message && data.message.includes('raven-js/src/raven')) return false;
                    const exception = data.exception && data.exception.values[0];
                    if (exception && ['NS_ERROR_NOT_INITIALIZED', 'NS_ERROR_OUT_OF_MEMORY', 'NS_ERROR_FAILURE', 'NS_ERROR_FILE_CORRUPTED'].includes(exception.type)) return false;
                    if (data.exception && data.exception.values.length < 2) return false;
                    return true;
                }
            }
        ).install();
    }

    const debug = require('./utils/debug');
    const watcher = require('./watcher');

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

    debug.log(`BetterTTV v${debug.version} loaded. ${process.env.NODE_ENV} @ ${process.env.GIT_REV}`);

    window.BetterTTV = {
        version: debug.version,
        settings: require('./settings'),
        watcher: {
            emitLoad: name => watcher.emit(`load.${name}`),
        },
    };
})();
