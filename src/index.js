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

  // some people have multiple versions of BetterTTV, for whatever reason
  if (window.BetterTTV || window.__betterttv) return;
  window.__betterttv = true;

  const {default: extension} = await import('./utils/extension.js');
  extension.setCurrentScript(currentScript);

  const Sentry = await import('@sentry/browser');
  const {Dedupe: DedupeIntegration} = await import('@sentry/integrations');

  Sentry.init({
    release: process.env.GIT_REV,
    environment: process.env.NODE_ENV,
    dsn: process.env.SENTRY_URL,
    ignoreErrors: [
      'InvalidAccessError',
      'out of memory',
      'InvalidStateError',
      'QuotaExceededError',
      'NotFoundError',
      'SecurityError',
      'AbortError',
      'TypeMismatchError',
      'HierarchyRequestError',
      'IndexSizeError',
      /^undefined$/,
      `Unexpected token '<'`,
      'prompt() is and will not be supported.',
      'ChunkLoadError',
      'Loading CSS chunk',
      'Failed to fetch',
      'NetworkError',
    ],
    allowUrls: [/betterttv\.js/, /\.betterttv\.net/],
    denyUrls: [/static\.twitchcdn\.net\/assets/, /avalon\.js/, /avalon\.[a-zA-Z0-9]+\.js/, /script\.js/],
    integrations: [
      new Sentry.Integrations.GlobalHandlers({
        onunhandledrejection: false,
      }),
      new Sentry.Integrations.TryCatch({
        requestAnimationFrame: false,
      }),
      new DedupeIntegration(),
    ],
  });

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
