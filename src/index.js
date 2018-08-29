(() => {
    if (!String.prototype.includes || !Array.prototype.findIndex) return;
    if (window.location.pathname.endsWith('.html')) return;
    if (!['www.twitch.tv', 'canary.twitch.tv', 'clips.twitch.tv'].includes(window.location.hostname)) return;

    if (window.Ember) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://legacy.betterttv.net/betterttv.js';
        const head = document.getElementsByTagName('head')[0];
        if (!head) return;
        head.appendChild(script);
        return;
    }

    const IS_PROD = process.env.NODE_ENV !== 'development';

    try {
        if (IS_PROD && localStorage.getItem('bttv_developerMode') === 'true') {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `${process.env.DEV_CDN_ENDPOINT}betterttv.js`;
            const head = document.getElementsByTagName('head')[0];
            if (!head) return;
            head.appendChild(script);
            return;
        }
    } catch (_) {}

    const Raven = require('raven-js');

    /*

     TODO:

     - TwitchEmotes Sub Emote Tip
     - Disable Channel Header (Twitch did not implement this yet)

    */

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
        settings: require('./settings')
    };
})();
