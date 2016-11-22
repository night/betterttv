var debug = require('../helpers/debug'),
    removeElement = require('../helpers/element').remove;

module.exports = function() {
    if (!$('.ember-chat .chat-settings').length || $('.ember-chat .chat-settings .bttvChatSettings').length) return;

    debug.log('Loading BetterTTV Chat Settings');

    $('.ember-chat .chat-settings .clear-chat').remove();

    var settings = require('../../templates/chat-settings')();

    var $settings = $('<div></div>');

    $settings.attr('class', 'bttvChatSettings');
    $settings.html(settings);

    $('.ember-chat .chat-interface .chat-settings').append($settings);

    if ($('body[data-page="ember#chat"]').length) {
        $('.openSettings').click(function(e) {
            e.preventDefault();
            bttv.settings.popup();
        });
    } else {
        $('.openSettings').click(function(e) {
            e.preventDefault();
            $('.chat-option-buttons .settings').click();
            $('#bttvSettingsPanel').show('slow');
        });
    }

    $('.clearChat').click(function(e) {
        e.preventDefault();
        removeElement('.chat-line');
    });

    $('.toggleDarkenTTV').change(function(e) {
        e.preventDefault();
        if (bttv.settings.get('darkenedMode') === true) {
            bttv.settings.save('darkenedMode', false);
            $(this).prop('checked', false);
        } else {
            bttv.settings.save('darkenedMode', true);
            $(this).prop('checked', true);
        }
    });

    $('.flipDashboard').click(function(e) {
        e.preventDefault();
        if (bttv.settings.get('flipDashboard') === true) {
            bttv.settings.save('flipDashboard', false);
        } else {
            bttv.settings.save('flipDashboard', true);
        }
    });

    $('.setBlacklistKeywords').click(function(e) {
        e.preventDefault();
        var keywords = prompt('Type some blacklist keywords. Messages containing keywords will be filtered from your chat. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase, and () around a word to specify a username. Wildcards are supported.', bttv.settings.get('blacklistKeywords'));
        if (keywords !== null) {
            keywords = keywords.trim().replace(/\s\s+/g, ' ');
            bttv.settings.save('blacklistKeywords', keywords);
        }
    });

    $('.setHighlightKeywords').click(function(e) {
        e.preventDefault();
        var keywords = prompt('Type some highlight keywords. Messages containing keywords will turn red to get your attention. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase, and () around a word to specify a username. Wildcards are supported.', bttv.settings.get('highlightKeywords'));
        if (keywords !== null) {
            keywords = keywords.trim().replace(/\s\s+/g, ' ');
            bttv.settings.save('highlightKeywords', keywords);
        }
    });

    $('.setScrollbackAmount').click(function(e) {
        e.preventDefault();
        var lines = prompt('What is the maximum amount of lines that you want your chat to show? Twitch default is 150. Leave the field blank to disable.', bttv.settings.get('scrollbackAmount'));
        if (lines !== null && lines === '') {
            bttv.settings.save('scrollbackAmount', 150);
        } else if (lines !== null && isNaN(lines) !== true && lines > 0) {
            bttv.settings.save('scrollbackAmount', parseInt(lines, 10));
        }
    });

    $('.setFontFamily').click(function(e) {
        e.preventDefault();
        var font = prompt('Enter font name for chat. Try "monospace" or "Comic Sans MS" or leave the field blank to use default.', bttv.settings.get('chatFontFamily'));
        var unsafeFontRegex = /[^A-Za-z0-9\s\.,&\+\-_!]/;
        if (font !== null && unsafeFontRegex.test(font)) {
            bttv.chat.helpers.serverMessage('Chat font could not be changed: It contained illegal characters.', true);
        } else if (font !== null) {
            bttv.settings.save('chatFontFamily', font);
        }
    });

    $('.setFontSize').click(function(e) {
        e.preventDefault();
        var size = prompt('Enter font size for chat (in pixels, but don\'t write that). Twitch default is 12, BetterTTV default is 13.33333. Leave the field blank to use default.', bttv.settings.get('chatFontSize'));
        if (size !== null && size === '') {
            bttv.settings.save('chatFontSize', -1);
        } else if (size !== null && !isNaN(size)) {
            bttv.settings.save('chatFontSize', parseInt(size, 10));
        }
    });

    // Make chat settings scrollable
    $('.ember-chat .chat-settings').css('max-height', $(window).height() - 100);
};
