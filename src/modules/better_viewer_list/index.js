const $ = require('jquery');
const debug = require('../../utils/debug');
const settings = require('../../settings');
const watcher = require('../../watcher');
const bvlTemplates = require('./templates');
const ViewList = require('view-list');
const Resizable = require('resizable');
const moderatorCards = require('../chat_moderator_cards');

let viewList;
let chatterList;
let chatterCount;

class BetterViewerListModule {
    constructor() {
        settings.add({
            id: 'betterViewerList',
            name: 'Better Viewer List',
            defaultValue: true,
            description: 'Adds extra features to the viewer list, such as filtering'
        });
        watcher.on('load.chat', () => this.load());
        settings.on('changed.betterViewerList', () => this.load());
    }

    load() {
        const $oldViewerList = $('.chat-buttons-container a.button:has(.svg-viewerlist)');
        if ($oldViewerList.length === 0) return;

        const $bvlButton = $('#bvl-button');

        if (settings.get('betterViewerList') === false) {
            $oldViewerList.show();
            if ($bvlButton.length) $bvlButton.hide();
            return;
        }

        if ($bvlButton.length) {
            $oldViewerList.hide();
            $bvlButton.show();
            return;
        }

        debug.log('Adding BetterViewerList button');

        $oldViewerList.after(bvlTemplates.button);
        $oldViewerList.hide();

        $('#bvl-button').click(() => {
            const $panel = $('#bvl-panel');
            if ($panel.length > 0) {
                $panel.toggle();

                if ($panel.is(':visible')) {
                    this.loadViewerList();
                }
            } else {
                this.createPanel();
            }
        });
    }

    renderViewerList() {
        let count = 0;
        let results = chatterList;
        let search = $('#bvl-panel .filter').val();
        search = search.toLowerCase().trim();
        if (search.length > 0) {
            const tmpResults = [];
            results = chatterList.filter(v => v.text.indexOf(search) >= 0 || v.filter);

            // Filter empty subsections
            for (let i = 0; i < results.length - 1; i++) {
                if (!results[i].filter) count += 1;
                if (results[i].filter && results[i + 1].text === ' ') i++;
                else tmpResults.push(results[i]);
            }
            results = tmpResults;
        } else {
            count = chatterCount;
        }
        viewList.render(results);

        const label = count + (count < 2 ? ' viewer' : ' viewers');
        $('#bvl-panel .viewer-count').text(label);
    }

    extractViewers(data) {
        const typeDisplays = ['STAFF', 'ADMINS', 'GLOBAL MODERATORS', 'MODERATORS', 'VIEWERS'];
        const userTypes = ['staff', 'admins', 'global_mods', 'moderators', 'viewers'];

        const results = [];
        const chatters = data.data.chatters;
        for (let i = 0; i < userTypes.length; i++) {
            if (chatters[userTypes[i]].length === 0) continue;

            // User type header
            results.push({
                filter: true,
                tag: 'li.user-type',
                text: typeDisplays[i]
            });

            // users
            const users = chatters[userTypes[i]];
            for (let j = 0; j < users.length; j++) {
                results.push({
                    tag: 'li',
                    text: users[j],
                    display: users[j]
                    // TODO(ehsankia): Replace display name
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

    loadViewerList() {
        if (viewList !== undefined && Date.now() - viewList.lastUpdate < 30 * 1000) {
            return;
        }

        let tmi;
        try {
            tmi = App.__container__.lookup('controller:chat').currentRoom;
            if (!tmi.tmiRoom) return;
        } catch (e) {
            debug.warning('Failed to load TMI in BVL');
            return;
        }

        const $oldList = $('#bvl-panel .viewer-list');
        $oldList.hide();

        const $refreshButton = $('#bvl-panel .refresh-button');
        $refreshButton.addClass('disable');

        const target = document.getElementById('bvl-panel');
        const spinner = new Spinner({
            color: '#fff',
            lines: 12,
            length: 6,
            width: 3,
            radius: 12,
        }).spin(target);

        const deferred = tmi.tmiRoom.list();
        deferred.then(data => {
            spinner.stop();
            $oldList.remove();
            setTimeout(() => $refreshButton.removeClass('disable'), 30 * 1000);

            $('#bvl-panel .status').hide();
            $('#bvl-panel .filter').show();
            const $parent = $('#bvl-panel');
            viewList = new ViewList({
                className: 'viewer-list',
                topClassName: 'bvl-top',
                bottomClassName: 'bvl-bottom',
                appendTo: $parent[0],
                rowHeight: 20,
                height: $parent.height() - 105,
                eachrow: function(row) {
                    return this.html(row.tag, {
                        onclick: e => {
                            if (row.filter) return;
                            moderatorCards.createFromName(row.text, $(e.target));
                        }
                    }, row.display || row.text);
                }
            });

            const oldRender = viewList.render;
            viewList.render = list => list && oldRender.call(viewList, list);

            viewList.render([]);
            chatterList = this.extractViewers(data);
            chatterCount = data.data.chatter_count;
            const $el = $('#bvl-panel .viewer-list');
            $el.height($parent.height() - 105);
            this.renderViewerList();
            viewList.lastUpdate = Date.now();
        }, () => {
            let errorText;
            spinner.stop();
            $refreshButton.removeClass('disable');
            $('#bvl-panel .status').show();
            if (viewList !== undefined) {
                $oldList.show();
                $('#bvl-panel .filter').show();
                const time = Math.ceil((Date.now() - viewList.lastUpdate) / 60000);
                errorText = 'Failed to load, showing ' + time + 'm old list.';
            } else {
                $('#bvl-panel .filter').hide();
                errorText = 'Failed to load viewer list, try again.';
            }
            $('#bvl-panel .status').text(errorText);
        });

        // Timeout after 15 seconds
        setTimeout(() => {
            if (deferred.readyState !== 4) deferred.abort();
        }, 15 * 1000);
    }

    createPanel() {
        // Create panel (Use Twitch jQuery to get Draggable)
        const $panel = jQuery(bvlTemplates.panel)
            .draggable({
                handle: '.drag_handle',
                containment: 'body',
                stop: (ev, ui) => {
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

        $panel.find('.close-button').click(() => $panel.hide());

        const self = this;
        $panel.find('.refresh-button').click(function() {
            if (this.classList.contains('disable')) return;
            self.loadViewerList();
        });

        const $container = $('.ember-chat');
        $panel.css({
            width: $container.width(),
            height: $container.height() - 115
        });

        $container.prepend($panel);

        // Setup resizing
        const resizable = new Resizable($panel[0], {
            handles: 's, se, e',
            threshold: 10,
            draggable: false
        });

        resizable.on('resize', () => {
            if (viewList === undefined) return;
            $('#bvl-panel .viewer-list').height($('#bvl-panel').height() - 105);
            this.renderViewerList();
        });

        // Setup filter handler
        $('#bvl-panel .filter').keyup(this.renderViewerList);

        // Load viewers
        this.loadViewerList();
    }
}

module.exports = new BetterViewerListModule();
