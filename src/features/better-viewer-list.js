var buttonTemplate = require('../templates/bvl-button'),
    panelTemplate = require('../templates/bvl-panel'),
    debug = require('../helpers/debug'),
    handlers = require('../chat/handlers'),
    ViewList = require('view-list'),
    Resizable = require('resizable');

var viewList, chatterList;

function renderViewerList() {
    var results = chatterList;
    var search = $('#bvl-panel .filter').val().toLowerCase();
    if (search.trim() !== '') {
        results = chatterList.filter(function(v) {
            return v.text.indexOf(search) >= 0 && !v.filter;
        });
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

        results.push({
            filter: true,
            tag: 'li.user-type',
            text: typeDisplays[i]
        });

        var users = chatters[userTypes[i]];
        for (var j = 0; j < users.length; j++) {
            results.push({
                tag: 'li',
                text: users[j]
            });
        }

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

    var oldList = $('#bvl-panel .viewer-list');
    if (oldList) oldList.remove();

    var opts = {
        color: '#fff',
        lines: 12,
        length: 6,
        width: 3,
        radius: 12,
    };
    var target = document.getElementById('bvl-panel');
    var spinner = new Spinner(opts).spin(target);

    var deferred = tmi.tmiRoom.list();
    deferred.then(function(data) {
        spinner.stop();

        if (!data || data.status !== 200) {
            return;
        }

        $('#bvl-panel .status').hide();
        $('#bvl-panel .filter').show();
        var parent = $('#bvl-panel');
        viewList = new ViewList({
            className: 'viewer-list',
            topClassName: 'bvl-top',
            bottomClassName: 'bvl-bottom',
            appendTo: parent[0],
            rowHeight: 20,
            height: parent.height() - 40,
            eachrow: function(row) {
                return this.html(row.tag, {
                    onclick: function(e) {
                        handlers.moderationCard(row.text, $(e.target));
                    }
                }, row.text);
            },
        });

        viewList.render([]);
        chatterList = extractViewers(data);
        var el = $('#bvl-panel .viewer-list');
        el.height(parent.height() - 40);
        renderViewerList();

        // /*eslint-disable */
        // // ヽ༼ಢ_ಢ༽ﾉ
        // el.TrackpadScrollEmulator({
        //     scrollbarHideStrategy: 'rightAndBottom'
        // });
        // /*eslint-enable */
    }, function() {
        spinner.stop();
        $('#bvl-panel .status').show()
            .text('Failed to load viewer list, try again.');
        $('#bvl-panel .filter').hide();
    });
}

function createPanel() {
    // Create panel
    panel = $(panelTemplate())
        .draggable({handle: '.drag_handle'});

    panel.find('.close-button').click(function() {
        panel.remove();
    });

    panel.find('.refresh-button').click(function() {
        loadViewerList();
    });

    var container = $('.chat-room');
    panel.css({
        width: container.width() - 20,
        height: Math.max(500, container.height() - 400)
    });

    container.append(panel);

    // Setup resizing
    var resizable = new Resizable(panel[0], {
        handles: 's, se, e',
        threshold: 10,
        draggable: false
    });

    resizable.on('resize', function() {
        if (viewList === undefined) return;
        var parent = $('#bvl-panel');
        var el = $('#bvl-panel .viewer-list');
        el.height(parent.height() - 40);
        renderViewerList();
    });

    // Setup filter handler
    $('#bvl-panel .filter').keyup(renderViewerList);

    // Load viewers
    loadViewerList();
}

module.exports = function() {
    if ($('#bvl-button').length > 0) {
        $('#bvl-button').show();
        return;
    }

    debug.log('Adding BetterViewerList button');
    var settingsButton = $('.chat-buttons-container > :nth-child(1)');
    settingsButton.after(buttonTemplate());

    $('#bvl-button').click(function() {
        var panel = $('#bvl-panel');
        if (panel.length > 0) {
            panel.remove();
        } else {
            createPanel();
        }
    });
};
