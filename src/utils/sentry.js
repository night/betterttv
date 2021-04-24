import * as Sentry from '@sentry/browser';
import {Dedupe} from '@sentry/integrations';

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
  'Network error',
  'getAnimatedEmoteMode is not a function',
  'can\'t redefine non-configurable property "userAgent"',
  '$ is not defined',
  'BetterJsPop',
  'Name Collision for Module',
  /^NS_/,
  'GraphQL error',
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
    new Dedupe(),
  ],
  beforeSend: (event) => {
    // only collect errors on production releases
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }

    const {exception} = event;
    const exceptionValue = exception != null && exception.values != null && event.exception.values[0];
    if (exceptionValue != null) {
      // exceptions without a stacktrace are non-actionable
      if (exceptionValue.stacktrace == null) {
        return null;
      }

      const {frames} = exceptionValue.stacktrace;
      if (frames != null && frames[0] != null) {
        const {filename, abs_path: absPath} = frames[0];
        // exceptions with an anonymous stacktrace are non-actionable
        if (filename == null || filename === '<anonymous>') {
          return null;
        }
        // exceptions originating from twitch websites are non-actionable
        if (absPath != null && /^https:\/\/(?:clips\.|dashboard\.|www\.)?twitch\.tv/.test(absPath)) {
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
        if (ignoreError instanceof RegExp && ignoreError.test(exceptionString)) {
          return null;
        }
      }
    }
    return event;
  },
});
