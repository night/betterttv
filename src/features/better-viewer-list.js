var buttonTemplate = require('../templates/bvl-button'),
    panelTemplate = require('../templates/bvl-panel'),
    debug = require('../helpers/debug'),
    handlers = require('../chat/handlers'),
    helpers = require('../chat/helpers'),
    ViewList = require('view-list'),
    Resizable = require('resizable');

var viewList, chatterList;


function renderViewerList() {
    var results = chatterList;
    var search = $('#bvl-panel .filter').val();
    search = search.toLowerCase().trim();
    if (search.length > 0) {
        var tmpResults = [];
        results = chatterList.filter(function(v) {
            return v.text.indexOf(search) >= 0 || v.filter;
        });

        // Filter empty subsections
        for (var i = 0; i < results.length - 1; i++) {
            if (results[i].filter && results[i + 1].text === ' ') i++;
            else tmpResults.push(results[i]);
        }
        results = tmpResults;
    }
    viewList.render(results);
}

function extractViewers(data) {
    var results = [];
    var chatters = data.data.chatters;
    var userTypes = ['staff', 'admins', 'global_mods', 'moderators', 'viewers'];
    var typeDisplays = ['STAFF', 'ADMINS', 'GLOBAL MODERATORS', 'MODERATORS', 'VIEWERS'];
    for (var i = 0; i < userTypes.length; i++) {
        if (chatters[userTypes[i]].length === 0) continue;

        // User type header
        results.push({
            filter: true,
            tag: 'li.user-type',
            text: typeDisplays[i]
        });

        // users
        var users = chatters[userTypes[i]];
        for (var j = 0; j < users.length; j++) {
            results.push({
                tag: 'li',
                text: users[j],
                display: helpers.lookupDisplayName(users[j])
            });
        }

        // Blank space
        results.push({
            filter: true,
            tag: 'li.user-type',
            text: ' '
        });
    }

    return results;
}

function loadViewerList() {
    var tmi = bttv.chat.tmi();
    if (!tmi) return;

    if (viewList !== undefined && Date.now() - viewList.lastUpdate < 30 * 1000) {
        return;
    }

    var $oldList = $('#bvl-panel .viewer-list');
    $oldList.hide();

    var $refreshButton = $('#bvl-panel .refresh-button');
    $refreshButton.addClass('disable');

    var target = document.getElementById('bvl-panel');
    var spinner = new Spinner({
        color: '#fff',
        lines: 12,
        length: 6,
        width: 3,
        radius: 12,
    }).spin(target);

    var deferred = tmi.tmiRoom.list();
    deferred.then(function(data) {
        spinner.stop();
        $oldList.remove();
        setTimeout(function() {
            $refreshButton.removeClass('disable');
        }, 30 * 1000);

        $('#bvl-panel .status').hide();
        $('#bvl-panel .filter').show();
        var $parent = $('#bvl-panel');
        viewList = new ViewList({
            className: 'viewer-list',
            topClassName: 'bvl-top',
            bottomClassName: 'bvl-bottom',
            appendTo: $parent[0],
            rowHeight: 20,
            height: $parent.height() - 85,
            eachrow: function(row) {
                return this.html(row.tag, {
                    onclick: function(e) {
                        handlers.moderationCard(row.text, $(e.target));
                    }
                }, row.display || row.text);
            }
        });

        var oldRender = viewList.render;
        viewList.render = function(list) {
            if (list) oldRender.call(viewList, list);
        };

        viewList.render([]);
        chatterList = extractViewers(data);
        var $el = $('#bvl-panel .viewer-list');
        $el.height($parent.height() - 85);
        renderViewerList();
        viewList.lastUpdate = Date.now();
    }, function() {
        var errorText;
        spinner.stop();
        $refreshButton.removeClass('disable');
        $('#bvl-panel .status').show();
        if (viewList !== undefined) {
            $oldList.show();
            $('#bvl-panel .filter').show();
            var time = Math.ceil((Date.now() - viewList.lastUpdate) / 60000);
            errorText = 'Failed to load, showing ' + time + 'm old list.';
        } else {
            $('#bvl-panel .filter').hide();
            errorText = 'Failed to load viewer list, try again.';
        }
        $('#bvl-panel .status').text(errorText);
    });

    // Timeout after 15 seconds
    setTimeout(function() {
        if (deferred.readyState !== 4) deferred.abort();
    }, 15 * 1000);
}

function createPanel() {
    // Create panel
    $panel = $(panelTemplate())
        .draggable({
            handle: '.drag_handle',
            containment: 'body',
            stop: function(ev, ui) {
                if (ui.offset.top < 0) {
                    ui.position.top -= ui.offset.top;
                    ui.helper.css('top', ui.position.top);
                }
                if (ui.offset.left < 0) {
                    ui.position.left -= ui.offset.left;
                    ui.helper.css('left', ui.position.left);
                }
            }
        });

    $panel.find('.close-button').click(function() {
        $panel.hide();
    });

    $panel.find('.refresh-button').click(function() {
        if (this.classList.contains('disable')) return;
        loadViewerList();
    });

    var container = $('.chat-room');
    $panel.css({
        width: container.width() - 20,
        height: Math.max(500, container.height() - 400)
    });

    container.append($panel);

    // Setup resizing
    var resizable = new Resizable($panel[0], {
        handles: 's, se, e',
        threshold: 10,
        draggable: false
    });

    resizable.on('resize', function() {
        if (viewList === undefined) return;
        $('#bvl-panel .viewer-list').height($('#bvl-panel').height() - 85);
        renderViewerList();
    });

    // Setup filter handler
    $('#bvl-panel .filter').keyup(renderViewerList);

    // Load viewers
    loadViewerList();
}

module.exports = function() {
    if (bttv.settings.get('betterViewerList') === false) return;
    if ($('.chat-room').length === 0 && (!window.Ember || !window.App ||
        App.__container__.lookup('controller:application').get('currentRouteName') !== 'channel.index.index')) return;

    if ($('#bvl-button').length > 0) {
        $('#bvl-button').show();
        return;
    }

    var interval = setInterval(function() {
        if ($('#bvl-button').length > 0) {
            clearInterval(interval);
            return;
        }

        if ($('#bvl-button').length > 0) return;
        var $oldViewerList = $('a.button[title="Viewer List"]');
        if ($oldViewerList.length === 0) return;
        $oldViewerList.hide();

        debug.log('Adding BetterViewerList button');
        $('.chat-buttons-container > :nth-child(1)').after(buttonTemplate());
        $('a.button[title="Viewer List"]').hide();
        $('#bvl-button').click(function() {
            var $panel = $('#bvl-panel');
            if ($panel.length > 0) {
                $panel.toggle();

                if ($panel.is(':visible')) {
                    loadViewerList();
                }
            } else {
                createPanel();
            }
        });

        clearInterval(interval);
    }, 100);
};
