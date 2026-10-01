import {BrowserClient, getDefaultIntegrations, defaultStackParser, makeFetchTransport, Scope} from '@sentry/browser';
import {GIT_REV, NODE_ENV, SENTRY_URL} from '@/constants';

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

    return event;
  },
});

const scope = new Scope();
scope.setClient(client);
export default scope;
