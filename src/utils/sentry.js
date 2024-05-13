import {BrowserClient, getDefaultIntegrations, defaultStackParser, makeFetchTransport, Scope} from '@sentry/browser';
import {GIT_REV, NODE_ENV, SENTRY_URL} from '../constants.js';
import {registerBetterTTVGlobalHandlers} from './sentry-global-handlers-integration.js';

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
  'mergeOptions is not a function',
];

const client = new BrowserClient({
  release: GIT_REV,
  environment: NODE_ENV,
  dsn: SENTRY_URL,
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  ignoreErrors,
  allowUrls: [/betterttv\.js/, /\.betterttv\.net/, /\/betterttv\//i],
  denyUrls: [
    /static\.twitchcdn\.net\/assets/,
    /avalon\.js/,
    /avalon\.[a-zA-Z0-9]+\.js/,
    /script\.js/,
    /www.youtube.com\/s\/desktop\//,
  ],
  integrations: getDefaultIntegrations({}).filter(
    (defaultIntegration) =>
      !['BrowserApiErrors', 'TryCatch', 'Breadcrumbs', 'GlobalHandlers'].includes(defaultIntegration.name)
  ),
  beforeSend: (event) => {
    // only collect errors on production releases
    if (NODE_ENV !== 'production') {
      return null;
    }

    const exceptionValue = event.exception?.values?.[0];
    const stacktrace = exceptionValue?.stacktrace;

    // exceptions without a stacktrace are non-actionable
    if (stacktrace == null) {
      return null;
    }

    // find the first in-app stack frame to filter source of the error
    const frame = stacktrace.frames?.reverse().find(({in_app: inApp}) => !!inApp);

    // filter event if there are no app frames
    if (frame == null) {
      return null;
    }

    const {filename, abs_path: absPath} = frame;
    // exceptions with an anonymous stacktrace are non-actionable
    if (filename == null || filename === '<anonymous>') {
      return null;
    }
    // exceptions originating from twitch websites are non-actionable
    if (absPath != null && /^https:\/\/(?:clips\.|dashboard\.|www\.)?twitch\.tv/.test(absPath)) {
      return null;
    }

    // for whatever reason, ignoreErrors does not work for errors caught by other sentry users
    // let's just filter them ourselves too
    if (exceptionValue != null) {
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

const scope = new Scope();
scope.setClient(client);
registerBetterTTVGlobalHandlers(scope);
export default scope;
