var keyCodes = require('./keycodes');

// Declare public and private variables
var debug = require('./debug'),
vars = require('./vars');

bttv.info = {
    version: "6.8",
    release: 22,
    versionString: function() { 
        return bttv.info.version + 'R' + bttv.info.release;
    }
}

bttv.vars = vars;

bttv.socketServer = false;

bttv.settings = {
    backup: function () {
        var download = {};

        for(var setting in vars.settings) {
            if(vars.settings.hasOwnProperty(setting)) {
                var value = vars.settings[setting].value;
                download[setting] = value;
            }
        }

        download = new Blob([JSON.stringify(download)], {
            type: "text/plain;charset=utf-8;",
        });

        bttv.saveAs(download, "bttv_settings.backup");
    },
    get: function(setting) {
        return ((vars.settings[setting]) ? vars.settings[setting].value : null);
    },
    import: function(input) {
        var getDataUrlFromUpload = function(input, callback) {
            var reader = new FileReader();

            reader.onload = function (e) {
                callback(e.target.result);
            }

            reader.readAsText(input.files[0]);
        }

        var isJson = function(string) {
            try {
                JSON.parse(string);
            } catch (e) {
                return false;
            }
            return true;
        }

        getDataUrlFromUpload(input, function(data) {
            if(isJson(data)) {
                var settings = JSON.parse(data),
                    count = 0;

                for(var setting in settings) {
                    if(settings.hasOwnProperty(setting)) {
                        var value = settings[setting];

                        if(vars.settings[setting] && vars.settings[setting].value !== value) {
                            count++;
                            bttv.settings.save(setting, value);
                        }
                    }
                }
                bttv.notify("BetterTTV imported "+count+" settings, and will now refresh in a few seconds.");
                setTimeout(function() {
                    window.location.reload();
                }, 3000);
            } else {
                bttv.notify("You uploaded an invalid file.");
            }
        });
    },
    load: function () {
        var parseSetting = function(value) {
            if(value == null) {
                return null;
            } else if(value === "true") {
                return true;
            } else if(value === "false") {
                return false;
            } else if(value === "") {
                return "";
            } else if(isNaN(value) === false) {
                return parseInt(value);
            } else {
                return value;
            }
        }
        var settingsList = require('./settings-list');

        var settingTemplate = require('./templates/setting-switch');

        var featureRequests = ' \
            <div class="option"> \
                Think something is missing here? Send in a <a href="https://github.com/night/BetterTTV/issues/new?labels=enhancement" target="_blank">feature request</a>! \
            </div> \
        ';

        settingsList.forEach(function(setting) {
            vars.settings[setting.storageKey] = setting;
            vars.settings[setting.storageKey].value = (parseSetting(bttv.storage.get(bttv.settings.prefix+setting.storageKey)) == null) ? setting.default : parseSetting(bttv.storage.get(bttv.settings.prefix+setting.storageKey));

            if(setting.name) {
                var settingHTML = settingTemplate(setting);
                $('#bttvSettings .options-list').append(settingHTML);
                bttv.settings.get(setting.storageKey) === true ? $('#'+setting.storageKey+'True').prop('checked', true) : $('#'+setting.storageKey+'False').prop('checked', true);
            }

            if(setting.hidden) {
                $("#bttvSettingsPanel .bttvOption-"+setting.storageKey).css('display','none');
                $("#bttvSettingsPanel .bttvOption-"+setting.storageKey).addClass('konami');
            }

            if(setting.load) {
                setting.load();
            }
        });

        /*var plea = ' \
            <div class="option"> \
                <img src="http://cdn.betterttv.net/emotes/batkappa.png" style="margin: -5px 0px;"/> "I\'ve been spending <b>days</b> fixing BetterTTV. Maybe people will <a href="https://streamdonations.net/c/night" target="_blank">contribute</a> for the trouble." \
            </div> \
        ';*/

        $('#bttvSettings .options-list').append(featureRequests);
        //$('#bttvSettings .options-list h2.option').before(plea);

        $('.option input:radio').change(function (e) {
            bttv.settings.save(e.target.name, parseSetting(e.target.value));
        });

        var notifications = bttv.storage.getObject("bttvNotifications");
        for(var notification in notifications) {
            if(notifications.hasOwnProperty(notification)) {
                var expireObj = notifications[notification];
                if(expireObj.expire < Date.now()) {
                    bttv.storage.spliceObject("bttvNotifications", notification);
                }
            }
        }

        var receiveMessage = function(e) {
            if(e.origin !== window.location.protocol+'//'+window.location.host) return;
            if(e.data) {
                if(typeof e.data !== 'string') return;

                var data = e.data.split(' ');
                if(data[0] === "bttv_setting") {
                    var key = data[1],
                        value = parseSetting(data[2]);

                    bttv.settings.save(key, value);
                }
            }
        }
        window.addEventListener("message", receiveMessage, false);
    },
    popup: function() {
        var settingsUrl = window.location.protocol+'//'+window.location.host+'/settings?bttvSettings=true';
        window.open(settingsUrl, 'BetterTTV Settings', 'width=800,height=500,top=500,left=800,scrollbars=no,location=no,directories=no,status=no,menubar=no,toolbar=no,resizable=no');
    },
    prefix: "bttv_",
    save: function(setting, value) {
        if(/\?bttvSettings=true/.test(window.location)) {
            window.opener.postMessage('bttv_setting '+setting+' '+value, window.location.protocol+'//'+window.location.host);
        } else {
            if(window.ga) ga('send', 'event', 'BTTV', 'Change Setting: '+setting+'='+value);
            if(/\?bttvDashboard=true/.test(window.location)) window.parent.postMessage('bttv_setting '+setting+' '+value, window.location.protocol+'//'+window.location.host);
            vars.settings[setting].value = value;
            bttv.storage.put(bttv.settings.prefix+setting, value);
            if(vars.settings[setting].toggle) vars.settings[setting].toggle(value);
        }
    }
}

bttv.storage = {
    exists: function(item) {
        return (bttv.storage.get(item) ? true : false);
    },
    get: function(item) {
        return localStorage.getItem(item);
    },
    getArray: function(item) {
        if(!bttv.storage.exists(item)) bttv.storage.putArray(item, []);
        return JSON.parse(bttv.storage.get(item));
    },
    getObject: function(item) {
        if(!bttv.storage.exists(item)) bttv.storage.putObject(item, {});
        return JSON.parse(bttv.storage.get(item));
    },
    put: function(item, value) {
        localStorage.setItem(item, value);
    },
    pushArray: function(item, value) {
        var i = bttv.storage.getArray(item);
        i.push(value);
        bttv.storage.putArray(item, i);
    },
    pushObject: function(item, key, value) {
        var i = bttv.storage.getObject(item);
        i[key] = value;
        bttv.storage.putObject(item, i);
    },
    putArray: function(item, value) {
        bttv.storage.put(item, JSON.stringify(value));
    },
    putObject: function(item, value) {
        bttv.storage.put(item, JSON.stringify(value));
    },
    spliceArray: function(item, value) {
        var i = bttv.storage.getArray(item);
        if(i.indexOf(value) !== -1) i.splice(i.indexOf(value), 1);
        bttv.storage.putArray(item, i);
    },
    spliceObject: function(item, key) {
        var i = bttv.storage.getObject(item);
        delete i[key];
        bttv.storage.putObject(item, i);
    }
}

bttv.getChannel = function() {
    if(window.Ember && window.App && App.__container__.lookup("controller:application").get("currentRouteName") === "channel.index") {
        return App.__container__.lookup("controller:channel").get('id');
    } else if(bttv.getChatController() && bttv.getChatController().currentRoom) {
        return bttv.getChatController().currentRoom.id;
    } else if(window.PP && PP.channel) {
        return PP.channel;
    }
}

bttv.getChatController = function() {
    if(window.Ember && window.App && App.__container__.lookup("controller:chat")) {
        return App.__container__.lookup("controller:chat");
    } else {
        return false;
    }
}

bttv.notify = function(message, title, url, image, tag, permanent) {
    var title = title || "Notice",
        url = url || "",
        image = image || "//cdn.betterttv.net/style/logos/bttv_logo.png",
        message = message || "",
        tag = tag || "bttv_"+message,
        tag = "bttv_"+tag.toLowerCase().replace(/[^\w_]/g, ''),
        permanent = permanent || false;

    if($("body#chat").length) return;

    var desktopNotify = function(message, title, url, image, tag, permanent) {
        var notification = new window.Notification(title, {
            icon: image,
            body: message,
            tag: tag
        });
        if(permanent === false) {
            notification.onshow = function() {
                setTimeout(function() {
                    notification.close();
                }, 10000)
            }
        }
        if(url !== "") {
            notification.onclick = function() {
                window.open(url);
                notification.close();
            }
        }
        bttv.storage.pushObject("bttvNotifications", tag, { expire: Date.now()+60000 });
        setTimeout(function() { bttv.storage.spliceObject("bttvNotifications", tag); }, 60000);
    }

    if(bttv.settings.get("desktopNotifications") === true && ((window.Notification && Notification.permission === 'granted') || (window.webkitNotifications && webkitNotifications.checkPermission() === 0))) {
        var notifications = bttv.storage.getObject("bttvNotifications");
        for(var notification in notifications) {
            if(notifications.hasOwnProperty(notification)) {
                var expireObj = notifications[notification];
                if(notification === tag) {
                    if(expireObj.expire < Date.now()) {
                        bttv.storage.spliceObject("bttvNotifications", notification);
                    } else {
                        return;
                    }
                }
            }
        }
        desktopNotify(message, title, url, image, tag, permanent);
    } else {
        message = message.replace(/\n/g, "<br /><br />").replace(/Click here(.*)./, '<a style="color: white;" target="_blank" href="'+url+'">Click here$1.</a>');
        $.gritter.add({
            title: title,
            image: image,
            text: message,
            sticky: permanent
        });
    }
}

