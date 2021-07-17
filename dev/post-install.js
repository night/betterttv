import {statSync, writeFileSync} from 'fs';

const PATH = './node_modules/rsuite/lib/styles/normalize.less';

statSync(PATH);
writeFileSync(PATH, '');
