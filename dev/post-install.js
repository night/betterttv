import {statSync, writeFileSync, readFileSync} from 'fs';
// eslint-disable-next-line import/no-unresolved
import {globSync} from 'glob';
import {escapeRegExp} from '../src/utils/regex.js';

// RSuite sets global styles which can affect native page styles, so remove them
const NORMALIZE_PATH = './node_modules/rsuite/styles/normalize.less';
statSync(NORMALIZE_PATH);
writeFileSync(NORMALIZE_PATH, '');

// RSuite uses the prefix `rs` for all of its classes, but we want to namespace to `bttv` class prefix
const OLD_CLASSNAME_PREFIX = 'rs';
const NEW_CLASSNAME_PREFIX = 'bttv-rs';
const files = globSync('node_modules/*rsuite*/**/*.+(js|ts|tsx|less|css)', {}).filter(
  (pathname) => !pathname.endsWith('.d.ts')
);
for (const pathname of files) {
  const data = readFileSync(pathname).toString();

  let classnameRegex;

  if (pathname.endsWith('.less') || pathname.endsWith('.css')) {
    classnameRegex = new RegExp(`(\\.|--)(${escapeRegExp(OLD_CLASSNAME_PREFIX)})(,|-|{|\\s)`, 'gm');
  } else if (pathname.endsWith('.js') || pathname.endsWith('.ts') || pathname.endsWith('.tsx')) {
    classnameRegex = new RegExp(`((?:'|\`|")\\.|'|\`|")(${escapeRegExp(OLD_CLASSNAME_PREFIX)})(-|\\s|'|\`|")`, 'gm');
  }

  if (classnameRegex == null) {
    continue;
  }

  const newData = data.replace(classnameRegex, (match, p1, _p2, p3) => {
    if (["'", '"', '`'].includes(p1) && p1 !== p3 && p3 !== '-' && /\s/.test(p3)) {
      return match;
    }

    return `${p1}${NEW_CLASSNAME_PREFIX}${p3}`;
  });

  writeFileSync(pathname, newData);
}
