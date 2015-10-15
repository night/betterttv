function inFrame() {
    try {
        return !!window.frameElement;
    } catch (e) {
        return true;
    }
}

module.exports = function() {
    if (!inFrame() || !window.jQuery) return;

    if (!window.jQuery('body').hasClass('kraken-embed')) return;

    var receiveMessage = function(e) {
        if (!e.data || typeof e.data !== 'string') return;

        if (e.data.split(' ')[0] !== 'bttv_login_dark') return;

        // The Twitch login page is so secure we can't load remote CSS.
        // SOLUTION: hacky inline style tag (this makes me sad)

        var cardBackground = '.kraken-embed .card.embed { background: #1e1e1e; }';
        var cardLabels = '.kraken-embed .card.embed label { color: #A0A0A0; }';
        var cardLinks = '.kraken-embed .card.embed a { color: #d3d3d3; }';
        var cardInputs = '.kraken-embed .card.embed input.text, .kraken-embed .card.embed input.string, .kraken-embed .card.embed textarea, .kraken-embed .dropdown, .kraken-embed .dropdown_static { background: #333; color: #fff; }';
        var cardInputsFocus = '.kraken-embed .card.embed input.text:focus, .kraken-embed .card.embed input.string:focus, .kraken-embed .card.embed textarea:focus, .kraken-embed .active_dropdown { box-shadow: none; }';
        var cardDropDownArrow = '.kraken-embed .dropdown:before, .kraken-embed .dropdown_static:before { content: ""; position: absolute; top: 50%; right: 7px; margin-top: -2px; width: 0; height: 0; border: 5px solid rgba(255, 255, 255, 0.25); border-left-color: transparent; border-right-color: transparent; border-bottom-color: transparent; }';

        var $css = window.jQuery('<style/>');

        $css.append(cardBackground);
        $css.append(cardLabels);
        $css.append(cardLinks);
        $css.append(cardInputs);
        $css.append(cardInputsFocus);
        $css.append(cardDropDownArrow);

        $('head').append($css);
    };

    window.addEventListener('message', receiveMessage, false);

    window.parent.postMessage('bttv_is_login_dark', 'http://www.twitch.tv');
};
