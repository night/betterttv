const $ = require('jquery');
const debug = require('../../utils/debug');

class GlobalCSSModule {
    constructor() {
        const globalCSSInject = document.createElement('link');
        globalCSSInject.setAttribute('href', `https://cdn.betterttv.net/css/betterttv.css?${debug.version}`);
        globalCSSInject.setAttribute('type', 'text/css');
        globalCSSInject.setAttribute('rel', 'stylesheet');
        $('body').append(globalCSSInject);
    }
}

module.exports = new GlobalCSSModule();
