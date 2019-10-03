const debug = require('./debug');

module.exports = {
    url(path, breakCache = false) {
        const url = new URL(path, document.currentScript.src);
        return `${url.toString()}${breakCache ? `?v=${debug.version}` : ''}`;
    }
};
