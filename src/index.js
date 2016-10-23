(() => {
    if (window.location.pathname.endsWith('.html')) return;

    const debug = require('./helpers/debug');
    const version = require('../package.json').version;
    const watcher = require('./watcher'); // eslint-disable-line

    debug.log(`BetterTTV v${version} loaded.`);
})();