bttv.chat = {
    templates: {
        badge: function(type, name, description) { return '<div class="'+type+''+((bttv.settings.get('alphaTags') && ['admin','staff','broadcaster','moderator','turbo','ign'].indexOf(type) !== -1)?' alpha'+(!bttv.settings.get("darkenedMode")?' invert':''):'')+' badge" title="'+description+'">'+name+'</div> '; },
        badges: function(badges) {
            var resp = '<span class="badges">';
            badges.forEach(function(data) {
                resp += bttv.chat.templates.badge(data.type, data.name, data.description);
            });
            resp += '</span>';
            return resp;
        },
        from: function(name, color) { return '<span '+(color?'style="color: '+color+';" ':'')+'class="from">'+bttv.chat.templates.escape(bttv.storage.getObject("nicknames")[name.toLowerCase()] || name)+'</span><span class="colon">:</span>'+(name!=='jtv'?'&nbsp;<wbr></wbr>':''); },
        timestamp: function(time) { return '<span class="timestamp"><small>'+time+'</small></span>'; },
        modicons: function() { return '<span class="mod-icons"><a class="timeout" title="Timeout">Timeout</a><a class="ban" title="Ban">Ban</a><a class="unban" title="Unban" style="display: none;">Unban</a></span>'; },
        escape: function(message) { return message.replace(/</g,'&lt;').replace(/>/g, '&gt;'); },
        linkify: function(message) {
            var regex = /((\b|\B)\x02?((?:https?:\/\/|[\w\-\.\+]+@)?\x02?(?:[\w\-]+\x02?\.)+\x02?(?:com|au|org|tv|net|info|jp|uk|us|cn|fr|mobi|gov|co|ly|media|me|vg|eu|ca|fm|am|ws)\x02?(?:\:\d+)?\x02?(?:\/[\w\.\/@\?\&\%\#\(\)\,\-\+\=\;\:\x02?]+\x02?[\w\/@\?\&\%\#\(\)\=\;\x02?]|\x02?\w\x02?|\x02?)?\x02?)\x02?(\b|\B)|(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9]+-?)*[a-z0-9]+)(?:\.(?:[a-z0-9]+-?)*[a-z0-9]+)*(?:\.(?:[a-z]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?)/gi;
            return message.replace(regex, function(e) {
                if (/\x02/.test(e)) return e;
                if (e.indexOf("@") > -1 && (e.indexOf("/") === -1 || e.indexOf("@") < e.indexOf("/"))) return '<a href="mailto:' + e + '">' + e + "</a>";
                var link = e.replace(/^(?!(?:https?:\/\/|mailto:))/i, 'http://');
                return '<a href="' + link + '" target="_blank">' + e + '</a>';
            });
        },
        emoticon: function(setId, setClass, regex) {
            return '<span class="emoticon '+setClass+'"'+((bttv.TwitchEmoteSets && bttv.TwitchEmoteSets[setId]) ? ' data-channel="'+bttv.TwitchEmoteSets[setId]+'"' : '')+' data-regex="'+encodeURIComponent(getEmoteFromRegEx(regex))+'"></span>';
        },
        emoticonCss: function (image, id){
            var css = "";
            if(image.height > 18) css = "margin: -" + (image.height-18)/2 + "px 0px";
            return ".emo-"+id+" {"+'background-image: url("'+image.url+'");'+"height: "+image.height+"px;"+"width: "+image.width+"px;"+css+"}";
        },
        emoticonize: function(message, userSets) {
            var emotes = bttv.chat.emoticons();

            if(!emotes || !emotes['default']) return message;

            if(userSets.length > 0) {
                for(var i=0; i<userSets.length; i++) {
                    var set = userSets[i];

                    if(emotes[set] === undefined) continue;

                    for(var j=0; j<emotes[set].length; j++) {
                        var emote = emotes[set][j];

                        if(message.match(emote.regex)) {
                            return message.replace(emote.regex, bttv.chat.templates.emoticon(set, emote.cls, emote.regex));
                        }
                    }
                }
            }

            for(var i=0; i<emotes['default'].length; i++) {
                var emote = emotes['default'][i];

                if(message.match(emote.regex)) {
                    return message.replace(emote.regex, bttv.chat.templates.emoticon(-1, emote.cls, emote.regex));
                }
            }

            return message;
        },
        moderationCard: function(user, top, left) {
            var moderationCardTemplate = require('./templates/moderation-card');
            return moderationCardTemplate({user: user, top: top, left: left});
        },
        message: function(sender, message, userSets, colored) {
            colored = colored || false;
            var templates = bttv.chat.templates;
            var rawMessage = encodeURIComponent(message);
            if(sender !== 'jtv') {
                var tokenizedString = message.split(' ');

                for(var i=0; i<tokenizedString.length; i++) {
                    tokenizedString[i] = templates.escape(tokenizedString[i]);
                    tokenizedString[i] = templates.emoticonize(tokenizedString[i], userSets);
                    tokenizedString[i] = templates.linkify(tokenizedString[i]);
                }

                message = tokenizedString.join(' ');
            }
            return '<span class="message" '+(colored?'style="color: '+colored+'" ':'')+'data-raw="'+rawMessage+'">'+message+'</span>';
        },
        privmsg: function(highlight, action, server, isMod, data) {
            var templates = bttv.chat.templates;
            return '<div class="chat-line'+(highlight?' highlight':'')+(action?' action':'')+(server?' admin':'')+'" data-sender="'+data.sender+'">'+templates.timestamp(data.time)+' '+(isMod?templates.modicons():'')+' '+templates.badges(data.badges)+templates.from(data.nickname, data.color)+templates.message(data.sender, data.message, data.emoteSets, action?data.color:false)+'</div>';
        }
    },
    tmi: function() { return (bttv.getChatController()) ? bttv.getChatController().currentRoom : false; },
    emoticons: function() { return (window.Ember && window.App) ? App.__container__.lookup("controller:emoticons").get("emoticonSets") || {} : {}; },
    takeover: function() {
        var chat = bttv.chat,
            tmi = chat.tmi();

        if(bttv.chat.store.isLoaded) return;

        if(bttv.socketServer) {
            if(bttv.getChannel()) chat.helpers.lookupDisplayName(bttv.getChannel());
            if(vars.userData.isLoggedIn) chat.helpers.lookupDisplayName(vars.userData.login);
        }

        // Hides Group List if coming from directory
        bttv.getChatController().set("showList", false);

        if(tmi.get('isLoading')) {
            debug.log('chat is still loading');
            setTimeout(function() {
                bttv.chat.takeover();
            }, 1000);
            return;
        }

        // Default timestamps & mod icons to on
        var settings = bttv.storage.getObject('chatSettings');
        if(typeof settings.showModIcons === "undefined") {
            settings.showModIcons = true;
            $('.ember-chat .chat-messages').removeClass('hideModIcons');
            bttv.storage.putObject('chatSettings', settings);
        }
        if(typeof settings.showTimestamps === "undefined") {
            settings.showTimestamps = true;
            $('.ember-chat .chat-messages').removeClass('hideTimestamps');
            bttv.storage.putObject('chatSettings', settings);
        }

        chat.store.isLoaded = true;

        // Take over listeners
        debug.log('Loading chat listeners');
        for(var channel in tmi.tmiSession._rooms) {
            if(tmi.tmiSession._rooms.hasOwnProperty(channel)) {
                delete tmi.tmiSession._rooms[channel]._events['message'];
                delete tmi.tmiSession._rooms[channel]._events['clearchat'];
            }
        }

        // Handle Channel Chat
        bttv.chat.store.newRoom(bttv.getChannel());
        tmi.tmiRoom.on('message', bttv.chat.store.getRoom(bttv.getChannel()).chatHandler);
        tmi.tmiRoom.on('clearchat', chat.handlers.clearChat);
        tmi.set('name', chat.helpers.lookupDisplayName(bttv.getChannel()));
        bttv.chat.store.currentRoom = bttv.getChannel();
        //tmi.tmiRoom.on('labelschanged', chat.handlers.labelsChanged);

        // Handle Group Chats
        var privateRooms = bttv.getChatController().get('connectedPrivateGroupRooms');
        if(privateRooms && privateRooms.length > 0) {
            privateRooms.forEach(function(room) {
                bttv.chat.store.newRoom(room.get('id'));
                room.tmiRoom.on('message', bttv.chat.store.getRoom(room.get('id')).chatHandler);
                room.tmiRoom.on('clearchat', chat.handlers.clearChat);
            });
        }

        // Load BTTV emotes if not loaded
        overrideEmotes();

        // Load Chat Settings
        loadChatSettings();

        // Hover over icons
        $("body").off('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a').on('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a', function() {
            $(this).tipsy({
                trigger: 'manual',
                gravity: "sw"
            });
            $(this).tipsy("show");
        }).off('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a').on('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a', function() {
            $(this).tipsy("hide");
            $('div.tipsy').remove();
        });

        // hover over mod card icons
        $("body").off('mouseover', '.bttv-mod-card button').on('mouseover', '.bttv-mod-card button', function() {
            $(this).tipsy({
                trigger: 'manual',
                gravity: "s"
            });
            $(this).tipsy("show");
        }).off('mouseout', '.bttv-mod-card button').on('mouseout', '.bttv-mod-card button', function() {
            $(this).tipsy("hide");
            $('div.tipsy').remove();
        });

        // Make Timeout/Ban/Unban buttons work and Turbo/Subscriber clickable
        $("body").off("click", ".chat-line .mod-icons .timeout").on("click", ".chat-line .mod-icons .timeout", function() {
            bttv.chat.helpers.timeout($(this).parents(".chat-line").data("sender"));
            $(this).parent().children('.ban').hide();
            $(this).parent().children('.unban').show();
        }).off("click", ".chat-line .mod-icons .ban").on("click", ".chat-line .mod-icons .ban", function() {
            bttv.chat.helpers.ban($(this).parents(".chat-line").data("sender"));
            $(this).parent().children('.ban').hide();
            $(this).parent().children('.unban').show();
        }).off("click", ".chat-line .mod-icons .unban").on("click", ".chat-line .mod-icons .unban", function() {
            bttv.chat.helpers.unban($(this).parents(".chat-line").data("sender"));
            $(this).parent().children('.ban').show();
            $(this).parent().children('.unban').hide();
        }).off("click", ".chat-line .badges .turbo, .chat-line .badges .subscriber").on("click", ".chat-line .badges .turbo, .chat-line .badges .subscriber", function() {
            if($(this).hasClass('turbo')) {
                window.open('/products/turbo?ref=chat_badge','_blank');
            } else if($(this).hasClass('subscriber')) {
                window.open(Twitch.url.subscribe(bttv.getChannel(),'in_chat_subscriber_link'),'_blank');
            }
        });

        // Make names clickable
        $("body").off("click", ".chat-line .from").on("click", ".chat-line .from", function() {
            bttv.chat.handlers.moderationCard($(this).parent().data('sender')+"", $(this));
        });

        // Load emote sets
        if(bttv.socketServer) {
            bttv.socketServer.emit("twitch emotes");
            bttv.socketServer.on("twitch emotes", function(result) {
                bttv.socketServer.off("twitch emotes");
                bttv.TwitchEmoteSets = result.sets;

                // Give some tips to Twitch Emotes
                if(tmi.product && tmi.product.emoticons) {
                    for(var i=0; i<tmi.product.emoticons.length; i++) {
                        var emote = tmi.product.emoticons[i];

                        if(emote.state && emote.state === "active" && !bttv.TwitchEmoteSets[emote.emoticon_set]) {
                            bttv.socketServer.emit('give_tip', { channel: bttv.getChannel(), user: (vars.userData.isLoggedIn ? vars.userData.login : 'guest') });
                            break;
                        }
                    }
                }
            });

            // TODO: Implement auto server selection, anon chat, etc.
            bttv.socketServer.emit("chat servers");
            bttv.socketServer.on("chat servers", function(data) {
                bttv.socketServer.off("chat servers");
                bttv.TwitchStatus = {};
                bttv.TwitchChatServers = [];
                bttv.TwitchChatPorts = [];

                data.servers.forEach(function(server) {
                    bttv.TwitchStatus[server.ip+":"+server.port] = server.lag;
                    bttv.TwitchChatServers.push(server.ip);
                    bttv.TwitchChatPorts.push(server.port);
                });
            });
        }

        // Make chat translatable
        if (!vars.loadedDoubleClickTranslation && bttv.settings.get("dblclickTranslation") !== false) {
            vars.loadedDoubleClickTranslation = true;
            $('body').on('dblclick', '.chat-line', function() {
                chat.helpers.translate($(this).find('.message'), $(this).data("sender"), $(this).find('.message').data("raw"));
                $(this).find('.message').text("Translating..");
                $('div.tipsy').remove();
            });
        }

        

        // Message input features (tab completion, message history, anti-prefix completion, extra commands)
        var lastPartialMatch = null;
        var lastMatch = null;
        var lastIndex = null

        var $chatInput = $('.ember-chat .chat-interface textarea');

        // Disable Twitch's chat sender
        $chatInput.off();

        $chatInput.on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;

            // Tab completion
            if (keyCode === keyCodes.Tab) {
                e.preventDefault();
                var sentence = $chatInput.val().trim().split(' ');
                var partialMatch = sentence.pop().toLowerCase();
                var users = Object.keys(bttv.chat.store.chatters);
                var userIndex = 0;
                if (lastPartialMatch === null) {
                    lastPartialMatch = partialMatch;
                } else if (partialMatch.search(lastPartialMatch) !== 0) {
                    lastPartialMatch = partialMatch;
                } else if (lastMatch !== $chatInput.val()) {
                    lastPartialMatch = partialMatch;
                } else {
                    if (sentence.length === 0) {
                        userIndex = users.indexOf(partialMatch.substr(0, partialMatch.length - 1));
                    } else {
                        userIndex = users.indexOf(partialMatch);
                    }
                    if (e.shiftKey && userIndex > 0) {
                        userIndex = userIndex - 1;
                    }
                }
                for (var i = userIndex; i < users.length; i++) {
                    var user = users[i] || '';
                    if (lastPartialMatch.length > 0 && user.search(lastPartialMatch, "i") === 0) {
                        if (user === partialMatch || user === partialMatch.substr(0, partialMatch.length - 1)) {
                            continue;
                        }
                        if(bttv.chat.store.displayNames && bttv.chat.store.displayNames[user]) {
                            sentence.push(bttv.chat.store.displayNames[user].displayName);
                        } else {
                            sentence.push(user.capitalize());
                        }
                        if (sentence.length === 1) {
                            $chatInput.val(sentence.join(' ') + ", ");
                            lastMatch = sentence.join(' ') + ", ";
                            lastIndex = i;
                        } else {
                            $chatInput.val(sentence.join(' '));
                            lastMatch = sentence.join(' ');
                            lastIndex = i;
                        }
                        break;
                    }
                }
            }

            // Anti-Prefix Completion
            if(bttv.settings.get("antiPrefix") === true) {
                if (keyCode === keyCodes.Space || keyCode === keyCodes.Enter) {
                    if(!chat.store.__emoteRegexes) {
                        chat.store.__emoteRegexes = [];
                        if(chat.emoticons()['default']) {
                            chat.emoticons()['default'].forEach(function(emote) {
                                chat.store.__emoteRegexes.push(""+emote.regex);
                            });
                        }
                    }
                    for(var emote in chat.store.autoCompleteEmotes) {
                        if(chat.store.autoCompleteEmotes.hasOwnProperty(emote) && chat.store.__emoteRegexes.indexOf("/\\b"+emote+"\\b/g") === -1) {
                            var emoteRegex = new RegExp("\\b"+emote+"\\b","g");
                            $chatInput.val($chatInput.val().replace(emoteRegex, chat.store.autoCompleteEmotes[emote]));
                        }
                    }
                }
            }

            // Chat history
            if(bttv.settings.get('chatLineHistory') === true) {
                if (keyCode === keyCodes.Enter) {
                    if(chat.store.chatHistory.indexOf($chatInput.val()) !== -1) {
                        chat.store.chatHistory.splice(chat.store.chatHistory.indexOf($chatInput.val()), 1);
                    }
                    chat.store.chatHistory.unshift($chatInput.val());
                }
                var historyIndex = chat.store.chatHistory.indexOf($chatInput.val());
                if (keyCode === keyCodes.UpArrow) {
                    if(historyIndex >= 0) {
                        if(chat.store.chatHistory[historyIndex+1]) {
                            $chatInput.val(chat.store.chatHistory[historyIndex+1]);
                        }
                    } else {
                        if($chatInput.val() !== "") {
                            chat.store.chatHistory.unshift($chatInput.val());
                            $chatInput.val(chat.store.chatHistory[1]);
                        } else {
                            $chatInput.val(chat.store.chatHistory[0]);
                        }

                    }
                }
                if (keyCode === keyCodes.DownArrow) {
                    if(historyIndex >= 0) {
                        if(chat.store.chatHistory[historyIndex-1]) {
                            $chatInput.val(chat.store.chatHistory[historyIndex-1]);
                        } else {
                            $chatInput.val('');
                        }
                    }
                }
            }

            // Chat commands
            if(keyCode === keyCodes.Enter) {
                var sentence = $chatInput.val().trim().split(' ');
                var command = sentence[0];
                var tmi = bttv.chat.tmi();

                if (command === "/b") {
                    bttv.chat.helpers.ban(sentence[1]);
                } else if (command === "/t") {
                    var time = 600;
                    if(!isNaN(sentence[2])) time = sentence[2];
                    bttv.chat.helpers.timeout(sentence[1], time);
                } else if (command === "/massunban" || ((command === "/unban" || command === "/u") && sentence[1] === "all")) {
                    bttv.chat.helpers.massUnban();
                } else if (command === "/u") {
                    bttv.chat.helpers.unban(sentence[1]);
                } else if (command === "/sub") {
                    tmi.tmiRoom.startSubscribersMode();
                } else if (command === "/suboff") {
                    tmi.tmiRoom.stopSubscribersMode();
                } else if (command === "/localsub") {
                    bttv.chat.helpers.serverMessage("Local subscribers-only mode enabled.");
                    vars.localSubsOnly = true;
                } else if (command === "/localsuboff") {
                    bttv.chat.helpers.serverMessage("Local subscribers-only mode disabled.");
                    vars.localSubsOnly = false;
                } else if (command === "/viewers") {
                    Twitch.api.get('streams/' + bttv.getChannel()).done(function(stream) {
                        bttv.chat.helpers.serverMessage("Current Viewers: " + Twitch.display.commatize(stream.stream.viewers));
                    }).fail(function() {
                        bttv.chat.helpers.serverMessage("Could not fetch viewer count.");
                    });
                } else if (command === "/followers") {
                    Twitch.api.get('channels/' + bttv.getChannel() + '/follows').done(function(channel) {
                        bttv.chat.helpers.serverMessage("Current Followers: " + Twitch.display.commatize(channel._total));
                    }).fail(function() {
                        bttv.chat.helpers.serverMessage("Could not fetch follower count.");
                    });
                } else if (command === "/linehistory") {
                    if(sentence[1] === "off") {
                        bttv.settings.save('chatLineHistory', false);
                    } else {
                        bttv.settings.save('chatLineHistory', true);
                    }
                } else if(bttv.socketServer && command === "/invite" && sentence[1] === "friends") {
                    //bttv.socketServer.emit("invite friends", { channel: CurrentChat.channel, token: CurrentChat.userData.chat_oauth_token });
                }
            }
        });

        // Implement our own text sender
        $chatInput.on('keydown', function(e) {
            if(e.which === keyCodes.Enter) {
                var val = $chatInput.val().trim();
                if(e.shiftKey || !val.length) return;

                // Easter Egg Kappa
                var words = val.toLowerCase().split(' ');
                if(words.indexOf('twitch') > -1 && words.indexOf('amazon') > -1 && words.indexOf('google') > -1) {
                    bttv.chat.helpers.serverMessage('<img src="https://cdn.betterttv.net/special/twitchtrollsgoogle.gif"/>');
                    bttv.chat.helpers.serverMessage('<img src="https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ddc6e3a8732cb50f-25x28.png"/>')
                }

                bttv.chat.helpers.sendMessage(val);
                $chatInput.val('');
            }
        });
        $chatInput.on('keyup', function(e) {
            if(e.which === keyCodes.Enter) {
                if(e.shiftKey) return;

                $chatInput.val('');
            }
        });

        $('.ember-chat .chat-messages .chat-line').remove();
        if(bttv.socketServer) bttv.socketServer.emit('chat history');
        chat.helpers.serverMessage('<center><small>BetterTTV v' + bttv.info.version + ' Loaded.</small></center>');
        chat.helpers.serverMessage('Welcome to '+chat.helpers.lookupDisplayName(bttv.getChannel())+'\'s chat room!');

        // Poll mods list in case +o fails.
        chat.store.checkMods = true;
        chat.helpers.sendMessage('/mods');

        // Check if you're admin or staff in case +o fails.
        Twitch.user(function(data){
            if(data.is_admin || data.is_staff) {
                var modList = chat.helpers.listMods();

                if(!modList[data.login]) {
                    chat.helpers.addMod(data.login);
                    debug.log("Added "+data.login+" as a mod");
                }
            }
        });

        // When messages come in too fast, things get laggy
        if(!chat.store.__messageTimer) chat.store.__messageTimer = setInterval(chat.handlers.shiftQueue, 250);

        // Active Tab monitoring - Useful for knowing if a user is "watching" chat
        $(window).off("blur focus").on("blur focus", function(e) {
            var prevType = $(this).data("prevType");

            if (prevType != e.type) {   //  reduce double fire issues
                switch (e.type) {
                    case "blur":
                        chat.store.activeView = false;
                        break;
                    case "focus":
                        chat.store.activeView = true;
                        break;
                }
            }

            $(this).data("prevType", e.type);
        });

        // Keycode to quickly timeout users
        $(window).off("keydown").on("keydown", function(e) {
            var keyCode = e.keyCode || e.which;

            if($('.bttv-mod-card').length && bttv.settings.get("modcardsKeybinds") === true) {
                var user = $('.bttv-mod-card').data('user');
                switch (keyCode) {
                    case keyCodes.Esc:
                        $('.bttv-mod-card').remove();
                        break;
                    case keyCodes.t:
                        bttv.chat.helpers.timeout(user);
                        $('.bttv-mod-card').remove();
                        break;
                    case keyCodes.p:
                        bttv.chat.helpers.timeout(user, 1);
                        $('.bttv-mod-card').remove();
                        break;
                    case keyCodes.b:
                        bttv.chat.helpers.ban(user);
                        $('.bttv-mod-card').remove();
                        break;
                    case keyCodes.i:
                        bttv.chat.helpers.sendMessage("/ignore "+user);
                        $('.bttv-mod-card').remove();
                        break;
                }
            }
        });
    },
    helpers: {
        lookupDisplayName: function(user) {
            if(!user || user === "") return;
            var tmi = bttv.chat.tmi();
            var store = bttv.chat.store;
            var socketServer = bttv.socketServer;
            if(tmi) {
                if(store.displayNames[user]) {
                    if(socketServer && (Date.now()-store.displayNames[user].date) > 900000) {
                        socketServer.emit('lookup', { user: user });
                    }
                    return store.displayNames[user].displayName;
                } else if(user !== "jtv" && user !== "twitchnotify") {
                    if(socketServer) {
                        socketServer.emit('lookup', { user: user });
                    } else {
                        if(store.__usersBeingLookedUp < 2) {
                            store.__usersBeingLookedUp++;
                            Twitch.api.get("users/" + user).done(function (d) {
                                if(d.display_name && d.name) {
                                    store.displayNames[d.name] = {
                                        displayName: d.display_name,
                                        date: Date.now()
                                    };
                                }
                                store.__usersBeingLookedUp--;
                            });
                        }
                    }
                    return user.capitalize();
                } else {
                    return user;
                }
            } else {
                return user.capitalize();
            }
        },
        serverMessage: function(message) {
            bttv.chat.handlers.onPrivmsg(bttv.chat.store.currentRoom, {
                from: 'jtv',
                date: new Date(),
                message: message,
                style: 'admin'
            });
        },
        notifyMessage: function (type, message) {
            var tagType = (bttv.settings.get("showJTVTags") === true && ["moderator","broadcaster","admin","staff","bot"].indexOf(type) !== -1) ? 'old'+type : type;
            bttv.chat.handlers.onPrivmsg(bttv.chat.store.currentRoom, {
                from: 'twitchnotify',
                date: new Date(),
                badges: [{
                            type: tagType,
                            name: ((bttv.settings.get("showJTVTags") && type !== "subscriber" && type !== "turbo")?type.capitalize():''),
                            description: tagType.capitalize()
                }],
                message: message,
                style: 'notification'
            });
        },
        sendMessage: function(message) {
            if(!message || message === "") return;
            var tmi = bttv.chat.tmi();
            if(tmi) tmi.tmiRoom.sendMessage(message);
        },
        listMods: function() {
            var tmi = bttv.chat.tmi();
            if(tmi) return tmi.tmiRoom._roomUserLabels._sets;
            return {};
        },
        addMod: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            if(tmi) tmi.tmiRoom._roomUserLabels.add(user, 'mod');
        },
        removeMod: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            if(tmi) tmi.tmiRoom._roomUserLabels.remove(user, 'mod');
        },
        isIgnored: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            return (tmi && tmi.tmiSession.isIgnored(user)) ? true : false;
        },
        isOwner: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            return (tmi && tmi.tmiRoom.getLabels(user).indexOf('owner') !== -1) ? true : false;
        },
        isAdmin: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            return (tmi && tmi.tmiRoom.getLabels(user).indexOf('admin') !== -1) ? true : false;
        },
        isStaff: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            return (tmi && tmi.tmiRoom.getLabels(user).indexOf('staff') !== -1) ? true : false;
        },
        isModerator: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            return (tmi && tmi.tmiRoom.getLabels(user).indexOf('mod') !== -1) ? true : false;
        },
        isTurbo: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            return (tmi && tmi.tmiRoom.getLabels(user).indexOf('turbo') !== -1) ? true : false;
        },
        isSubscriber: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            return (tmi && tmi.tmiRoom.getLabels(user).indexOf('subscriber') !== -1) ? true : false;
        },
        getBadges: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            var badges = [];
            if(tmi && tmi.tmiRoom.getLabels(user)) badges = tmi.tmiRoom.getLabels(user);
            if(bttv.chat.store.__subscriptions[user] && bttv.chat.store.__subscriptions[user].indexOf(bttv.getChannel()) !== -1) badges.push("subscriber");
            return badges;
        },
        getColor: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            return tmi ? tmi.tmiSession.getColor(user) : null;
        },
        getEmotes: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            var emotes = [];
            if(tmi && tmi.tmiRoom.getEmotes(user)) emotes = tmi.tmiRoom.getEmotes(user);
            if(bttv.chat.store.__subscriptions[user]) {
                bttv.chat.store.__subscriptions[user].forEach(function(channel) {
                    emotes.push(channel);
                });
            }
            return emotes;
        },
        getSpecials: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi();
            var specials = [];
            if(tmi && tmi.tmiSession && tmi.tmiSession._users) specials = tmi.tmiSession._users.getSpecials(user);
            if(bttv.chat.store.__subscriptions[user] && bttv.chat.store.__subscriptions[user].indexOf(bttv.getChannel()) !== -1) specials.push("subscriber");
            return specials;
        },
        scrollChat: function() {
            if($('.ember-chat .chat-interface .more-messages-indicator').length || !$('.ember-chat .chat-messages .chat-line').length) return;
            $('.ember-chat .chat-messages .tse-scroll-content')[0].scrollTop = $('.ember-chat .chat-messages .tse-scroll-content')[0].scrollHeight;
            var linesToDelete = $('.ember-chat .chat-messages .chat-line').length - bttv.settings.get("scrollbackAmount");

            if(linesToDelete > 0) {
                for(var i=0; i<linesToDelete; i++) {
                    $('.ember-chat .chat-messages .chat-line').eq(0).remove();
                }
            }
        },
        calculateColor: function(color) {
            var colorRegex = /^#[0-9a-f]+$/i;
            if(colorRegex.test(color)) {
                while (((calculateColorBackground(color) === "light" && bttv.settings.get("darkenedMode") === true) || (calculateColorBackground(color) === "dark" && bttv.settings.get("darkenedMode") !== true))) {
                    color = calculateColorReplacement(color, calculateColorBackground(color));
                }
            }

            return color;
        },
        assignBadges: function(badges, data) {
            data = data || {};
            var bttvBadges = [];

            if(badges && badges.length > 0) {
                if(badges.indexOf('staff') !== -1) {
                    bttvBadges.push({
                        type: (bttv.settings.get("showJTVTags") === true?'old':'')+'staff',
                        name: (bttv.settings.get("showJTVTags") === true?'Staff':''),
                        description: 'Twitch Staff'
                    });
                } else if(badges.indexOf('admin') !== -1) {
                    bttvBadges.push({
                        type: (bttv.settings.get("showJTVTags") === true?'old':'')+'admin',
                        name: (bttv.settings.get("showJTVTags") === true?'Admin':''),
                        description: 'Twitch Admin'
                    });
                } else if(badges.indexOf('owner') !== -1 && !data.bttvTagType) {
                    bttvBadges.push({
                        type: (bttv.settings.get("showJTVTags") === true?'old':'')+'broadcaster',
                        name: (bttv.settings.get("showJTVTags") === true?'Host':''),
                        description: 'Channel Broadcaster'
                    });
                } else if(badges.indexOf('mod') !== -1 && !data.bttvTagType) {
                    bttvBadges.push({
                        type: (bttv.settings.get("showJTVTags") === true?'oldmoderator':'moderator'),
                        name: (bttv.settings.get("showJTVTags") === true?'Mod':''),
                        description: 'Channel Moderator'
                    });
                }

                if(data.bttvTagType && data.bttvTagName) {
                    bttvBadges.unshift({
                        type: data.bttvTagType,
                        name: data.bttvTagName,
                        description: data.bttvTagDesc?data.bttvTagDesc:data.bttvTagName
                    });
                }

                if(badges.indexOf('turbo') !== -1) {
                    bttvBadges.push({
                        type: 'turbo',
                        name: '',
                        description: 'Twitch Turbo'
                    });
                }

                if(badges.indexOf('subscriber') !== -1) {
                    bttvBadges.push({
                        type: 'subscriber',
                        name: '',
                        description: 'Channel Subscriber'
                    });
                }
            }

            return bttvBadges;
        },
        ban: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi() || {};
            tmi = tmi.tmiRoom;
            return tmi ? tmi.banUser(user) : null;
        },
        timeout: function(user, time) {
            time = time || 600;
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi() || {};
            tmi = tmi.tmiRoom;
            return tmi ? tmi.timeoutUser(user+' '+time) : null;
        },
        unban: function(user) {
            if(!user || user === "") return false;
            var tmi = bttv.chat.tmi() || {};
            tmi = tmi.tmiRoom;
            return tmi ? tmi.unbanUser(user) : null;
        },
        massUnban: function() {
            if(vars.userData.isLoggedIn && vars.userData.login === bttv.getChannel()) {
                var bannedUsers = [];
                bttv.chat.helpers.serverMessage("Fetching banned users...");
                $.ajax({url: "/settings/channel", cache: !1, timeoutLength: 6E3, dataType: 'html'}).done(function (chatInfo) {
                    if(chatInfo) {
                        $(chatInfo).find("#banned_chatter_list .ban .obj").each(function() {
                            var user = $(this).text().trim();
                            if(bttv.chat.store.__unbannedUsers.indexOf(user) === -1 && bannedUsers.indexOf(user) === -1) bannedUsers.push(user);
                        });
                        if(bannedUsers.length > 0) {
                            bttv.chat.helpers.serverMessage("Fetched "+bannedUsers.length+" banned users.");
                            if(bannedUsers.length > 10) {
                                bttv.chat.helpers.serverMessage("Starting purge process in 5 seconds. Get ready for a spam fest!");
                            } else {
                                bttv.chat.helpers.serverMessage("Starting purge process in 5 seconds.");
                            }
                            bttv.chat.helpers.serverMessage("By my calculations, this block of users will take "+(bannedUsers.length*.333).toFixed(1)+" minutes to unban.");
                            if(bannedUsers.length > 70) bttv.chat.helpers.serverMessage("Twitch only provides up to 100 users at a time (some repeat), but this script will cycle through all of the blocks of users.");
                            setTimeout(function() {
                                var startTime = 0;
                                bannedUsers.forEach(function(user) {
                                    setTimeout(function() {
                                        bttv.chat.helpers.unban(user);
                                        bttv.chat.store.__unbannedUsers.push(user);
                                    }, startTime += 333);
                                });
                                setTimeout(function() {
                                    bttv.chat.helpers.serverMessage("This block of users has been purged. Checking for more..");
                                    bttv.chat.helpers.massUnban();
                                }, startTime += 333);
                            }, 5000);
                        } else {
                            bttv.chat.helpers.serverMessage("You have no banned users.");
                            bttv.chat.store.__unbannedUsers = [];
                        }
                    }
                });
            } else {
                bttv.chat.helpers.serverMessage("You're not the channel owner.");
            }
        },
        translate: function(element, sender, text) {
            var language = (window.cookie && window.cookie.get('language')) ? window.cookie.get('language') : 'en',
                query = 'http://translate.google.com/translate_a/t?client=bttv&sl=auto&tl='+language+'&ie=UTF-8&oe=UTF-8&q='+text,
                translate = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D\""+encodeURIComponent(query)+"\"&format=json&diagnostics=false&callback=?";

            $.ajax({
                url: translate,
                cache: !1,
                timeoutLength: 6E3,
                dataType: 'json',
                success: function (data) {
                    if(data.error) {
                        $(element).text("Translation Error");
                    } else {
                        var sentences = data.query.results.json.sentences;
                        if(sentences instanceof Array) {
                            var translation = "";
                            sentences.forEach(function(sentence) {
                                translation += sentence.trans;
                            });
                        } else {
                            var translation = sentences.trans;
                        }
                        var emoteSets = bttv.chat.helpers.getEmotes(sender) || [];
                        $(element).replaceWith(bttv.chat.templates.message(sender, translation, emoteSets));
                    }
                },
                error: function() {
                    $(element).text("Translation Error: Server Error");
                }
            });
        }
    },
    handlers: {
        countUnreadMessages: function() {
            var controller = bttv.getChatController(),
                channels = bttv.chat.store.getRooms(),
                unreadChannels = 0;

            channels.forEach(function(channel) {
                var channel = bttv.chat.store.getRoom(channel);
                if(channel.unread > 0) {
                    unreadChannels++;
                }
                try {
                    channel.emberRoom.set('unreadCount', channel.unread);
                } catch(e) {
                    debug.log('Error setting unread count! Ember controller for channel must be removed.');
                }
            });
            controller.set('notificationsCount', unreadChannels);
        },
        shiftQueue: function() {
            if(!bttv.chat.tmi() || !bttv.chat.tmi().get('id')) return;
            var id = bttv.chat.tmi().get('id');
            if(id !== bttv.chat.store.currentRoom) {
                $('.ember-chat .chat-messages .tse-content .chat-line').remove();
                bttv.chat.store.currentRoom = id;
                bttv.chat.store.__messageQueue = [];
                bttv.chat.store.getRoom(id).playQueue();
                bttv.chat.helpers.serverMessage('You switched to: '+bttv.chat.tmi().get('name').replace(/</g,"&lt;").replace(/>/g,"&gt;"));
            } else {
                if(bttv.chat.store.__messageQueue.length === 0) return;
                $('.ember-chat .chat-messages .tse-content .chat-lines').append(bttv.chat.store.__messageQueue.join(""));
                bttv.chat.store.__messageQueue = [];
            }
            bttv.chat.helpers.scrollChat();
        },
        moderationCard: function(user, $event) {
            var makeCard = require('./features/make-card');
            Twitch.api.get('/api/channels/'+user.toLowerCase()+'/ember').done(function(user) {
                makeCard(user, $event);
            }).fail(function() {
                makeCard({ name: user, display_name: user.capitalize() }, $event);
            });
        },
        labelsChanged: function(user) {
            if (bttv.settings.get("adminStaffAlert") === true) {
                var specials = bttv.chat.helpers.getSpecials(user);

                if(specials.indexOf('admin') !== -1) {
                    bttv.chat.helpers.notifyMessage('admin', user+" just joined! Watch out foo!");
                } else if(specials.indexOf('staff') !== -1) {
                    bttv.chat.helpers.notifyMessage('staff', user+" just joined! Watch out foo!");
                }
            }
        },
        clearChat: function(user) {
            var chat = bttv.chat;
            var trackTimeouts = chat.store.trackTimeouts;
            var helpers = chat.helpers;

            if(!user) {
                helpers.serverMessage("Chat was cleared by a moderator (Prevented by BetterTTV)");
            } else {
                if($('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"]').length === 0) return;
                if(bttv.settings.get("hideDeletedMessages") === true) {
                    $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"]').each(function () {
                        $(this).hide();
                        $('div.tipsy').remove();
                    });
                    setTimeout(function() {
                        $('.chat-line .mod-icons .bot, .chat-line .mod-icons .oldbot').each(function () {
                            $(this).parent().parent().find("span.message:contains('"+user.replace(/%/g, '_').replace(/[<>,]/g, '')+"')").each(function () {
                                $(this).parent().hide();
                            });
                        });
                    }, 3000);
                } else {
                    if(bttv.settings.get("showDeletedMessages") !== true) {
                        $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"] .message').each(function () {
                            $(this).html("<span style=\"color: #999\">&lt;message deleted&gt;</span>").off('click').on('click', function() {
                                var emoteSets = bttv.chat.helpers.getEmotes(user) || [];
                                $(this).replaceWith(bttv.chat.templates.message(user, decodeURIComponent($(this).data('raw')), emoteSets));
                            });
                        });
                    } else {
                        $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"] .message').each(function () {
                            $("a", this).each(function () {
                                var rawLink = "<span style=\"text-decoration: line-through;\">" + $(this).attr("href").replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</span>";
                                $(this).replaceWith(rawLink);
                            });
                            $(".emoticon", this).each(function () {
                                $(this).css("opacity","0.1");
                            });
                            $(this).html("<span style=\"color: #999\">" + $(this).html() + "</span>");
                        });
                    }
                    if(trackTimeouts[user]) {
                        trackTimeouts[user].count++;
                        $('#times_from_' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + "_" + trackTimeouts[user].timesID).each(function () {
                            $(this).text("(" + trackTimeouts[user].count + " times)");
                        });
                    } else {
                        trackTimeouts[user] = {
                            count: 1,
                            timesID: Math.floor(Math.random()*100001)
                        }
                        var displayName = helpers.lookupDisplayName(user);
                        helpers.serverMessage(displayName + ' has been timed out. <span id="times_from_' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + "_" + trackTimeouts[user].timesID + '"></span>');
                    }
                }
            }
        },
        onPrivmsg: function(channel, data) {
            if(!bttv.chat.store.getRoom(channel).active() && data.from && data.from !== 'jtv') {
                bttv.chat.store.getRoom(channel).queueMessage(data);
                return;
            }
            if(!data.message.length) return;
            if(!bttv.chat.tmi() || !bttv.chat.tmi().tmiRoom) return;
            try {
                bttv.chat.handlers.privmsg(channel, data);
            } catch(e) {
                if(bttv.chat.store.__reportedErrors.indexOf(e.message) !== -1) return;
                bttv.chat.store.__reportedErrors.push(e.message);
                console.log(e);
                var error = {
                    stack: e.stack,
                    message: e.message
                };
                $.get('//nightdev.com/betterttv/errors/?obj='+encodeURIComponent(JSON.stringify(error)));
                bttv.chat.helpers.serverMessage('BetterTTV encountered an error reading chat. The developer has been sent a log of this action. Please try clearing your cookies and cache.');
            }
        },
        privmsg: function(channel, data) {
            if(data.style && (data.style !== 'admin' && data.style !== 'action' && data.style !== 'notification')) return;

            if (bttv.chat.store.checkMods && data.style === "admin") {
                var modsRegex = /^The moderators of this room are:(.*)/,
                    mods = modsRegex.exec(data.message);
                if (mods) {
                    bttv.chat.store.checkMods = false;
                    mods = mods[1].trim().split(", ");
                    mods.push(channel);

                    var modList = bttv.chat.helpers.listMods();

                    mods.forEach(function (mod) {
                        if(!modList[mod]) {
                            bttv.chat.helpers.addMod(mod);
                            debug.log("Added "+mod+" as a mod");
                        }
                    });
                    // Admins and staff get demodded, but this may cause issues?
                    /*for (mod in modList) {
                        if(modList.hasOwnProperty(mod)) {
                            if(mods.indexOf(mod) === -1 && !bttv.chat.helpers.isAdmin[mod] && !bttv.chat.helpers.isStaff[mod]) {
                                bttv.chat.helpers.removeMod(mod)
                                debug.log("Removed "+mod+" as a mod");
                            }
                        }
                    }*/
                    return;
                }
            }/* else if(info.sender === "jtv") {
                var modsRegex = /^The moderators of this room are:/,
                    mods = info.message.match(modsRegex);
                if (mods) {
                    bttv.chat.store.checkMods = true;
                }
            }*/

            if(data.style === 'admin' || data.style === 'notification') {
                data.style = 'admin';
                var message = bttv.chat.templates.privmsg(
                    messageHighlighted,
                    data.style === 'action' ? true : false,
                    data.style === 'admin' ? true : false,
                    vars.userData.isLoggedIn ? bttv.chat.helpers.isModerator(vars.userData.login) : false,
                    {
                        message: data.message,
                        time: data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
                        nickname: data.from || 'jtv',
                        sender: data.from,
                        badges: data.badges || (data.from==='twitchnotify'?[{
                            type: 'subscriber',
                            name: '',
                            description: 'Channel Subscriber'
                        }]:[]),
                        color: '#555',
                        emoteSets: []
                    }
                );

                $('.ember-chat .chat-messages .tse-content .chat-lines').append(message);
                bttv.chat.helpers.scrollChat();
                return;
            }

            if(!bttv.chat.store.chatters[data.from]) bttv.chat.store.chatters[data.from] = true;

            if(vars.localSubsOnly && !bttv.chat.helpers.isModerator(data.from) && !bttv.chat.helpers.isSubscriber(data.from)) return;

            if(bttv.chat.store.trackTimeouts[data.from]) delete bttv.chat.store.trackTimeouts[data.from];

            var messageHighlighted = false,
                highlightKeywords = [],
                highlightUsers = [],
                blacklistKeywords = [],
                blacklistUsers = [];

            if(bttv.settings.get("blacklistKeywords")) {
                var keywords = bttv.settings.get("blacklistKeywords");
                var phraseRegex = /\{.+?\}/g;
                var testCases =  keywords.match(phraseRegex);
                if(testCases) {
                    for (var i=0;i<testCases.length;i++) {
                        var testCase = testCases[i];
                        keywords = keywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
                        blacklistKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
                    }
                }
                if(keywords !== "") {
                    keywords = keywords.split(" ");
                    keywords.forEach(function (keyword) {
                        if(/^\([a-z0-9_\-\*]+\)$/i.test(keyword)) {
                            blacklistUsers.push(keyword.replace(/(\(|\))/g, ''));
                        } else {
                            blacklistKeywords.push(keyword);
                        }
                    });
                }

                var filtered = false;
                blacklistKeywords.forEach(function (keyword) {
                    keyword = escapeRegExp(keyword).replace(/\*/g, "[^ ]*");
                    var blacklistRegex = new RegExp(keyword, 'i');
                    if (blacklistRegex.test(data.message) && vars.userData.login !== data.from) {
                        filtered = true;
                    }
                });

                blacklistUsers.forEach(function (user) {
                    user = escapeRegExp(user).replace(/\*/g, "[^ ]*");
                    var nickRegex = new RegExp('^' + user + '$', 'i');
                    if (nickRegex.test(data.from)) {
                        filtered = true;
                    }
                });

                if(filtered) return;
            }

            if(bttv.settings.get("highlightKeywords")) {
                var extraKeywords = bttv.settings.get("highlightKeywords");
                var phraseRegex = /\{.+?\}/g;
                var testCases =  extraKeywords.match(phraseRegex);
                if(testCases) {
                    for (var i=0;i<testCases.length;i++) {
                        var testCase = testCases[i];
                        extraKeywords = extraKeywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
                        highlightKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
                    }
                }
                if(extraKeywords !== "") {
                    extraKeywords = extraKeywords.split(" ");
                    extraKeywords.forEach(function (keyword) {
                        if(/^\([a-z0-9_\-\*]+\)$/i.test(keyword)) {
                            highlightUsers.push(keyword.replace(/(\(|\))/g, ''));
                        } else {
                            highlightKeywords.push(keyword);
                        }
                    });
                }

                highlightKeywords.forEach(function (keyword) {
                    keyword = escapeRegExp(keyword).replace(/\*/g, "[^ ]*");
                    var wordRegex = new RegExp('(\\s|^|@)' + keyword + '([!.,:\';?/]|\\s|$)', 'i');
                    if (vars.userData.isLoggedIn && vars.userData.login !== data.from && wordRegex.test(data.message)) {
                        messageHighlighted = true;
                        if(bttv.settings.get("desktopNotifications") === true && bttv.chat.store.activeView === false) {
                            bttv.notify("You were mentioned in "+bttv.chat.helpers.lookupDisplayName(bttv.getChannel())+"'s channel.");
                            highlightFeedback();
                        }
                    }
                });

                highlightUsers.forEach(function (user) {
                    user = escapeRegExp(user).replace(/\*/g, "[^ ]*");
                    var nickRegex = new RegExp('^' + user + '$', 'i');
                    if (nickRegex.test(data.from)) {
                        messageHighlighted = true;
                    }
                });
            }

            if(bttv.settings.get('embeddedPolling')) {
                if(bttv.chat.helpers.isOwner(data.from)) {
                    var strawpoll = /http:\/\/strawpoll\.me\/([0-9]+)/g.exec(data.message);
                    if(strawpoll) {
                        embeddedPolling(strawpoll[1]);
                    }
                }
            }

            //Bots
            var bots = ["nightbot","moobot","sourbot","xanbot","manabot","mtgbot","ackbot","baconrobot","tardisbot","deejbot","valuebot","stahpbot"];
            if(bots.indexOf(data.from) !== -1 && bttv.chat.helpers.isModerator(data.from)) { data.bttvTagType="bot"; data.bttvTagName = "Bot"; }

            if (bttv.settings.get("showJTVTags") === true) {
                if (data.bttvTagType == "moderator" || data.bttvTagType == "broadcaster" || data.bttvTagType == "admin" || data.bttvTagType == "staff" || data.bttvTagType === "bot") data.bttvTagType = 'old'+data.bttvTagType;
            }

            data.color = bttv.chat.helpers.getColor(data.from);

            if(data.color === "black") data.color = "#000000";
            if(data.color === "MidnightBlue") data.color = "#191971";
            if(data.color === "DarkRed") data.color = "#8B0000";

            data.color = bttv.chat.helpers.calculateColor(data.color);

            if (bttv.glow && bttv.glow[data.from] && data.style !== 'action') {
                var rgbColor = (data.color === "#ffffff" ? getRgb("#000000") : getRgb(data.color));
                if(bttv.settings.get("darkenedMode") === true) data.color = data.color+"; text-shadow: 0 0 20px rgba("+rgbColor.r+","+rgbColor.g+","+rgbColor.b+",0.8)";
            }

            if (vars.blackChat && data.color === "#000000") {
                data.color = "#ffffff";
            }

            var specialUsers = {
                "night": { dev: true, tagType: "bttvDeveloper" },
                "dtittel": { dev: true, tagType: "bttvDeveloper" },
                "vendethiel": { dev: true, tagType: "bttvDeveloper" },
                "matthewjk": { dev: true, tagType: "bttvDeveloper" },
                "teak42": { dev: true, tagType: "bttvDeveloper" },
                "julia_cs": { supporter: true, team: "Design", tagType: "bttvSupporter" },
                "vaughnwhiskey": { supporter: true, team: "Support", tagType: "bttvSupporter" },
                "izl": { supporter: true, team: "Support", tagType: "bttvSupporter" },
            }

            var legacyTags = require('./legacy-tags')(data);

            if(legacyTags[data.from] && ((legacyTags[data.from].mod === true && bttv.chat.helpers.isModerator(data.from)) || legacyTags[data.from].mod === false)) {
                var userData = legacyTags[data.from];
                if(userData.tagType) data.bttvTagType = (["moderator","broadcaster","admin","staff","bot"].indexOf(userData.tagType) !== -1) ? 'old'+userData.tagType : userData.tagType;
                if(userData.tagName) data.bttvTagName = userData.tagName;
                if(userData.color && data.style !== 'action') data.color = userData.color;
                if(userData.nickname) data.bttvDisplayName = userData.nickname;
                data.bttvTagDesc = "Grandfathered BetterTTV Swag Tag";
            }

            var badges = bttv.chat.helpers.getBadges(data.from);
            var bttvBadges = bttv.chat.helpers.assignBadges(badges, data);

            if(specialUsers[data.from]) {
                var userData = specialUsers[data.from];
                bttvBadges.push({
                    type: userData.tagType,
                    name: "&#8203;",
                    description: userData.dev ? 'BetterTTV Developer':'BetterTTV '+userData.team+' Team'
                });
            }

            data.emoteSets = bttv.chat.helpers.getEmotes(data.from) || [];
            data.sender = data.from;

            if(data.bttvDisplayName) {
                bttv.chat.helpers.lookupDisplayName(data.from);
                data.from = data.bttvDisplayName;
            } else {
                data.from = bttv.chat.helpers.lookupDisplayName(data.from);
            }

            var message = bttv.chat.templates.privmsg(
                messageHighlighted,
                data.style === 'action' ? true : false,
                data.style === 'admin' ? true : false,
                vars.userData.isLoggedIn ? (bttv.chat.helpers.isModerator(vars.userData.login) && (!bttv.chat.helpers.isModerator(data.sender) || (vars.userData.login === channel && vars.userData.login !== data.sender))) : false,
                {
                    message: data.message,
                    time: data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
                    nickname: data.from,
                    sender: data.sender,
                    badges: bttvBadges,
                    color: data.color,
                    emoteSets: data.emoteSets
                }
            );

            bttv.chat.store.__messageQueue.push(message);
        }
    },
    store: {
        __rooms: {},
        __messageTimer: false,
        __messageQueue: [],
        __usersBeingLookedUp: 0,
        __reportedErrors: [],
        __subscriptions: {},
        __unbannedUsers: [],
        getRooms: function() {
            return Object.keys(bttv.chat.store.__rooms);
        },
        getRoom: function(name) {
            if(!bttv.chat.store.__rooms[name]) {
                bttv.chat.store.newRoom(name);
                if(bttv.chat.tmi().tmiRoom) {
                    delete bttv.chat.tmi().tmiRoom._events['message'];
                    delete bttv.chat.tmi().tmiRoom._events['clearchat'];
                    bttv.chat.tmi().tmiRoom.on('message', bttv.chat.store.getRoom(name).chatHandler);
                    bttv.chat.tmi().tmiRoom.on('clearchat', bttv.chat.handlers.clearChat);
                }
            }
            return bttv.chat.store.__rooms[name];
        },
        newRoom: function(name) {
            var emberRoom = null;
            var groupRooms = bttv.getChatController().get('connectedPrivateGroupRooms');
            var channelRoom = bttv.getChatController().get('currentChannelRoom');
            if(channelRoom.get('id') === name) {
                emberRoom = channelRoom;
            } else {
                for(var i=0; i<groupRooms.length; i++) {
                    if(groupRooms[i].get('id') === name) {
                        emberRoom = groupRooms[i];
                        break;
                    }
                }
            }
            bttv.chat.store.__rooms[name] = {
                name: name,
                unread: 0,
                emberRoom: emberRoom,
                active: function() { return (bttv.getChatController() && bttv.getChatController().currentRoom.get('id') === name) ? true : false; },
                messages: [],
                playQueue: function() {
                    bttv.chat.store.__rooms[name].unread = 0;
                    bttv.chat.handlers.countUnreadMessages();
                    for(var i=0; i<bttv.chat.store.__rooms[name].messages.length; i++) {
                        var message = bttv.chat.store.__rooms[name].messages[i];
                        bttv.chat.handlers.onPrivmsg(name, message);
                    }
                },
                queueMessage: function(message) {
                    if(bttv.chat.store.__rooms[name].messages.length > bttv.settings.get("scrollbackAmount")) bttv.chat.store.__rooms[name].messages.shift();
                    bttv.chat.store.__rooms[name].messages.push(message);
                },
                chatHandler: function(data) {
                    if(data.from && data.from !== 'jtv') bttv.chat.store.getRoom(name).queueMessage(data);
                    if(bttv.chat.store.getRoom(name).active()) {
                        bttv.chat.handlers.onPrivmsg(name, data);
                    } else {
                        bttv.chat.store.__rooms[name].unread++;
                        bttv.chat.handlers.countUnreadMessages();
                    }
                }
            }
        },
        currentRoom: '',
        activeView: true,
        displayNames: {},
        trackTimeouts: {},
        chatters: {},
        chatHistory: [],
        autoCompleteEmotes: {}
    }
}

