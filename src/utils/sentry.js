import {BrowserClient, getDefaultIntegrations, defaultStackParser, makeFetchTransport, Scope} from '@sentry/browser';
import {GIT_REV, NODE_ENV, SENTRY_URL} from '../constants.js';

const client = new BrowserClient({
  release: GIT_REV,
  environment: NODE_ENV,
  dsn: SENTRY_URL,
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: getDefaultIntegrations({}).filter(
    (defaultIntegration) =>
      !['BrowserApiErrors', 'TryCatch', 'Breadcrumbs', 'GlobalHandlers'].includes(defaultIntegration.name)
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
