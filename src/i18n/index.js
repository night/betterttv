import {createIntl, createIntlCache} from '@formatjs/intl';

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = [DEFAULT_LOCALE];

let browserLocale = Array.isArray(navigator.languages) ? navigator.languages[0] : null;
browserLocale = browserLocale || navigator.language || navigator.browserLanguage || navigator.userLanguage;
// eslint-disable-next-line prefer-destructuring
browserLocale = browserLocale.split('-')[0].split('_')[0];
if (!SUPPORTED_LOCALES.includes(browserLocale)) {
  browserLocale = DEFAULT_LOCALE;
}

let intl;
const cache = createIntlCache();

export async function load() {
  const messages = browserLocale !== DEFAULT_LOCALE ? (await import(`./messages/${browserLocale}.json`)).default : {};

  intl = createIntl(
    {
      locale: browserLocale,
      defaultLocale: DEFAULT_LOCALE,
      messages,
    },
    cache
  );
}

// eslint-disable-next-line import/prefer-default-export
export default function formatMessage(descriptor, values = undefined) {
  if (intl == null) {
    throw new Error('i18n not yet loaded');
  }

  return intl.formatMessage(descriptor, values);
}
