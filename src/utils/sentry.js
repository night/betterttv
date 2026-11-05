import {BrowserClient, getDefaultIntegrations, defaultStackParser, makeFetchTransport, Scope} from '@sentry/browser';
import {GIT_REV, NODE_ENV, SENTRY_URL} from '@/constants';

// stack overflows caused by other extensions' prototype hooks (e.g. a recursive
// Object.getOwnPropertyDescriptor wrapper) surface in our try/catch blocks but contain none of our frames
function isForeignStackOverflow(event) {
  return (event.exception?.values ?? []).some(
    ({type, value, stacktrace}) =>
      type === 'RangeError' &&
      value?.includes('Maximum call stack size exceeded') &&
      !(stacktrace?.frames ?? []).some(({filename}) => filename?.includes('betterttv.js'))
  );
}

const client = new BrowserClient({
  release: GIT_REV,
  environment: NODE_ENV,
  dsn: SENTRY_URL,
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  // keep the restrictive pre-v11 defaults (Sentry 11 collects user info, cookies and headers by default)
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: {
      request: {deny: ['forwarded', '-ip', 'remote-', 'via', '-user']},
      response: {deny: ['forwarded', '-ip', 'remote-', 'via', '-user']},
    },
    httpBodies: [],
  },
  integrations: getDefaultIntegrations({}).filter(
    (defaultIntegration) =>
      !['BrowserApiErrors', 'TryCatch', 'Breadcrumbs', 'Console', 'GlobalHandlers'].includes(defaultIntegration.name)
  ),
  beforeSend: (event) => {
    // only collect errors on production releases
    if (NODE_ENV !== 'production') {
      return null;
    }

    if (isForeignStackOverflow(event)) {
      return null;
    }

    return event;
  },
});

const scope = new Scope();
scope.setClient(client);
export default scope;
