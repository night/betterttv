const debug = require('./helpers/debug');
const EventEmitter = require('events').EventEmitter;
const $ = require('jquery');

let route = '';
let chatWatcher;

class Watcher extends EventEmitter {
    constructor() {
        super();

        this.chatObserver();
        this.routeObserver();
        this.checkClips();
    }

    checkClips() {
        if (window.location.hostname !== 'clips.twitch.tv') return;
        this.emit('load.clips');
    }

    routeObserver() {
        if (!window.App || !window.Ember) return;

        let renderingCounter = 0;
        const waitForLoad = () => {
            return new Promise(resolve => {
                setTimeout(() => resolve(renderingCounter === 0 ? null : waitForLoad), 25);
            });
        };

        const onRouteChange = data => {
            if (data.currentRouteName === route) return;

            const lastRoute = route;
            route = data.currentRouteName;

            debug.log(`New route: ${route}`);

            waitForLoad().then(() => {
                debug.log(`Route loaded: ${route}`);

                // trigger on all loads (like resize functions)
                this.emit('load');

                switch (route) {
                    case 'loading':
                        break;

                    case 'channel.videos.video-type':
                    case 'channel.followers':
                    case 'channel.following':
                    case 'channel.index.index':
                        this.emit('load.channel');
                        // Switching between tabs in channel page
                        if (lastRoute.substr(0, 8) === 'channel.') break;
                        this.emit('load.chat');
                        break;
                    case 'vod':
                        this.emit('load.vod');
                        this.emit('load.chat');
                        break;
                    case 'directory.following.index':
                        // Switching between tabs in following page
                        if (lastRoute.substr(0, 19) === 'directory.following') break;
                        this.emit('load.directory.following');
                        break;
                }
            });
        };

        const applicationController = window.App.__container__.lookup('controller:application');

        onRouteChange({currentRouteName: applicationController.get('currentRouteName')});
        applicationController.addObserver('currentRouteName', onRouteChange);

        Ember.subscribe('render', {
            before: function() {
                renderingCounter++;
            },
            after: function() {
                renderingCounter--;
            }
        });
    }

    chatObserver() {
        const observe = (watcher, element) => {
            if (watcher) watcher.disconnect();
            watcher.observe(element, {childList: true, subtree: true});
        };

        chatWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const el = mutation.addedNodes[i];
                    const $el = $(el);

                    if ($el.hasClass('chat-line')) {
                        if ($el.find('.horizontal-line').length) continue;
                        console.log($el.find('.message').text());
                    }
                }
            })
        );

        this.on('load.chat', () => observe(chatWatcher, $('.chat-lines')[0]));
    }
}

module.exports = new Watcher();
