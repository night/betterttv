/* global BTTVLOADED:true PP:true*/
// Declare public and private variables
var debug = require('./helpers/debug'),
    vars = require('./vars'),
    TwitchAPI = require('./twitch-api'),
    WS = require('./ws'),
    Storage = require('./storage'),
    Settings = require('./settings');

require('es6-object-assign').polyfill();

bttv.info = {
    version: '6.8',
    release: 55,
    versionString: function() {
        return bttv.info.version + 'R' + bttv.info.release;
    }
};

bttv.TwitchAPI = TwitchAPI;
bttv.vars = vars;
bttv.storage = new Storage();
bttv.settings = new Settings();

bttv.getChannel = function() {
    if (window.Ember && window.App && ['channel.index.index', 'vod', 'videos'].indexOf(App.__container__.lookup('controller:application').get('currentRouteName')) > -1) {
        try {
            return App.__container__.lookup('service:persistentPlayer').playerComponent.channel.content.id;
        } catch (e) {
            var channel = App.__container__.lookup('controller:channel');
            var user = App.__container__.lookup('controller:user');
            return (!Ember.isNone(channel) && channel.get('model.id')) || (!Ember.isNone(user) && user.get('model.id'));
        }
    } else if (bttv.getChatController() && bttv.getChatController().currentRoom) {
        return bttv.getChatController().currentRoom.id;
    } else if (window.PP && PP.channel) {
        return PP.channel;
    }

    return '';
};

bttv.getModel = function() {
    var channel = App.__container__.lookup('controller:channel');
    var user = App.__container__.lookup('controller:user');
    return (!Ember.isNone(channel) && channel.get('model')) || (!Ember.isNone(user) && user.get('model'));
};

bttv.getChatController = function() {
    if (window.Ember && window.App && App.__container__.lookup('controller:chat')) {
        return App.__container__.lookup('controller:chat');
    }

    return false;
};

bttv.notify = function(message, options) {
    if (!message) return;

    options = options || {};
    var title = options.title || 'Notice';
    var url = options.url || '';
    var image = options.image || 'https://cdn.betterttv.net/assets/logos/bttv_logo.png';
    var tag = options.tag || 'bttv_' + message;
    var permanent = options.permanent || false;
    var expires = options.expires || 60000;

    tag = 'bttv_' + tag.toLowerCase().replace(/[^\w_]/g, '');

    if ($('body#chat').length) return;

    var desktopNotify = function() {
        var notification = new window.Notification(title, {
            icon: image,
            body: message,
            tag: tag
        });
        if (permanent === false) {
            notification.onshow = function() {
                setTimeout(function() {
                    notification.close();
                }, 10000);
            };
        }
        if (url !== '') {
            notification.onclick = function() {
                window.open(url);
                notification.close();
            };
        }
        bttv.storage.pushObject('bttvNotifications', tag, { expire: Date.now() + expires });
        setTimeout(function() { bttv.storage.spliceObject('bttvNotifications', tag); }, expires);
    };

    if (bttv.settings.get('desktopNotifications') === true && ((window.Notification && Notification.permission === 'granted') || (window.webkitNotifications && webkitNotifications.checkPermission() === 0))) {
        var notifications = bttv.storage.getObject('bttvNotifications');
        for (var notification in notifications) {
            if (notifications.hasOwnProperty(notification)) {
                var expireObj = notifications[notification];
                if (notification === tag) {
                    if (expireObj.expire < Date.now()) {
                        bttv.storage.spliceObject('bttvNotifications', notification);
                    } else {
                        return;
                    }
                }
            }
        }
        desktopNotify();
    } else {
        message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br /><br />').replace(/Click here(.*)./, '<a style="color: white;" target="_blank" href="' + url + '">Click here$1.</a>');

        // sometimes causes an error with closeAll
        try {
            window.Twitch.notify.alert(message, {
                layout: 'bottomCenter',
                timeout: 5000,
                killer: true,
                escape: false
            });
        } catch (e) {}
    }
};

bttv.chat = require('./chat');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

