(() => {
    if (window.location.pathname.endsWith('.html')) return;

    const debug = require('./utils/debug');
    require('./modules/**/index.js', {mode: 'expand'});
    debug.log(`BetterTTV v${debug.version} loaded.`);

    /* TODO:
     - Modules for:
        - Chat State
        - Chat Settings (and scrollback amount)
        - Anon chat?
        - Auto Theater Mode
        - Chat freeze
        - Chat custom timeouts
        - Split chat
        - Pinned highlights (and timeout)
        - Better Viewer List
        - Notifications (desktop, following notices, mentions, audible setting too)
        - Dashboard features (chat flip, extra stat counts)
        - Player viewer count
        - Free sub reminder
        - Twitch chat emotes plugin
        - Video player features (viewer count + click to pause)
        - Hide prime promotions
        - Hide featured/recommended channels, games, etc.
        - Channel broadcast info auto-updating
        - Chat polls
        - Blue buttons?
        - Disable channel header
        - Hide group chat?
        - Hide bits
        - Host button
        - Conversations (and hide conversations when inactive?)
        - Hide friends (and friend activity)
        - Directory preview
        - Disable front page autoplay
        - Disable whispers
        - Mod card keybinds
        - Deleted messages
        - Chat line history?
    */
})();
