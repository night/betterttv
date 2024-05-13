/* eslint-disable import/prefer-default-export */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-multi-assign */
/* eslint-disable prefer-destructuring */
import {eventFromUnknownInput} from '@sentry/browser/esm/eventbuilder.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import {UNKNOWN_FUNCTION, isString, getLocationHref} from '@sentry/utils';

function _enhanceEventWithInitialFrame(event, url, line, column) {
  // event.exception
  const e = (event.exception = event.exception || {});
  // event.exception.values
  const ev = (e.values = e.values || []);
  // event.exception.values[0]
  const ev0 = (ev[0] = ev[0] || {});
  // event.exception.values[0].stacktrace
  const ev0s = (ev0.stacktrace = ev0.stacktrace || {});
  // event.exception.values[0].stacktrace.frames
  const ev0sf = (ev0s.frames = ev0s.frames || []);

  const colno = isNaN(parseInt(column, 10)) ? undefined : column;
  const lineno = isNaN(parseInt(line, 10)) ? undefined : line;
  const filename = isString(url) && url.length > 0 ? url : getLocationHref();

  // event.exception.values[0].stacktrace.frames
  if (ev0sf.length === 0) {
    ev0sf.push({
      colno,
      filename,
      function: UNKNOWN_FUNCTION,
      in_app: true,
      lineno,
    });
  }

  return event;
}

function getOptions(hub) {
  const client = hub?.getClient();
  const options = (client && client.getOptions()) || {
    stackParser: () => [],
    attachStacktrace: false,
  };
  return options;
}

export function BetterTTVGlobalHandlers(hubRef) {
  return {
    name: 'BetterTTVGlobalHandlers',
    setupOnce() {
      Error.stackTraceLimit = 50;

      const _oldOnErrorHandler = window.onerror;

      window.onerror = function BetterTTVGlobalOnError(msg, url, line, column, error) {
        const {stackParser, attachStacktrace} = getOptions(hubRef.hub);

        const event = _enhanceEventWithInitialFrame(
          eventFromUnknownInput(stackParser, error || msg, undefined, attachStacktrace, false),
          url,
          line,
          column
        );

        event.level = 'error';

        hubRef.hub?.captureEvent(event, {
          originalException: error,
          mechanism: {
            handled: false,
            type: 'onerror',
          },
        });

        if (_oldOnErrorHandler) {
          // eslint-disable-next-line prefer-rest-params
          return _oldOnErrorHandler.apply(this, arguments);
        }

        return false;
      };
    },
  };
}
