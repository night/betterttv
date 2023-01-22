import cookies from 'cookies-js';
import {createIntl, createIntlCache} from '@formatjs/intl';
import {Settings} from 'luxon';

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = [
  DEFAULT_LOCALE,
  'de-DE',
  'es-ES',
  'fr-FR',
  'hu-HU',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'nl-NL',
  'no-NO',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'ru-RU',
  'tr-TR',
  'uk-UA',
];

let browserLocale = Array.isArray(navigator.languages) ? navigator.languages[0] : null;
browserLocale = browserLocale || navigator.language || navigator.browserLanguage || navigator.userLanguage;
browserLocale = browserLocale.replace('_', '-');
if (!SUPPORTED_LOCALES.includes(browserLocale)) {
  // eslint-disable-next-line prefer-destructuring
  browserLocale = browserLocale.split('-')[0];
}
if (!SUPPORTED_LOCALES.includes(browserLocale)) {
  browserLocale =
    SUPPORTED_LOCALES.find((supportedLocale) => supportedLocale.startsWith(browserLocale)) ?? DEFAULT_LOCALE;
}

let intl;
const cache = createIntlCache();

function getSiteLocale() {
  let locale = cookies.get('language') ?? cookies.get('PREF')?.split('hl=')[1]?.split('&')[0];
  if (locale == null) {
    return locale;
  }
  locale = locale.replace('_', '-');
  if (!SUPPORTED_LOCALES.includes(locale)) {
    // eslint-disable-next-line prefer-destructuring
    locale = locale.split('-')[0];
  }
  if (!SUPPORTED_LOCALES.includes(locale)) {
    locale = SUPPORTED_LOCALES.find((supportedLocale) => supportedLocale.startsWith(locale)) ?? null;
  }
  return locale;
}

export async function load() {
  const locale = getSiteLocale() ?? browserLocale;
  const messages = locale !== DEFAULT_LOCALE ? (await import(`./messages/${locale}.json`)).default : {};

  intl = createIntl(
    {
      locale,
      defaultLocale: DEFAULT_LOCALE,
      messages,
    },
    cache
  );

  Settings.defaultLocale = locale;
}

// eslint-disable-next-line import/prefer-default-export
export default function formatMessage(descriptor, values = undefined) {
  if (intl == null) {
    throw new Error('i18n not yet loaded');
  }

  return intl.formatMessage(descriptor, values);
}
