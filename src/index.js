
async function main() {
    if (!String.prototype.includes || !Array.prototype.findIndex) return;
    if (window.location.pathname.endsWith('.html')) return;
    if (!['www.twitch.tv', 'canary.twitch.tv', 'clips.twitch.tv', 'dashboard.twitch.tv', 'embed.twitch.tv'].includes(window.location.hostname)) return;
    if (window.Ember) return;

    const cookies = (await import('cookies-js')).default
    const debug = (await import('./utils/debug')).default
    const twitch = (await import('./utils/twitch')).default
    const watcher = (await import('./watcher')).default

    const userCookie = cookies.get('twilight-user');
    if (userCookie) {
        try {
            const {authToken, id, login, displayName} = JSON.parse(userCookie);
            twitch.setCurrentUser(authToken, id, login, displayName);
        } catch (_) {
            debug.log('error loading user from twilight user cookie');
        }
    }

    import('./modules/**/index.js');

    watcher.setup();

    debug.log(`BetterTTV v${debug.version} loaded. ${process.env.NODE_ENV} @ ${process.env.GIT_REV}`);

    window.BetterTTV = {
        version: debug.version,
        settings: (await import('./settings')).default,
        watcher: {
            emitLoad: name => watcher.emit(`load.${name}`),
        },
    };
}

main();