// Helper Functions
var removeElement = require('./element').remove,
    escapeRegExp = function (text) {
        // Escapes an input to make it usable for regexes
        return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&");
    },
    calculateColorBackground = function (color) {
        // Converts HEX to YIQ to judge what color background the color would look best on
        color = String(color).replace(/[^0-9a-f]/gi, '');
        if (color.length < 6) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }

        var r = parseInt(color.substr(0, 2), 16);
        var g = parseInt(color.substr(2, 2), 16);
        var b = parseInt(color.substr(4, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? "dark" : "light";
    },
    calculateColorReplacement = function (color, background) {
        // Modified from http://www.sitepoint.com/javascript-generate-lighter-darker-color/
        // Modified further to use HSL as an intermediate format, to avoid hue-shifting
        // toward primaries when darkening and toward secondaries when lightening
        var rgb, hsl, light = (background === 'light'), factor = (light ? 0.1 : -0.1), r, g, b, l;

        color = String(color).replace(/[^0-9a-f]/gi, '');
        if (color.length < 6) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }

        r = parseInt(color.substr(0, 2), 16);
        g = parseInt(color.substr(2, 2), 16);
        b = parseInt(color.substr(4, 2), 16);
        hsl = rgbToHsl(r, g, b);

        // more thoroughly lightens dark colors, with no problems at black
        l = (light ? 1 - (1 - factor) * (1 - hsl[2]) : (1 + factor) * hsl[2]);
        l = Math.min(Math.max(0, l), 1);

        rgb = hslToRgb(hsl[0], hsl[1], l);
        r = rgb[0].toString(16);
        g = rgb[1].toString(16);
        b = rgb[2].toString(16);

        // note to self: .toString(16) does NOT zero-pad
        return '#' + ('00' + r).substr(r.length) +
                     ('00' + g).substr(g.length) +
                     ('00' + b).substr(b.length);
    },
    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from https://en.wikipedia.org/wiki/HSL_color_space
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSL representation
     */
    rgbToHsl = function (r, g, b) {
        // Convert RGB to HSL, not ideal but it's faster than HCL or full YIQ conversion
        // based on http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s,
            l = Math.min(Math.max(0, (max + min) / 2), 1),
            d = Math.min(Math.max(0, max - min), 1);

        if (d === 0) {
            h = s = d; // achromatic
        } else {
            s = l > 0.5 ? d / (2 * (1 - l)) : d / (2 * l);
            s = Math.min(Math.max(0, s), 1);
            switch (max) {
                case r: h = Math.min(Math.max(0, (g - b) / d + (g < b ? 6 : 0)), 6); break;
                case g: h = Math.min(Math.max(0, (b - r) / d + 2), 6); break;
                case b: h = Math.min(Math.max(0, (r - g) / d + 4), 6); break;
            }
            h /= 6;
        }
        return [h, s, l];
    },
    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from https://en.wikipedia.org/wiki/HSL_color_space
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set of integers [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  l       The lightness
     * @return  Array           The RGB representation
     */
    hslToRgb = function (h, s, l) {
        // Convert HSL to RGB, again based on http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
        var r, g, b, hueToRgb, q, p;

        if (s === 0) {
            r = g = b = Math.round(Math.min(Math.max(0, 255 * l), 255)); // achromatic
        } else {
            hueToRgb = function (p, q, t) {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1 / 6) return p + (q - p) * 6 * t;
                if(t < 1 / 2) return q;
                if(t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            p = 2 * l - q;
            r = Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h + 1 / 3)), 255));
            g = Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h)), 255));
            b = Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h - 1 / 3)), 255));
        }
        return [r, g, b];
    },
    getRgb = function(color) {
        // Convert HEX to RGB
        var regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return regex ? {
            r: parseInt(regex[1], 16),
            g: parseInt(regex[2], 16),
            b: parseInt(regex[3], 16)
        } : {
            r: 0,
            g: 0,
            b: 0
        };
    },
    getHex = function(color) {
        // Convert RGB object to HEX String
        var convert = function(c) {
            return ("0" + parseInt(c).toString(16)).slice(-2);
        }
        return '#'+convert(color['r'])+convert(color['g'])+convert(color['b']);
    };

