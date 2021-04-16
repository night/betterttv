const glob = require('glob');
const path = require('path');

function replacer(match, quote, filename) {
    if (!glob.hasMagic(filename)) return match;
    const resourceDir = path.dirname(this.resourcePath);
    return glob
        .sync(filename, {
            cwd: resourceDir
        })
        .map((file) => {
            const filename = quote + file + quote;
            return `
                try {
                    await import(${filename});
                } catch (e) {
                    debug.error('Failed to import ${file}', e.stack);
                }
            `
        })
        .join('; ');
}

module.exports = function (source) {
    this.cacheable();
    const regex = /.?import\((['"])(.*?)\1\);?/gm;
    return source.replace(regex, replacer.bind(this));
};
