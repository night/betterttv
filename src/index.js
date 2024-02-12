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
      'www.youtube.com',
      'studio.youtube.com',
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

  const Sentry = await import('./utils/sentry.js');

  try {
    const {load: loadI18n} = await import('./i18n/index.js');
    await loadI18n();

    const {default: extension} = await import('./utils/extension.js');
    extension.setCurrentScript(currentScript);

    const {default: globalCSS} = await import('./modules/global_css/index.js');
    const globalCSSLoadPromise = globalCSS.loadGlobalCSS();

    const {default: debug} = await import('./utils/debug.js');
    const {default: watcher} = await import('./watcher.js');
    const {EXT_VER, NODE_ENV, GIT_REV} = await import('./constants.js');

    // wait until styles load to prevent flashing
    await globalCSSLoadPromise;

    // eslint-disable-next-line import/no-unresolved
    await import('./modules/**/index.js');

    watcher.setup();

    debug.log(`BetterTTV v${EXT_VER} loaded. ${NODE_ENV} @ ${GIT_REV}`);

    window.BetterTTV = {
      version: EXT_VER,
      settings: (await import('./settings.js')).default,
      emoteMenu: (await import('./common/api/emote-menu.js')).default,
      watcher: {
        emitLoad: (name) => watcher.emit(`load.${name}`),
      },
    };
  } catch (e) {
    Sentry.captureException(e);
  }
})(document.currentScript);