/**
 * Function from Ryan Chatham's Twitch Chat Emotes
 * Gets the usable emote text from a regex.
 * @attribute http://userscripts.org/scripts/show/160183 (adaption)
 */
var getEmoteFromRegEx = function(regex) {
    return decodeURI(regex.source)
        .replace('&gt\\;', '>') // right angle bracket
        .replace('&lt\\;', '<') // left angle bracket
        .replace(/\(\?![^)]*\)/g, '') // remove negative group
        .replace(/\(([^|])*\|?[^)]*\)/g, '$1') // pick first option from a group
        .replace(/\[([^|])*\|?[^\]]*\]/g, '$1') // pick first character from a character group
        .replace(/[^\\]\?/g, '') // remove optional chars
        .replace(/^\\b|\\b$/g, '') // remove boundaries
        .replace(/\\/g, ''); // unescape
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var clearClutter = require('./features/clear-clutter'),
    channelReformat = require('./features/channel-reformat'),
    brand = require('./features/brand'),
    betaChat = require('./features/beta-chat'),
    checkMessages = require('./features/check-messages'),
    directoryFunctions = require('./features/directory-functions'),
    checkFollowing = require('./features/check-following'),
    checkBroadcastInfo = require('./features/check-broadcast-info'),
    overrideEmotes = require('./features/override-emotes'),
    handleBackground = require('./features/handle-background'),
    darkenPage = require('./features/darken-page'),
    splitChat = require('./features/split-chat'),
    flipDashboard = require('./features/flip-dashboard'),
    formatDashboard = require('./features/format-dashboard'),
    dashboardChannelInfo = require('./features/dashboard-channelinfo'),
    giveawayCompatibility = require('./features/giveaway-compatibility'),
    highlightFeedback = require('./features/highlight-feedback'),
    embeddedPolling = require('./features/embedded-polling'),
    handleTwitchChatEmotesScript = require('./features/handle-twitchchat-emotes'),
    loadChatSettings = require('./features/chat-load-settings'),
    createSettings = require('./features/create-settings');
    cssLoader = require('./features/css-loader');

