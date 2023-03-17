const path = require('path');
const {hasMagic, globSync} = require('glob');
const normalizePath = require('normalize-path');

function replacer(match, quote, filename) {
  if (!hasMagic(filename)) return match;
  const resourceDir = path.dirname(this.resourcePath);
  return globSync(filename, {
    cwd: resourceDir,
    dotRelative: true,
  })
    .map(
      (file) => `
        try {
          await import(${quote}${normalizePath(file)}${quote});
        } catch (e) {
          debug.error('Failed to import ${file}', e.stack);
        }
      `
    )
    .join('');
}

module.exports = function importGlob(source) {
  this.cacheable();
  const regex = /.?await import\((['"])(.*?)\1\);?/gm;
  return source.replace(regex, replacer.bind(this));
};
