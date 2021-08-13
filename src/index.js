(async (currentScript) => {
  if (!String.prototype.includes || !Array.prototype.findIndex) return;
  if (window.location.pathname.endsWith('.html')) return;
  if (
    ![
      'www.twitch.tv',
      'canary.twitch.tv',
      'release.twitch.tv',
      'clips.twitch.tv',
      'dashboard.twitch.tv',
      'embed.twitch.tv',
    ].includes(window.location.hostname) &&
    !window.location.hostname.endsWith('.release.twitch.tv')
  )
    return;
  if (window.Ember) return;

  // prevent loads in source-less iframes
  try {
    const {frameElement} = window;
    if (frameElement != null && (frameElement.src == null || frameElement.src === '')) {
      return;
    }
  } catch (e) {}

  // some people have multiple versions of BetterTTV, for whatever reason
  if (window.BetterTTV || window.__betterttv) return;
  window.__betterttv = true;

  await import('./utils/sentry.js');

  const {default: extension} = await import('./utils/extension.js');
  extension.setCurrentScript(currentScript);

  const {default: globalCSS} = await import('./modules/global_css/index.js');
  const globalCSSLoadPromise = globalCSS.loadGlobalCSS();

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

  // wait until styles load to prevent flashing
  await globalCSSLoadPromise;

  // eslint-disable-next-line import/no-unresolved
  await import('./modules/**/index.js');

  watcher.setup();

  debug.log(`BetterTTV v${debug.version} loaded. ${process.env.NODE_ENV} @ ${process.env.GIT_REV}`);

  window.BetterTTV = {
    version: debug.version,
    settings: (await import('./settings.js')).default,
    watcher: {
      emitLoad: (name) => watcher.emit(`load.${name}`),
    },
  };
})(document.currentScript);