var chatFunctions = function () {

    debug.log("Modifying Chat Functionality");

    if(bttv.getChatController() && bttv.getChannel()) {
        bttv.chat.takeover();
    }

    return;

    // TODO: Report Chat Errors to DB
    // TODO: Report Chat DCs/Failed Joins to TwitchStatus

    /*
    CurrentChat.chat_say = function() {
        try {
            vars.chat_say();
        } catch(e) {
            console.log(e);
            var error = {
                stack: e.stack,
                message: e.message
            }
            $.get('//nightdev.com/betterttv/errors/?obj='+encodeURIComponent(JSON.stringify(error)));
            CurrentChat.admin_message('BetterTTV encountered an error sending your chat. You can try refreshing to fix the problem. The developer has been sent a log of this action.');
        }
    }

    if(!vars.CurrentChat.say) vars.CurrentChat.say = CurrentChat.say;
    CurrentChat.linesInPast30s = 0;
    CurrentChat.say = function(e, t) {
        debug.log("Attempting to send chat: "+e);
        if(CurrentChat.linesInPast30s >= 17) {
            CurrentChat.admin_message("BetterTTV: To prevent a Twitch global chat ban, outgoing commands/messages are blocked for "+(31-(Math.round(Date.now()/1000)-CurrentChat.linesInPast30sTime))+" more seconds.");
            return;
        } else if(CurrentChat.linesInPast30s === 0) {
            CurrentChat.linesInPast30sTime = Math.round(Date.now()/1000);
            setTimeout(function(){ if(window.CurrentChat) CurrentChat.linesInPast30s = 0; }, 31000);
        }
        if(Twitch.user.login() && Twitch.user.login() in CurrentChat.moderators) {
            debug.log("Sending chat: "+e);
            vars.CurrentChat.say.call(CurrentChat, e, t);
            CurrentChat.linesInPast30s++;
        } else {
            var currentTime = Date.now();
            if(CurrentChat.lastSpokenTime && currentTime-CurrentChat.lastSpokenTime < 2100) {
                var spamDifference = 2100-(currentTime-CurrentChat.lastSpokenTime);
                setTimeout(function() {
                    if(!window.CurrentChat) return;
                    debug.log("Sending chat: "+e);
                    vars.CurrentChat.say.call(CurrentChat, e, t);
                }, spamDifference);
                CurrentChat.lastSpokenTime = currentTime+spamDifference;
            } else {
                debug.log("Sending chat: "+e);
                vars.CurrentChat.say.call(CurrentChat, e, t);
                CurrentChat.lastSpokenTime = currentTime;
            }
        }
    }
    */

    // $.getJSON("http://twitchstatus.com/api/report?type=chat&kind=disconnect&server=" + /^Connection lost to \(((.*):(80|443|6667))\)/.exec(a.message)[1]);
    // $.getJSON("http://twitchstatus.com/api/report?type=chat&kind=join&server=" + CurrentChat.currentServer);
}

