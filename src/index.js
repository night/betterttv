// Global (non-module) stylesheets.
import.meta.glob(['./modules/**/*.css', '!./modules/**/*.module.css'], {eager: true});
import '@mantine/core/styles.css';

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
    if (
      frameElement != null &&
      (frameElement.src == null || frameElement.src === '') &&
      frameElement.id !== 'chatframe'
    ) {
      return;
    }
  } catch (e) {}

  // some people have multiple versions of BetterTTV, for whatever reason
  if (window.BetterTTV || window.__betterttv) return;
  window.__betterttv = true;

  const {default: Sentry} = await import('@/utils/sentry');

  try {
    const {load: loadI18n} = await import('@/i18n/index');
    await loadI18n();

    const {default: extension} = await import('@/utils/extension');
    // In dev the entry may run as an ES module (Vite HMR), where `document.currentScript` is null;
    // seed the asset base from the dev server origin so cdn.url() resolves.
    await extension.setCurrentScript(
      import.meta.env.DEV ? {src: `${process.env.DEV_CDN_ENDPOINT}betterttv.js`} : currentScript
    );

    const {default: globalCSS} = await import('@/modules/global_css/index');
    const globalCSSLoadPromise = globalCSS.loadGlobalCSS();

    const {default: debug} = await import('@/utils/debug');
    const {default: watcher} = await import('./watcher');
    const {EXT_VER, NODE_ENV, GIT_REV} = await import('./constants');

    // wait until styles load to prevent flashing
    await globalCSSLoadPromise;

    const {importAll} = await import('@/utils/modules');
    await importAll(import.meta.glob('./modules/**/index.js'));

    watcher.setup();

    debug.log(`BetterTTV v${EXT_VER} loaded. ${NODE_ENV} @ ${GIT_REV}`);

    window.BetterTTV = {
      version: EXT_VER,
      settings: (await import('./settings')).default,
      emoteMenu: (await import('@/common/api/emote-menu')).default,
      watcher: {
        emitLoad: (name) => watcher.emit(`load.${name}`),
      },
    };
  } catch (e) {
    Sentry.captureException(e);
  }
})(document.currentScript);
