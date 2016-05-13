function load(file, key) {
    if (!bttv.settings.get(key)) return;

    var css = document.createElement('link');
    css.setAttribute('href', 'https://localhost/style/stylesheets/betterttv-' + file + '.css?' + bttv.info.versionString());
    css.setAttribute('type', 'text/css');
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('id', key);
    $('body').append(css);
}
function unload(key) {
    $('#' + key).remove();
}

module.exports.load = load;
module.exports.unload = unload;
