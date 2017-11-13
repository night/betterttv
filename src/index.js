(() => {
    if (!String.prototype.includes || !Array.prototype.findIndex) return;
    if (window.location.pathname.endsWith('.html') || window.location.hostname === 'player.twitch.tv') return;

    const Raven = require('raven-js');

    /*
    
     TODO:

     - Anon Chat
     - TwitchEmotes Sub Emote Tip
     - Chat Commands
     - Chat Deleted Messages
     - Chat Moderator Cards (Twitch did not implement this yet)
     - Clips (Twitch did not implement this yet)
     - Disable Channel Header (Twitch did not implement this yet)
     - Emote Menu? (requires a lot of work, maybe time to just try and integrate into twitch's)
     - Hide Conversations (Twitch did not implement this yet)
     - Host Button
     - Tab Completion? (requires a lot of work, maybe time to just try and integrate into twitch's)
     - Video Player Keybinds/Clicks (Twitch did not implement a full player yet; using iframe rn)

     ? - denotes maybe not returning

    */

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
                    'container.className.match is not a function',
                    'this exception cannot be caught',
                    'Wrong length!',
                    'Cannot read property \'value\' of undefined',
                    '"onJsReady"',
                    'Can\'t execute code from a freed script',
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
                    'jQuery is not a function',
                    'unsupported pseudo: hover',
                    // Emote Menu
                    'Getter already exists.',
                    'Cannot read property \'setChannelName\' of undefined',
                    '.getTime is not a function',
                    '`callback` must be a function.'
                ],
                whitelistUrls: [
                    /betterttv\.js/,
                    /\.betterttv\.net/
                ],
                shouldSendCallback: data => {
                    const exception = data.exception && data.exception.values[0];
                    if (data.message && data.message.includes('betterttv.js in wrap')) return false;
                    if (data.message === 'out of memory') return;
                    if (['betterttv in apply', 'wrapped(betterttv)'].includes(data.culprit)) return false;
                    if (exception && !exception.value) return false;
                    if (exception && ['NS_ERROR_NOT_INITIALIZED', 'NS_ERROR_OUT_OF_MEMORY', 'NS_ERROR_FAILURE'].includes(exception.type)) return true;
                    if (data.exception && data.exception.values.length < 3) return false;
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
