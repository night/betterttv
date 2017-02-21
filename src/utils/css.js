const $ = require('jquery');
const cdn = require('./cdn');

const generateID = name => `bttv-css-${name}`;

module.exports = {
    load(name = null) {
        const id = generateID(name);
        if ($(`#${id}`).length) return;

        const css = document.createElement('link');
        css.setAttribute('href', cdn.url(`css/betterttv${name ? `-${name}` : ''}.css`, true));
        css.setAttribute('type', 'text/css');
        css.setAttribute('rel', 'stylesheet');
        css.setAttribute('id', id);
        $('body').append(css);
    },

    unload(name) {
        $(`#${generateID(name)}`).remove();
    }
};