var betterViewerList = require('./features/better-viewer-list'),
    brand = require('./features/brand'),
    channelReformat = require('./features/channel-reformat'),
    ChatReplay = require('./features/chat-replay'),
    checkBroadcastInfo = require('./features/check-broadcast-info'),
    checkFollowing = require('./features/check-following'),
    checkMessages = require('./features/check-messages'),
    clearClutter = require('./features/clear-clutter'),
    conversations = require('./features/conversations'),
    createSettings = require('./features/create-settings'),
    darkenPage = require('./features/darken-page'),
    dashboardChannelInfo = require('./features/dashboard-channelinfo'),
    directoryFunctions = require('./features/directory-functions'),
    enableImagePreview = require('./features/image-preview').enablePreview,
    enableTheatreMode = require('./features/auto-theatre-mode'),
    disableChannelHeader = require('./features/disable-channel-header'),
    flipDashboard = require('./features/flip-dashboard'),
    formatDashboard = require('./features/format-dashboard'),
    giveawayCompatibility = require('./features/giveaway-compatibility'),
    handleBackground = require('./features/handle-background'),
    handleTwitchChatEmotesScript = require('./features/handle-twitchchat-emotes'),
    hidePrimePromotions = require('./features/hide-prime-promotions'),
    hostButtonBelowVideo = require('./features/host-btn-below-video'),
    overrideEmotes = require('./features/override-emotes'),
    playerViewerCount = require('./features/player-viewer-count'),
    splitChat = require('./features/split-chat'),
    videoPlayerFeatures = require('./features/video-player-features'),
    freeSubReminder = require('./features/free-sub-reminder');

var chatFunctions = function() {
    debug.log('Modifying Chat Functionality');

    if (bttv.getChatController() && bttv.getChannel() && bttv.getChatController().currentRoom) {
        bttv.chat.takeover();
    }
};

var chatReplay = null;

var main = function() {
    if (window.Ember) {
        var renderingCounter = 0;

        var waitForLoad = function(callback, count) {
            count = count || 0;
            if (count > 5) {
                callback(false);
            }
            setTimeout(function() {
                if (renderingCounter === 0) {
                    callback(true);
                } else {
                    waitForLoad(callback, ++count);
                }
            }, 1000);
        };

        // Keep an eye for route change to reapply fixes
        var route = '';
        App.__container__.lookup('controller:application').addObserver('currentRouteName', function(data) {
            debug.log('New route: ' + data.currentRouteName);
            var lastRoute = route;
            route = data.currentRouteName;

            switch (route) {
                case 'loading':
                    return;

                case 'channel.videos.video-type':
                case 'channel.followers':
                case 'channel.following':
                case 'channel.index.index':
                case 'channel.clips':
                    waitForLoad(function(ready) {
                        if (ready) {
                            handleBackground();
                            clearClutter();
                            channelReformat();
                            hostButtonBelowVideo();
                            betterViewerList();
                            playerViewerCount();
                            hidePrimePromotions();
                            disableChannelHeader();
                            freeSubReminder();
                            enableTheatreMode();

                            // Switching between tabs in channel page
                            if (lastRoute.substr(0, 8) === 'channel.') return;

                            // chat
                            bttv.chat.store.isLoaded = false;
                            chatFunctions();
                        }
                    });
                    break;
                case 'vod':
                case 'videos':
                    enableTheatreMode();
                    // disconnect old chat replay watcher, spawn new
                    try {
                        chatReplay.disconnect();
                    } catch (e) {}
                    chatReplay = new ChatReplay();
                    break;
                case 'directory.following.index':
                    // Switching between tabs in following page
                    if (lastRoute.substr(0, 19) === 'directory.following') break;

                    $('#main_col').removeAttr('style');
                    waitForLoad(function(ready) {
                        if (ready) {
                            directoryFunctions();
                        }
                    });
                    break;
                case 'profile.index':
                    waitForLoad(function(ready) {
                        if (ready) {
                            channelReformat();

                            // chat
                            bttv.chat.store.isLoaded = false;
                            chatFunctions();
                        }
                    });
                    break;
                default:
                    // resets main col width on all non-resized pages
                    $('#main_col').removeAttr('style');
                    break;
            }
        });

        Ember.subscribe('render', {
            before: function() {
                renderingCounter++;
            },
            after: function() {
                renderingCounter--;
            }
        });
    }

    var loadUser = function(callback) {
        if (window.Twitch.user.isLoggedIn()) {
            window.Twitch.user().then(function(user) {
                vars.userData.isLoggedIn = true;
                vars.userData.name = user.login;
                vars.userData.displayName = user.name;
                vars.userData.oauthToken = user.chat_oauth_token;

                callback();
            });
            return;
        }

        callback();
    };

    var initialFuncs = function() {
        bttv.conversations = conversations();
        bttv.ws = new WS();

        chatFunctions();
        chatReplay = new ChatReplay();
        clearClutter();
        channelReformat();
        checkBroadcastInfo();
        brand();
        darkenPage();
        splitChat();
        flipDashboard();
        formatDashboard();
        checkMessages();
        checkFollowing();
        giveawayCompatibility();
        dashboardChannelInfo();
        directoryFunctions();
        handleTwitchChatEmotesScript();
        hostButtonBelowVideo();
        betterViewerList();
        playerViewerCount();
        hidePrimePromotions();
        videoPlayerFeatures();
        disableChannelHeader();
        freeSubReminder();
        enableTheatreMode();

        // Loads global BTTV emotes (if not loaded)
        overrideEmotes();

        if (bttv.settings.get('chatImagePreview') === true) {
            enableImagePreview();
        }

        window.dispatchEvent(new Event('resize'));
    };

    $(document).ready(function() {
        loadUser(function() {
            createSettings();
            bttv.settings.load();

            debug.log('BTTV v' + bttv.info.versionString());
            debug.log('CALL init ' + document.URL);

            initialFuncs();
        });
    });
};