var handleLookupServer = function() {
    var socketJSInject = document.createElement("script");
    socketJSInject.setAttribute("src", "//cdn.betterttv.net/js/sock.js?"+bttv.info.versionString());
    socketJSInject.setAttribute("type", "text/javascript");
    $("head").append(socketJSInject);
}

var checkJquery = function(times) {
    times = times || 0;
    if(times > 9) return;
    if(typeof (window.jQuery) === 'undefined') {
        debug.log("jQuery is undefined.");
        setTimeout(function() { checkJquery(times+1); }, 1000);
        return;
    } else {
        var $ = window.jQuery;
        bttv.jQuery = $;
        main();
    }
}

var main = function () {
    if(window.Ember) {
        var renderingCounter = 0;

        var waitForLoad = function(callback, count) {
            var count = count || 0;
            if(count > 5) {
                callback(false);
            }
            setTimeout(function() {
                if(renderingCounter === 0) {
                    callback(true);
                } else {
                    waitForLoad(callback, ++count);
                }
            }, 1000);
        }

        Ember.subscribe('render', {
            before: function() {
                renderingCounter++;
            },
            after: function(name, ts, payload) {
                renderingCounter--;

                if(!payload.template) return;
                //debug.log(payload.template);

                if(App.__container__.lookup("controller:application").get("currentRouteName") !== "channel.index") {
                    $('#main_col').css('width', 'auto');
                }

                switch(payload.template) {
                    case 'shared/right_column':
                        waitForLoad(function(ready) {
                            if(ready) {
                                bttv.chat.store.isLoaded = false;
                                betaChat();
                                chatFunctions();
                                if(bttv.socketServer) {
                                    bttv.socketServer.emit("join channel", { channel: ((bttv.getChannel()) ? bttv.getChannel() : null) })
                                }
                            }
                        });
                        break;
                    case 'channel/index':
                        waitForLoad(function(ready) {
                            if(ready) {
                                handleBackground();
                                clearClutter();
                                channelReformat();
                                $(window).trigger('resize');
                            }
                        });
                        break;
                    case 'channel/profile':
                        waitForLoad(function(ready) {
                            if(ready) {
                                vars.emotesLoaded = false;
                                betaChat();
                                chatFunctions();
                                channelReformat();
                                $(window).trigger('resize');
                            }
                        });
                        break;
                    case 'directory/following':
                        waitForLoad(function(ready) {
                            if(ready) {
                                directoryFunctions();
                            }
                        });
                        break;
                }
            }
        });
    }

    handleLookupServer();

    $(document).ready(function () {
        createSettings();
        bttv.settings.load();

        debug.log("BTTV v" + bttv.info.versionString());
        debug.log("CALL init " + document.URL);

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

        $(window).trigger('resize');
        setTimeout(function() {
            channelReformat();
            vars.userData.isLoggedIn = Twitch.user.isLoggedIn();
            vars.userData.login = Twitch.user.login();
            $(window).trigger('resize');
        }, 3000);
        setTimeout(chatFunctions, 3000);
        setTimeout(directoryFunctions, 3000);

        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-39733925-4', 'betterttv.net');
        ga('send', 'pageview');

        (function(b){b.gritter={};b.gritter.options={position:"top-left",class_name:"",fade_in_speed:"medium",fade_out_speed:1000,time:6000};b.gritter.add=function(f){try{return a.add(f||{})}catch(d){var c="Gritter Error: "+d;(typeof(console)!="undefined"&&console.error)?console.error(c,f):alert(c)}};b.gritter.remove=function(d,c){a.removeSpecific(d,c||{})};b.gritter.removeAll=function(c){a.stop(c||{})};var a={position:"",fade_in_speed:"",fade_out_speed:"",time:"",_custom_timer:0,_item_count:0,_is_setup:0,_tpl_close:'<div class="gritter-close"></div>',_tpl_title:'<span class="gritter-title">[[title]]</span>',_tpl_item:'<div id="gritter-item-[[number]]" class="gritter-item-wrapper [[item_class]]" style="display:none"><div class="gritter-top"></div><div class="gritter-item">[[close]][[image]]<div class="[[class_name]]">[[title]]<p>[[text]]</p></div><div style="clear:both"></div></div><div class="gritter-bottom"></div></div>',_tpl_wrap:'<div id="gritter-notice-wrapper"></div>',add:function(g){if(typeof(g)=="string"){g={text:g}}if(!g.text){throw'You must supply "text" parameter.'}if(!this._is_setup){this._runSetup()}var k=g.title,n=g.text,e=g.image||"",l=g.sticky||false,m=g.class_name||b.gritter.options.class_name,j=b.gritter.options.position,d=g.time||"";this._verifyWrapper();this._item_count++;var f=this._item_count,i=this._tpl_item;b(["before_open","after_open","before_close","after_close"]).each(function(p,q){a["_"+q+"_"+f]=(b.isFunction(g[q]))?g[q]:function(){}});this._custom_timer=0;if(d){this._custom_timer=d}var c=(e!="")?'<img src="'+e+'" class="gritter-image" />':"",h=(e!="")?"gritter-with-image":"gritter-without-image";if(k){k=this._str_replace("[[title]]",k,this._tpl_title)}else{k=""}i=this._str_replace(["[[title]]","[[text]]","[[close]]","[[image]]","[[number]]","[[class_name]]","[[item_class]]"],[k,n,this._tpl_close,c,this._item_count,h,m],i);if(this["_before_open_"+f]()===false){return false}b("#gritter-notice-wrapper").addClass(j).append(i);var o=b("#gritter-item-"+this._item_count);o.fadeIn(this.fade_in_speed,function(){a["_after_open_"+f](b(this))});if(!l){this._setFadeTimer(o,f)}b(o).bind("mouseenter mouseleave",function(p){if(p.type=="mouseenter"){if(!l){a._restoreItemIfFading(b(this),f)}}else{if(!l){a._setFadeTimer(b(this),f)}}a._hoverState(b(this),p.type)});b(o).find(".gritter-close").click(function(){a.removeSpecific(f,{},null,true)});return f},_countRemoveWrapper:function(c,d,f){d.remove();this["_after_close_"+c](d,f);if(b(".gritter-item-wrapper").length==0){b("#gritter-notice-wrapper").remove()}},_fade:function(g,d,j,f){var j=j||{},i=(typeof(j.fade)!="undefined")?j.fade:true,c=j.speed||this.fade_out_speed,h=f;this["_before_close_"+d](g,h);if(f){g.unbind("mouseenter mouseleave")}if(i){g.animate({opacity:0},c,function(){g.animate({height:0},300,function(){a._countRemoveWrapper(d,g,h)})})}else{this._countRemoveWrapper(d,g)}},_hoverState:function(d,c){if(c=="mouseenter"){d.addClass("hover");d.find(".gritter-close").show()}else{d.removeClass("hover");d.find(".gritter-close").hide()}},removeSpecific:function(c,g,f,d){if(!f){var f=b("#gritter-item-"+c)}this._fade(f,c,g||{},d)},_restoreItemIfFading:function(d,c){clearTimeout(this["_int_id_"+c]);d.stop().css({opacity:"",height:""})},_runSetup:function(){for(opt in b.gritter.options){this[opt]=b.gritter.options[opt]}this._is_setup=1},_setFadeTimer:function(f,d){var c=(this._custom_timer)?this._custom_timer:this.time;this["_int_id_"+d]=setTimeout(function(){a._fade(f,d)},c)},stop:function(e){var c=(b.isFunction(e.before_close))?e.before_close:function(){};var f=(b.isFunction(e.after_close))?e.after_close:function(){};var d=b("#gritter-notice-wrapper");c(d);d.fadeOut(function(){b(this).remove();f()})},_str_replace:function(v,e,o,n){var k=0,h=0,t="",m="",g=0,q=0,l=[].concat(v),c=[].concat(e),u=o,d=c instanceof Array,p=u instanceof Array;u=[].concat(u);if(n){this.window[n]=0}for(k=0,g=u.length;k<g;k++){if(u[k]===""){continue}for(h=0,q=l.length;h<q;h++){t=u[k]+"";m=d?(c[h]!==undefined?c[h]:""):c[0];u[k]=(t).split(l[h]).join(m);if(n&&u[k]!==t){this.window[n]+=(t.length-u[k].length)/l[h].length}}}return p?u:u[0]},_verifyWrapper:function(){if(b("#gritter-notice-wrapper").length==0){b("body").append(this._tpl_wrap)}}}})($);
        bttv.saveAs=bttv.saveAs||typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(e){"use strict";var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=e.URL||e.webkitURL||e,i=t.createElementNS("http://www.w3.org/1999/xhtml","a"),s=!e.externalHost&&"download"in i,o=function(n){var r=t.createEvent("MouseEvents");r.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);n.dispatchEvent(r)},u=e.webkitRequestFileSystem,a=e.requestFileSystem||u||e.mozRequestFileSystem,f=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},l="application/octet-stream",c=0,h=[],p=function(){var e=h.length;while(e--){var t=h[e];if(typeof t==="string"){r.revokeObjectURL(t)}else{t.remove()}}h.length=0},d=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var i=e["on"+t[r]];if(typeof i==="function"){try{i.call(e,n||e)}catch(s){f(s)}}}},v=function(r,o){var f=this,p=r.type,v=false,m,g,y=function(){var e=n().createObjectURL(r);h.push(e);return e},b=function(){d(f,"writestart progress write writeend".split(" "))},w=function(){if(v||!m){m=y(r)}if(g){g.location.href=m}else{window.open(m,"_blank")}f.readyState=f.DONE;b()},E=function(e){return function(){if(f.readyState!==f.DONE){return e.apply(this,arguments)}}},S={create:true,exclusive:false},x;f.readyState=f.INIT;if(!o){o="download"}if(s){m=y(r);t=e.document;i=t.createElementNS("http://www.w3.org/1999/xhtml","a");i.href=m;i.download=o;var T=t.createEvent("MouseEvents");T.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);i.dispatchEvent(T);f.readyState=f.DONE;b();return}if(e.chrome&&p&&p!==l){x=r.slice||r.webkitSlice;r=x.call(r,0,r.size,l);v=true}if(u&&o!=="download"){o+=".download"}if(p===l||u){g=e}if(!a){w();return}c+=r.size;a(e.TEMPORARY,c,E(function(e){e.root.getDirectory("saved",S,E(function(e){var t=function(){e.getFile(o,S,E(function(e){e.createWriter(E(function(t){t.onwriteend=function(t){g.location.href=e.toURL();h.push(e);f.readyState=f.DONE;d(f,"writeend",t)};t.onerror=function(){var e=t.error;if(e.code!==e.ABORT_ERR){w()}};"writestart progress write abort".split(" ").forEach(function(e){t["on"+e]=f["on"+e]});t.write(r);f.abort=function(){t.abort();f.readyState=f.DONE};f.readyState=f.WRITING}),w)}),w)};e.getFile(o,{create:false},E(function(e){e.remove();t()}),E(function(e){if(e.code===e.NOT_FOUND_ERR){t()}else{w()}}))}),w)}),w)},m=v.prototype,g=function(e,t){return new v(e,t)};m.abort=function(){var e=this;e.readyState=e.DONE;d(e,"abort")};m.readyState=m.INIT=0;m.WRITING=1;m.DONE=2;m.error=m.onwritestart=m.onprogress=m.onwrite=m.onabort=m.onerror=m.onwriteend=null;e.addEventListener("unload",p,false);return g}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined")module.exports=bttv.saveAs;
        (function(e){e.fn.drags=function(t){t=e.extend({handle:"",cursor:"move",el:""},t);if(t.handle===""){var n=this}else{var n=this.find(t.handle)}return n.css("cursor",t.cursor).on("mousedown",function(n){if(t.handle===""){var r=e(this).addClass("bttv-draggable")}else{if(t.el===""){var r=e(this).addClass("active-handle").parent().addClass("bttv-draggable")}else{e(this).addClass("active-handle");var r=e(t.el).addClass("bttv-draggable")}}var i=r.css("z-index"),s=r.outerHeight(),o=r.outerWidth(),u=r.offset().top+s-n.pageY,a=r.offset().left+o-n.pageX;r.css("z-index",1e3).parents().on("mousemove",function(t){e(".bttv-draggable").offset({top:t.pageY+u-s,left:t.pageX+a-o}).on("mouseup",function(){e(this).removeClass("bttv-draggable").css("z-index",i)})});n.preventDefault()}).on("mouseup",function(){if(t.handle===""){e(this).removeClass("bttv-draggable")}else{e(this).removeClass("active-handle");e(t.el).removeClass("bttv-draggable")}})}})(jQuery);            (function(e){e.fn.konami=function(t){var n=[];var r={left:37,up:38,right:39,down:40,a:65,b:66};var i=e.extend({code:["up","up","down","down","left","right","left","right","b","a"],callback:function(){}},t);var s=i.code;var o=[];$.each(s,function(e){if(s[e]!==undefined&&r[s[e]]!==undefined){o.push(r[s[e]])}else if(s[e]!==undefined&&typeof s[e]=="number"){o.push(s[e])}});$(document).keyup(function(e){var t=e.keyCode?e.keyCode:e.charCode;n.push(t);if(n.toString().indexOf(o)>=0){n=[];i.callback($(this))}})}})($);
        $(window).konami({callback:function(){
            $("#bttvSettingsPanel .konami").each(function(){$(this).show()});
        }});
    });
}

if(document.URL.indexOf("receiver.html") !== -1 || document.URL.indexOf("cbs_ad_local.html") !== -1) {
    debug.log("HTML file called by Twitch.");
    return;
}

if(location.pathname.match(/^\/(.*)\/popout/)) {
    debug.log("Popout player detected.");
    return;
}

if(!window.Twitch) {
    debug.log("window.Twitch not detected.");
    return;
}

if(!window.localStorage) {
    debug.log("window.localStorage not detected.");
    return;
} else {
    var works = false;

    try {
        window.localStorage.setItem('bttv_test', 'it works!');
        window.localStorage.removeItem('bttv_test');
        works = true;
    } catch(e) {
        debug.log("window.localStorage detected, but unable to save.");
    }

    if(!works) return;
}

if(window.BTTVLOADED === true) return;
debug.log("BTTV LOADED " + document.URL);
BTTVLOADED = true;
checkJquery();
