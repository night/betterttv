// NightDev Translate's command-line client, kept here so CI can run it. Keep it in step with the platform's API.
//
// nightdev-translate: sync a repo's strings with the translation platform.
//
// Reads .nightdev-translate.json from the current directory (or --config):
//   {
//     "url": "https://translate.nightdev.com",
//     "project": "betterttv",
//     "component": "extension",                     // when the project has several (each repo names its own)
//     "source": "build/messages/en.json",          // what `formatjs extract` writes
//     "translations": "src/i18n/messages/{locale}.json",
//     "minPercent": 0,                              // pull: skip languages below this
//     "locales": {"pt-BR": "pt_BR"},                // optional: platform locale -> file locale
//     "format": "chrome"                            // optional: a Chrome extension's _locales messages.json files
//   }
// and the project API token from NIGHTDEV_I18N_TOKEN.
//
//   nightdev-translate push [--dry-run]          upload source strings
//   nightdev-translate pull                      write approved translations to the translation files
//   nightdev-translate upload [--approve]        upload existing translation files (e.g. moving off Crowdin)
//   nightdev-translate status                    show progress per language

import fs from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';

const {values: options, positionals} = parseArgs({
  allowPositionals: true,
  options: {
    config: {type: 'string', default: '.nightdev-translate.json'},
    'dry-run': {type: 'boolean', default: false},
    approve: {type: 'boolean', default: false},
    locale: {type: 'string', multiple: true},
    'skip-outdated': {type: 'boolean', default: false},
    help: {type: 'boolean', short: 'h', default: false},
  },
});

const USAGE = `usage: nightdev-translate <push|pull|upload|status> [--config file] [--dry-run] [--approve] [--locale xx]...`;

interface Config {
  url: string;
  project: string;
  // the project's component this repo's strings are; needed once there are several
  component?: string;
  source: string;
  translations: string;
  minPercent?: number;
  locales?: Record<string, string>;
  // the files: formatjs's (the default; pull writes flat {id: message}), or a Chrome extension's {id: {message}}
  format?: 'flat' | 'chrome';
}

// what the API returns
interface PushResult {
  dryRun: boolean;
  added: number;
  updated: number;
  removed: number;
  unchanged: number;
  // translations taken down by a change of format, to be translated again
  invalidated: number;
  changes: {added: string[]; updated: string[]; removed: string[]};
}
type ChromePlaceholders = Record<string, {content: string; example?: string}>;
interface UploadResult {
  imported: number;
  approved: number;
  skipped: string[];
  invalid: string[];
}
interface Progress {
  total: number;
  locales: {locale: string; percent: number; approved: number; outdated: number}[];
}

function fail(message: string): never {
  console.error(`nightdev-translate: ${message}`);
  process.exit(1);
}

const command = positionals[0];
if (options.help || command == null) {
  console.log(USAGE);
  process.exit(command == null && !options.help ? 1 : 0);
}

let config: Config;
try {
  config = JSON.parse(fs.readFileSync(options.config, 'utf8'));
} catch (err) {
  fail(`couldn't read ${options.config}: ${err instanceof Error ? err.message : String(err)}`);
}
for (const field of ['url', 'project', 'source', 'translations'] as const) {
  if (typeof config[field] !== 'string') fail(`${options.config} needs "${field}"`);
}
if (!config.translations.includes('{locale}')) fail('"translations" must contain {locale}');

const token = process.env.NIGHTDEV_I18N_TOKEN;
if (!token) fail('set NIGHTDEV_I18N_TOKEN to the project API token');

const baseDir = path.dirname(path.resolve(options.config));
const fileLocale = (locale: string) => config.locales?.[locale] ?? locale;
const translationPath = (locale: string) =>
  path.resolve(baseDir, config.translations.replace('{locale}', fileLocale(locale)));

async function api<T>(
  method: string,
  pathname: string,
  {body, query}: {body?: string; query?: Record<string, string | number | boolean>} = {}
): Promise<T> {
  const url = new URL(`/api/projects/${encodeURIComponent(config.project)}${pathname}`, config.url);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, String(value));
  // push, upload, pull and status are all of this repo's component
  if (config.component) url.searchParams.set('component', config.component);
  // a Chrome extension's messages.json is only read as one when it says so; said every
  // time, so taking "format" out of the config takes a component back to ICU
  url.searchParams.set('format', config.format === 'chrome' ? 'chrome' : 'icu');
  const response = await fetch(url, {
    method,
    headers: {authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/json'},
    body: body == null ? undefined : body,
    signal: AbortSignal.timeout(120000),
  });
  const text = await response.text();
  if (!response.ok) fail(`${method} ${url.pathname} failed (${response.status}): ${errorMessage(text)}`);
  try {
    // the API's own JSON, as the caller's type describes it
    const data: T = JSON.parse(text);
    return data;
  } catch {
    return fail(`${method} ${url.pathname} returned something that isn't JSON`);
  }
}

