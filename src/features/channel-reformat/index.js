/* global chatWidthStartingPoint: true*/

var debug = require('../../helpers/debug'),
    keyCodes = require('../../keycodes'),
    vars = require('../../vars');
var handleResize = require('./handle-resize'),
    twitchcast = require('./twitchcast');

module.exports = function() {
    if ($('#main_col #channel').length === 0 || $('#right_col').length === 0) return;

    debug.log('Reformatting Channel Page');

    twitchcast();

    if (!vars.loadedChannelResize) {
        vars.loadedChannelResize = true;

        var resize = false;

        $(document).keydown(function(event) {
            if (event.keyCode === keyCodes.r && event.altKey) {
                $(window).trigger('resize');
            }
        });

        $(document).mouseup(function(event) {
            if (resize === false) return;
            if (chatWidthStartingPoint) {
                if (chatWidthStartingPoint === event.pageX) {
                    if ($('#right_col').css('display') !== 'none') {
                        $('#right_col').css({
                            display: 'none'
                        });
                        $('#right_close').removeClass('open').addClass('closed');
                        vars.chatWidth = 0;
                    }
                } else {
                    vars.chatWidth = $('#right_col').width();
                }
            } else {
                vars.chatWidth = $('#right_col').width();
            }
            bttv.settings.save('chatWidth', vars.chatWidth);

            resize = false;
            handleResize();
        });

        $(document).on('mousedown', '#right_close, #right_col .resizer', function(event) {
            event.preventDefault();
            resize = event.pageX;
            chatWidthStartingPoint = event.pageX;

            if ($('#right_col').css('display') === 'none') {
                $('#right_col').css({
                    display: 'inherit'
                });
                $('#right_close').removeClass('closed').addClass('open');
                resize = false;
                if ($('#right_col').width() < 340) {
                    $('#right_col').width($('#right_col .top').width());
                }
                vars.chatWidth = $('#right_col').width();
                bttv.settings.save('chatWidth', vars.chatWidth);
                handleResize();
            }
        });

        $(document).mousemove(function(event) {
            if (resize) {
                if (vars.chatWidth + resize - event.pageX < 340) {
                    $('#right_col').width(340);
                    $('#right_col #chat').width(340);
                    $('#right_col .top').width(340);
                } else if (vars.chatWidth + resize - event.pageX > 541) {
                    $('#right_col').width(541);
                    $('#right_col #chat').width(541);
                    $('#right_col .top').width(541);
                } else {
                    $('#right_col').width(vars.chatWidth + resize - event.pageX);
                    $('#right_col #chat').width(vars.chatWidth + resize - event.pageX);
                    $('#right_col .top').width(vars.chatWidth + resize - event.pageX);
                }

                handleResize();
            }
        });

        $(window).off('fluid-resize');
        $(window).off('resize').resize(function() {
            debug.log('Debug: Resize Called');
            setTimeout(handleResize, 1000);
        });
    }

    if (bttv.settings.get.chatWidth && bttv.settings.get.chatWidth < 0) {
        bttv.settings.save('chatWidth', 0);
    }

    var layout = bttv.storage.getObject('TwitchCache:Layout');

    if (layout.resource && layout.resource.isRightColumnClosedByUserAction === true) {
        bttv.settings.save('chatWidth', 0);
        if ($('#right_col').width() === '0') {
            $('#right_col').width('340px');
        }
        layout.resource.isRightColumnClosedByUserAction = false;

        bttv.storage.putObject('TwitchCache:Layout', layout);
    }

    if ($('#right_col .resizer').length === 0) $('#right_col').append('<div class="resizer" onselectstart="return false;" title="Drag to enlarge chat =D"></div>');
    $('#right_col:before').css('margin-left', '-1');

    $('#right_col .bottom #controls #control_buttons .primary_button').css({
        float: 'right',
        marginRight: '-1px'
    });
    $('#right_nav').css({
        'margin-left': 'auto',
        'margin-right': 'auto',
        'width': '321px',
        'float': 'none',
        'border': 'none'
    });
    $('#right_col .top').css('border-bottom', '1px solid rgba(0, 0, 0, 0.25)');

    $('#right_close').unbind('click');
    $('#right_close').removeAttr('data-ember-action');

    $('#left_close').off('click').click(function() {
        $(window).trigger('resize');
    });

    if (bttv.settings.get('chatWidth') !== null) {
        vars.chatWidth = bttv.settings.get('chatWidth');

        if (vars.chatWidth === 0) {
            $('#right_col').css({
                display: 'none'
            });
            $('#right_close').removeClass('open').addClass('closed');
        } else {
            $('#right_col').width(vars.chatWidth);
            $('#right_col #chat').width(vars.chatWidth);
            $('#right_col .top').width(vars.chatWidth);
        }

        $(window).trigger('resize');
    } else {
        if ($('#right_col').width() === '0') {
            $('#right_col').width('340px');
        }

        vars.chatWidth = $('#right_col').width();
        bttv.settings.save('chatWidth', $('#right_col').width());
    }
};
