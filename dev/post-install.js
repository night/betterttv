import {statSync, writeFileSync} from 'fs';

const PATH = './node_modules/rsuite/styles/normalize.less';

statSync(PATH);
writeFileSync(PATH, '');
