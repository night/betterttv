
async function main() {
    if (!String.prototype.includes || !Array.prototype.findIndex) return;
    if (window.location.pathname.endsWith('.html')) return;
    if (!['www.twitch.tv', 'canary.twitch.tv', 'clips.twitch.tv', 'dashboard.twitch.tv', 'embed.twitch.tv'].includes(window.location.hostname)) return;
    if (window.Ember) return;

    const {default: cookies} = await import('cookies-js');
    const {default: debug} = await import('./utils/debug.js');
    const {default: twitch} = await import('./utils/twitch.js');
    const {default: watcher} = await import('./watcher.js');

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
        settings: (await import('./settings.js')).default,
        watcher: {
            emitLoad: name => watcher.emit(`load.${name}`),
        },
    };
}

main();