var checkJquery = function(times) {
    times = times || 0;
    if (times > 9) return;
    if (typeof (window.jQuery) === 'undefined') {
        debug.log('jQuery is undefined.');
        setTimeout(function() { checkJquery(times + 1); }, 1000);
        return;
    }
    var $ = window.jQuery;
    bttv.jQuery = $;
    main();
};

if (document.URL.indexOf('receiver.html') !== -1 || document.URL.indexOf('cbs_ad_local.html') !== -1) {
    debug.log('HTML file called by Twitch.');
    return;
}

if (location.pathname.match(/^\/(.*)\/popout/)) {
    debug.log('Popout player detected.');
    return;
}

var BETA_FORCED = false;
var FORCE_PERCENT = 50;
try {
    var userData = window.Twitch.user.peek().userData;
    BETA_FORCED = FORCE_PERCENT > 0 && parseInt(userData.id.toString().substr(-2), 10) <= FORCE_PERCENT - 1;
} catch (e) {}

if (bttv.storage.get('bttv_beta') === 'true' || BETA_FORCED === true) {
    debug.log('Launching BetterTTV beta');
    var beta = document.createElement('script');
    beta.setAttribute('src', 'https://beta.betterttv.net/betterttv.js');
    document.body.appendChild(beta);
    return;
}

if (location.hostname === 'clips.twitch.tv') {
    var clipDark = document.createElement('link');
    clipDark.setAttribute('href', 'https://cdn.betterttv.net/css/betterttv-clips-dark.css');
    clipDark.setAttribute('type', 'text/css');
    clipDark.setAttribute('rel', 'stylesheet');
    clipDark.setAttribute('id', 'clipDark');
    document.body.appendChild(clipDark);

    var toggleButton = document.createElement('a');
    toggleButton.classList.add('darkToggleButton');
    toggleButton.innerText = 'Toggle Dark Mode';
    toggleButton.onclick = function() {
        var isDark = bttv.storage.getObject('bttvClipsDark');
        if (typeof isDark !== 'boolean') isDark = false;

        bttv.storage.putObject('bttvClipsDark', !isDark);

        if (isDark) {
            document.body.classList.remove('dark');
        } else {
            document.body.classList.add('dark');
        }
    };
    document.body.appendChild(toggleButton);

    if (bttv.storage.getObject('bttvClipsDark') === true) {
        document.body.classList.add('dark');
    }

    return;
}

if (!window.Twitch || !window.Twitch.api || !window.Twitch.user) {
    debug.log('window.Twitch not detected.');
    return;
}

if (window.BTTVLOADED === true) return;
debug.log('BTTV LOADED ' + document.URL);
BTTVLOADED = true;
// We need this because we no longer serve chat history, remove when rolled out entirely
try {
    window.Twitch.experiments.overrideExperimentValue('MESSAGE_HISTORY', 'on');
} catch (e) {}
checkJquery();
