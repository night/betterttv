import cookies from 'cookies-js';
import debug from './utils/debug';
import twitch from './utils/twitch';
import watcher from './watcher';

import modules from './modules/**/index.js'

async function main () {
    if (!String.prototype.includes || !Array.prototype.findIndex) return;
    if (window.location.pathname.endsWith('.html')) return;
    if (
        ![
            'www.twitch.tv',
            'canary.twitch.tv',
            'release.twitch.tv',
            'clips.twitch.tv',
            'dashboard.twitch.tv',
            'embed.twitch.tv'
        ].includes(window.location.hostname) &&
        !window.location.hostname.endsWith('.release.twitch.tv')
    ) return;
    if (window.Ember) return;

    const userCookie = cookies.get('twilight-user');
    if (userCookie) {
        try {
            const {authToken, id, login, displayName} = JSON.parse(userCookie);
            twitch.setCurrentUser(authToken, id, login, displayName);
        } catch (_) {
            debug.log('error loading user from twilight user cookie');
        }
    }

    watcher.setup();

    debug.log(`BetterTTV v${debug.version} loaded. ${process.env.NODE_ENV} @ ${process.env.GIT_REV}`);

    window.BetterTTV = {
        version: debug.version,
        settings: await import('./settings'),
        watcher: {
            emitLoad: name => watcher.emit(`load.${name}`),
        },
    };
}

main(); 