// the API's {message}, or the body as it is
function errorMessage(text: string): string {
  try {
    const body: {message?: string} | null = JSON.parse(text);
    return body?.message ?? text;
  } catch {
    return text;
  }
}

function summarize(list: string[], label: string) {
  if (list.length === 0) return;
  console.log(`  ${label}:`);
  for (const key of list.slice(0, 20)) console.log(`    ${key}`);
  if (list.length > 20) console.log(`    ...and ${list.length - 20} more`);
}

async function push() {
  const file = path.resolve(baseDir, config.source);
  if (!fs.existsSync(file)) fail(`source file ${config.source} not found (run your extract step first)`);
  const result = await api<PushResult>('PUT', '/sources', {
    body: fs.readFileSync(file, 'utf8'),
    query: {dryRun: options['dry-run']},
  });
  console.log(
    `${result.dryRun ? 'would push' : 'pushed'}: ${result.added} added, ${result.updated} updated, ${result.removed} removed, ${result.unchanged} unchanged`
  );
  summarize(result.changes.added, 'added');
  summarize(result.changes.updated, 'updated');
  summarize(result.changes.removed, 'removed');
  if (result.invalidated > 0)
    console.log(
      `${result.invalidated} translations ${result.dryRun ? 'would be' : 'were'} taken down: not valid in the new format, so they're translated again`
    );
}

// a Chrome message's named placeholders ($USER$) have to be defined in every language's file, the same as in
// the source's: Chrome won't load a file that uses one it doesn't define
function readChromePlaceholders(): Map<string, ChromePlaceholders> {
  const file = path.resolve(baseDir, config.source);
  if (config.format !== 'chrome' || !fs.existsSync(file)) return new Map();
  const source: Record<string, {placeholders?: ChromePlaceholders}> = JSON.parse(fs.readFileSync(file, 'utf8'));
  return new Map(
    Object.entries(source).flatMap(([key, entry]) => (entry.placeholders ? [[key, entry.placeholders] as const] : []))
  );
}

async function pull() {
  const chromePlaceholders = readChromePlaceholders();
  const result = await api<{locales: Record<string, Record<string, string>>}>('GET', '/export', {
    query: {minPercent: config.minPercent ?? 0, skipOutdated: options['skip-outdated']},
  });
  const wanted = options.locale ? new Set(options.locale) : null;
  for (const [locale, messages] of Object.entries(result.locales)) {
    if (wanted && !wanted.has(locale)) continue;
    const file = translationPath(locale);
    const sorted = Object.entries(messages).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const shaped =
      config.format === 'chrome'
        ? Object.fromEntries(
            sorted.map(([key, message]) => {
              const placeholders = chromePlaceholders.get(key);
              return [key, placeholders ? {message, placeholders} : {message}];
            })
          )
        : Object.fromEntries(sorted);
    const contents = `${JSON.stringify(shaped, null, 2)}\n`;
    const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (previous === contents) {
      console.log(`${locale}: up to date (${sorted.length} strings)`);
      continue;
    }
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, contents);
    console.log(`${locale}: wrote ${path.relative(process.cwd(), file)} (${sorted.length} strings)`);
  }
}

async function upload() {
  // each of the project's languages, from where pull would write it ({locale} in the file or folder name)
  const wanted = options.locale ? new Set(options.locale) : null;
  const {project} = await api<{project: {sourceLocale: string; locales: string[]}}>('GET', '');
  for (const locale of project.locales) {
    if (wanted && !wanted.has(locale)) continue;
    const file = translationPath(locale);
    if (!fs.existsSync(file)) {
      console.log(`${locale}: no ${path.relative(process.cwd(), file)}, skipped`);
      continue;
    }
    const result = await api<UploadResult>('PUT', `/locales/${encodeURIComponent(locale)}/translations`, {
      body: fs.readFileSync(file, 'utf8'),
      query: {approve: options.approve},
    });
    console.log(
      `${locale}: ${result.imported} imported, ${result.approved} approved, ${result.skipped.length} unknown keys, ${result.invalid.length} with broken placeholders`
    );
  }
}

async function status() {
  const {progress} = await api<{progress: Progress}>('GET', '/progress');
  console.log(`${progress.total} source strings`);
  for (const row of progress.locales) {
    console.log(
      `  ${row.locale.padEnd(8)} ${String(row.percent).padStart(3)}%  ${row.approved} approved, ${row.outdated} outdated`
    );
  }
}

const commands = {push, pull, upload, status};
const isCommand = (name: string): name is keyof typeof commands => Object.hasOwn(commands, name);
if (!isCommand(command)) fail(`unknown command "${command}"\n${USAGE}`);
await commands[command]();
