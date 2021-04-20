const path = require('path');
const {glob} = require('glob');

function replacer(match, quote, filename) {
    if (!glob.hasMagic(filename)) return match;
    const resourceDir = path.dirname(this.resourcePath);
    return glob
        .sync(filename, {
            cwd: resourceDir,
        })
        .map(file => {
            return `
                try {
                    await import(${quote + file + quote});
                } catch (e) {
                    debug.error('Failed to import ${file}', e.stack);
                }
            `;
        })
        .join('; ');
}

module.exports = function(source) {
    this.cacheable();
    const regex = /.?import\((['"])(.*?)\1\);?/gm;
    return source.replace(regex, replacer.bind(this));
};
