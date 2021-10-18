const VERSION = process.env.EXT_VER;
const {console} = window;

async function log(type, ...args) {
  const {default: storage} = await import('../storage.js');
  if (!console || !storage.get('consoleLog')) return;
  console[type].apply(console, ['BTTV:', ...args]);
}

export default {
  log: log.bind(this, 'log'),
  error: log.bind(this, 'error'),
  warn: log.bind(this, 'warn'),
  info: log.bind(this, 'info'),
  version: VERSION,
};
