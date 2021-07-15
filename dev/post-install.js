import {writeFileSync} from 'fs';

writeFileSync('./node_modules/rsuite/lib/styles/normalize.less', '', (err) => {
  if (err) {
    throw new Error('Post-install failed, could not locate normalize.less');
  }
});
