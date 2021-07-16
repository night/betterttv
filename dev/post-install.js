import {open, stat} from 'fs/promises';

const PATH = './node_modules/rsuite/lib/styles/normalize.less';

(async () => {
  await stat(PATH);
  const file = await open(PATH, 'w');
  file.writeFile('');
})();
