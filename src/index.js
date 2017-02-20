(() => {
    if (window.location.pathname.endsWith('.html')) return;

    const debug = require('./utils/debug');
    require('./modules/**/index.js', {mode: 'expand'});
    debug.log(`BetterTTV v${debug.version} loaded.`);

    /* TODO:
     - Modules for:
        - Chat State
        - Chat Settings (and scrollback amount)
        - Chat freeze
        - Chat custom timeouts
        - Split chat
        - Pinned highlights (and timeout)
        - Better Viewer List
        - Notifications (desktop, following notices, mentions, audible setting too)
        - Free sub reminder
        - Hide prime promotions
        - Hide featured/recommended channels, games, etc.
        - Channel broadcast info auto-updating
        - Blue buttons?
        - Hide group chat?
        - Hide bits
        - Host button
        - Conversations (and hide conversations when inactive?)
        - Hide friends (and friend activity)
        - Disable whispers
        - Mod card keybinds
        - Deleted messages
        - Chat line history?
    */
})();
