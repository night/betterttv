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

  const ignoreErrors = [
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
    'Loading chunk',
    'Failed to fetch',
    'NetworkError',
    'getAnimatedEmoteMode is not a function',
    'can\'t redefine non-configurable property "userAgent"',
    '$ is not defined',
  ];

  Sentry.init({
    release: process.env.GIT_REV,
    environment: process.env.NODE_ENV,
    dsn: process.env.SENTRY_URL,
    ignoreErrors,
    allowUrls: [/betterttv\.js/, /\.betterttv\.net/, /\/betterttv\//i],
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
    beforeSend: (event) => {
      const {exception} = event;
      const exceptionValue = exception != null && exception.values != null && event.exception.values[0];
      if (exceptionValue != null) {
        // exceptions without a stacktrace are non-actionable
        if (exceptionValue.stacktrace == null) {
          return null;
        }

        // exceptions with an anonymous stacktrace are non-actionable
        const {frames} = exceptionValue.stacktrace;
        if (frames != null && frames[0] != null) {
          if (frames[0].filename == null || frames[0].filename === '<anonymous>') {
            return null;
          }
        }

        // for whatever reason, ignoreErrors does not work for errors caught by other sentry users
        // let's just filter them ourselves too
        const exceptionString = `${exceptionValue.type} ${exceptionValue.value}`;
        for (const ignoreError of ignoreErrors) {
          if (typeof ignoreError === 'string' && exceptionString.toLowerCase().includes(ignoreError.toLowerCase())) {
            return null;
          }
        }
      }
      return event;
    },
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
