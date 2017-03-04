(() => {
    if (window.location.pathname.endsWith('.html')) return;

    const Raven = require('raven-js');

    if (process.env.NODE_ENV !== 'development') {
        Raven.config(
            process.env.SENTRY_URL,
            {
                release: process.env.GIT_REV,
                environment: process.env.NODE_ENV
            }
        ).install();
    }

    const debug = require('./utils/debug');

    require('./modules/**/index.js', {mode: (base, files) => {
        return files.map(module => {
            return `
                try {
                    Raven.context(() => require('${module}'));
                } catch (e) {
                    debug.error('Failed to ${module}', e.stack);
                }
            `;
        }).join(' ');
    }});

    debug.log(`BetterTTV v${debug.version} loaded.`);

    /* TODO:
     - Modules for:
        - Chat (channel, replay, conversations)
        - Chat State
        - Chat Settings (and scrollback amount)
        - Chat Custom Timeouts
        - Chat Deleted messages
        - Chat Commands
        - Chat Tab Completion
        - Chat Moderator Cards
        - Chat Pinned Highlights (and timeout)
        - Chat Highlights/Blacklist
        - Notifications (desktop, following notices, mentions, audible setting too)
    */
})();
