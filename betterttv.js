/** @license
 * Copyright (c) 2014 NightDev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without limitation of the rights to use, copy, modify, merge,
 * and/or publish copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice, any copyright notices herein, and this permission
 * notice shall be included in all copies or substantial portions of the Software,
 * the Software, or portions of the Software, may not be sold for profit, and the
 * Software may not be distributed nor sub-licensed without explicit permission
 * from the copyright owner.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Should any questions arise concerning your usage of this Software, or to
 * request permission to distribute this Software, please contact the copyright
 * holder at http://nightdev.com/contact
 *
 * ---------------------------------
 *
 *  Unofficial TLDR:
 *  Free to modify for personal use
 *  Need permission to distribute the code
 *  Can't sell addon or features of the addon
 *  
 */
/** @license
 * Gritter for jQuery
 * http://www.boedesign.com/
 *
 * Copyright (c) 2014 Jordan Boesch
 * Dual licensed under the MIT and GPL licenses.
 */

(function(bttv) {
    var keyCodes = {
        'Backspace': 8,
        'Tab': 9,
        'Enter': 13,
        'Shift': 16,
        'Ctrl': 17,
        'Alt': 18,
        'Pause': 19,
        'Capslock': 20,
        'Esc': 27,
        'Space': 32,
        'Pageup': 33,
        'Pagedown': 34,
        'End': 35,
        'Home': 36,
        'LeftArrow': 37,
        'UpArrow': 38,
        'RightArrow': 39,
        'DownArrow': 40,
        'Insert': 45,
        'Delete': 46,
        '0': 48,
        '1': 49,
        '2': 50,
        '3': 51,
        '4': 52,
        '5': 53,
        '6': 54,
        '7': 55,
        '8': 56,
        '9': 57,
        'a': 65,
        'b': 66,
        'c': 67,
        'd': 68,
        'e': 69,
        'f': 70,
        'g': 71,
        'h': 72,
        'i': 73,
        'j': 74,
        'k': 75,
        'l': 76,
        'm': 77,
        'n': 78,
        'o': 79,
        'p': 80,
        'q': 81,
        'r': 82,
        's': 83,
        't': 84,
        'u': 85,
        'v': 86,
        'w': 87,
        'x': 88,
        'y': 89,
        'z': 90,
        '0numpad': 96,
        '1numpad': 97,
        '2numpad': 98,
        '3numpad': 99,
        '4numpad': 100,
        '5numpad': 101,
        '6numpad': 102,
        '7numpad': 103,
        '8numpad': 104,
        '9numpad': 105,
        'Multiply': 106,
        'Plus': 107,
        'Minut': 109,
        'Dot': 110,
        'Slash1': 111,
        'F1': 112,
        'F2': 113,
        'F3': 114,
        'F4': 115,
        'F5': 116,
        'F6': 117,
        'F7': 118,
        'F8': 119,
        'F9': 120,
        'F10': 121,
        'F11': 122,
        'F12': 123,
        'Equal': 187,
        'Comma': 188,
        'Slash': 191,
        'Backslash': 220
    }

    // Declare public and private variables
    var debug = {
        log: function (string) {
            if (window.console && console.log) console.log("BTTV: " + string);
        },
        warn: function (string) {
            if (window.console && console.warn) console.warn("BTTV: " + string);
        },
        error: function (string) {
            if (window.console && console.error) console.error("BTTV: " + string);
        },
        info: function (string) {
            if (window.console && console.info) console.info("BTTV: " + string);
        }
    },
    vars = {
        userData: {
            isLoggedIn: window.Twitch ? Twitch.user.isLoggedIn() : false,
            login: window.Twitch ? Twitch.user.login() : ''
        },
        settings: {},
        liveChannels: [],
        blackChat: false
    };

    bttv.info = {
        version: "6.7",
        release: 7,
        versionString: function() {
            return bttv.info.version + 'R' + bttv.info.release;
        }
    }

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
            var settingsList = [
                {
                    name: 'Admin/Staff Alert',
                    description: 'Get alerted in chat when admins or staff join',
                    default: false,
                    hidden: true,
                    storageKey: 'adminStaffAlert'
                },
                {
                    name: 'Alpha Chat Tags',
                    description: 'Removes the background from chat tags',
                    default: false,
                    storageKey: 'alphaTags'
                },
                {
                    name: 'Anti-Prefix Completion',
                    description: 'Allows you to use sub emotes (greater than 4 characters) without prefixes (BETA)',
                    default: false,
                    storageKey: 'antiPrefix'
                },
                {
                    name: 'BetterTTV Chat',
                    description: 'A tiny chat bar for personal messaging friends (BETA)',
                    default: false,
                    storageKey: 'bttvChat',
                    toggle: function(value) {
                        if(value === true) {
                            betaChat();
                        } else {
                            window.location.reload();
                        }
                    }
                },
                {
                    name: 'BetterTTV Emotes',
                    description: 'BetterTTV adds extra cool emotes for you to use',
                    default: true,
                    storageKey: 'bttvEmotes',
                    toggle: function() {
                        window.location.reload();
                    }
                },
                {
                    name: 'Chat Indentation',
                    description: 'Indent long chat lines to make them easier to read',
                    default: true,
                    storageKey: 'showChatIndentation',
                    toggle: function(value) {
                        if(value === true) {
                            $addCSS = $('<style></style>');
                            $addCSS.attr('id', 'bttvChatIndentation');
                            $addCSS.html('#chat_line_list .line p { padding-left: 16px;text-indent: -16px; }');
                            $('body').append($addCSS);
                        } else {
                            $('#bttvChatIndentation').remove();
                        }
                    }
                },
                {
                    name: 'DarkenTTV',
                    description: 'A sleek, grey theme which will make you love the site even more',
                    default: false,
                    storageKey: 'darkenedMode',
                    toggle: function(value) {
                        if(value === true) {
                            darkenPage();
                            if (bttv.settings.get("splitChat") !== false) {
                                $("#splitChat").remove();
                                splitChat();
                            }
                        } else {
                            $("#darkTwitch").remove();
                            handleBackground();
                            if (bttv.settings.get("splitChat") !== false) {
                                $("#splitChat").remove();
                                splitChat();
                            }
                        }
                    }
                },
                {
                    name: 'Default to Live Channels',
                    description: 'BetterTTV can click on "Live Channels" for you in the Directory when enabled',
                    default: false,
                    storageKey: 'showDirectoryLiveTab'
                },
                {
                    name: 'Desktop Notifications',
                    description: 'BetterTTV can send you desktop notifications when you are tabbed out of Twitch',
                    default: false,
                    storageKey: 'desktopNotifications',
                    toggle: function(value) {
                        if(value === true) {
                            if(window.Notification) {
                                if (Notification.permission === 'default' || (window.webkitNotifications && webkitNotifications.checkPermission() === 1)) {
                                    Notification.requestPermission(function () {
                                        if (Notification.permission === 'granted' || (window.webkitNotifications && webkitNotifications.checkPermission() === 0)) {
                                            bttv.settings.save("desktopNotifications", true);
                                            bttv.notify("Desktop notifications are now enabled.");
                                        } else {
                                            bttv.notify("You denied BetterTTV permission to send you notifications.");
                                        }
                                    });
                                } else if (Notification.permission === 'granted' || (window.webkitNotifications && webkitNotifications.checkPermission() === 0)) {
                                    bttv.settings.save("desktopNotifications", true);
                                    bttv.notify("Desktop notifications are now enabled.");
                                } else if (Notification.permission === 'denied' || (window.webkitNotifications && webkitNotifications.checkPermission() === 2)) {
                                    Notification.requestPermission(function () {
                                        if (Notification.permission === 'granted' || (window.webkitNotifications && webkitNotifications.checkPermission() === 0)) {
                                            bttv.settings.save("desktopNotifications", true);
                                            bttv.notify("Desktop notifications are now enabled.");
                                        } else {
                                            bttv.notify("You denied BetterTTV permission to send you notifications.");
                                        }
                                    });
                                } else {
                                    bttv.notify("Your browser is not capable of desktop notifications.");
                                }
                            } else {
                                bttv.notify("Your browser is not capable of desktop notifications.");
                            }
                        } else {
                            bttv.notify("Desktop notifications are now disabled.");
                        }
                    }
                },
                {
                    name: 'Double-Click Translation',
                    description: 'Double-clicking on chat lines translates them with Google Translate',
                    default: true,
                    storageKey: 'dblclickTranslation',
                    toggle: function(value) {
                        if(value === true) {
                            $('body').on('dblclick', '.chat-line', function() {
                                chat.helpers.translate($(this).find('.message'), $(this).data("sender"), $(this).find('.message').data("raw"));
                                $(this).find('.message').text("Translating..");
                                $('div.tipsy.tipsy-sw').remove();
                            });
                        } else {
                            $('body').unbind("dblclick");
                        }
                    }
                },
                {
                    name: 'Featured Channels',
                    description: 'The left sidebar is too cluttered, so BetterTTV removes featured channels by default',
                    default: false,
                    storageKey: 'showFeaturedChannels',
                    toggle: function(value) {
                        if(value === true) {
                            displayElement('#nav_games');
                            displayElement('#nav_streams');
                            displayElement('#nav_related_streams');
                        } else {
                            removeElement('#nav_games');
                            removeElement('#nav_streams');
                            removeElement('#nav_related_streams');
                        }
                    }
                },
                {
                    name: 'JTV Chat Tags',
                    description: 'BetterTTV can replace the chat tags with the ones from JTV',
                    default: false,
                    storageKey: 'showJTVTags'
                },
                {
                    name: 'Mod Card Keybinds',
                    description: 'Enable keybinds when you click on a username: P(urge), T(imeout), B(an)',
                    default: false,
                    storageKey: 'modcardsKeybinds'
                },
                {
                    name: 'Purple Buttons',
                    description: 'BetterTTV replaces Twitch\'s purple with blue by default',
                    default: false,
                    storageKey: 'showPurpleButtons',
                    toggle: function(value) {
                        if(value === true) {
                            $("#bttvBlueButtons").remove();
                        } else {
                            cssBlueButtons();
                        }
                    }
                },
                {
                    name: 'Remove Deleted Messages',
                    description: 'Completely removes timed out messages from view',
                    default: false,
                    storageKey: 'hideDeletedMessages'
                },
                {
                    name: 'Robot Emoticons',
                    description: 'BetterTTV replaces the robot emoticons with the old JTV monkey faces by default',
                    default: false,
                    storageKey: 'showDefaultEmotes',
                    toggle: function() {
                        window.location.reload();
                    }
                },
                {
                    name: 'Show Deleted Messages',
                    description: 'Turn this on to change &lt;message deleted&gt; back to users\' messages.',
                    default: false,
                    storageKey: 'showDeletedMessages'
                },
                {
                    name: 'Split Chat',
                    description: 'Easily distinguish between messages from different users in chat',
                    default: true,
                    storageKey: 'splitChat',
                    toggle: function(value) {
                        if(value === true) {
                            splitChat();
                        } else {
                            $("#splitChat").remove();
                        }
                    }
                },
                {
                    name: 'Twitch Chat Emotes',
                    description: 'Why remember emotes when you can "click-to-insert" them (by Ryan Chatham)',
                    default: false,
                    storageKey: 'clickTwitchEmotes',
                    toggle: function(value) {
                        if(value === true) {
                            handleTwitchChatEmotesScript();
                        } else {
                            window.location.reload();
                        }
                    }
                },
                {   
                    default: '',
                    storageKey: 'blacklistKeywords',
                    toggle: function(keywords) {
                        var phraseRegex = /\{.+?\}/g;
                        var testCases =  keywords.match(phraseRegex);
                        var phraseKeywords = [];
                        if(testCases) {
                            for (i=0;i<testCases.length;i++) {
                                var testCase = testCases[i];
                                keywords = keywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
                                phraseKeywords.push('"'+testCase.replace(/(^\{|\}$)/g, '').trim()+'"');
                            }
                        }

                        keywords === "" ? keywords = phraseKeywords : keywords = keywords.split(" ").concat(phraseKeywords);
                        
                        for(var i=0; i<keywords.length; i++) {
                            if(/^\([a-z0-9_\-\*]+\)$/i.test(keywords[i])) {
                                keywords[i] = keywords[i].replace(/(\(|\))/g, '');
                            }
                        }

                        var keywordList = keywords.join(", ");
                        if(keywordList === "") {
                            bttv.chat.helpers.serverMessage("Blacklist Keywords list is empty");
                        } else {
                            bttv.chat.helpers.serverMessage("Blacklist Keywords are now set to: " + keywordList);
                        }
                    }
                },
                {
                    default: true,
                    storageKey: 'chatLineHistory',
                    toggle: function(value) {
                        if(value === true) {
                            bttv.chat.helpers.serverMessage("Chat line history enabled.");
                        } else {
                            bttv.chat.helpers.serverMessage("Chat line history disabled.");
                        }
                    }
                },
                {
                    default: 340,
                    storageKey: 'chatWidth'
                },
                {
                    default: false,
                    storageKey: 'flipDashboard',
                    toggle: function(value) {
                        if(value === true) {
                            $("#flipDashboard").text("Unflip Dashboard");
                            flipDashboard();
                        } else {
                            $("#flipDashboard").text("Flip Dashboard");
                            $("#controls_column, #player_column").css({
                                float: "none",
                                marginLeft: "0px"
                            });
                            $("#chat,iframe").css({
                                float: "right",
                                left: "",
                                right: "20px"
                            });
                        }
                    }
                },
                {
                    default: (vars.userData.isLoggedIn ? vars.userData.login : ''),
                    storageKey: 'highlightKeywords',
                    toggle: function(keywords) {
                        var phraseRegex = /\{.+?\}/g;
                        var testCases =  keywords.match(phraseRegex);
                        var phraseKeywords = [];

                        if(testCases) {
                            for (i=0;i<testCases.length;i++) {
                                var testCase = testCases[i];
                                keywords = keywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
                                phraseKeywords.push('"'+testCase.replace(/(^\{|\}$)/g, '').trim()+'"');
                            }
                        }

                        keywords === "" ? keywords = phraseKeywords : keywords = keywords.split(" ").concat(phraseKeywords);

                        for(var i=0; i<keywords.length; i++) {
                            if(/^\([a-z0-9_\-\*]+\)$/i.test(keywords[i])) {
                                keywords[i] = keywords[i].replace(/(\(|\))/g, '');
                            }
                        }
                        
                        var keywordList = keywords.join(", ");
                        if(keywordList === "") {
                            bttv.chat.helpers.serverMessage("Highlight Keywords list is empty");
                        } else {
                            bttv.chat.helpers.serverMessage("Highlight Keywords are now set to: " + keywordList);
                        }
                    }
                },
                {
                    default: 150,
                    storageKey: 'scrollbackAmount',
                    toggle: function(lines) {
                        if(lines === 150) {
                            bttv.chat.helpers.serverMessage("Chat scrollback is now set to: default (150)");
                        } else {
                            bttv.chat.helpers.serverMessage("Chat scrollback is now set to: " + lines);
                        }
                    }
                }
            ];

            var settingTemplate = ' \
                <div class="option bttvOption-%storageKey%"> \
                    <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">%name%</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;%description% \
                    <div class="switch"> \
                        <input type="radio" class="switch-input switch-off" name="%storageKey%" value="false" id="%storageKey%False"> \
                        <label for="%storageKey%False" class="switch-label switch-label-off">Off</label> \
                        <input type="radio" class="switch-input" name="%storageKey%" value="true" id="%storageKey%True"> \
                        <label for="%storageKey%True" class="switch-label switch-label-on">On</label> \
                        <span class="switch-selection"></span> \
                    </div> \
                </div> \
            ';

            var featureRequests = ' \
                <div class="option"> \
                    Think something is missing here? Send in a <a href="http://bugs.nightdev.com/projects/betterttv/issues/new?tracker_id=2" target="_blank">feature request</a>! \
                </div> \
            ';

            settingsList.forEach(function(setting) {
                vars.settings[setting.storageKey] = setting;
                vars.settings[setting.storageKey].value = (parseSetting(bttv.storage.get(bttv.settings.prefix+setting.storageKey)) == null) ? setting.default : parseSetting(bttv.storage.get(bttv.settings.prefix+setting.storageKey));

                if(setting.name) {
                    var settingHTML = settingTemplate.replace(/\%(name|description|storageKey)\%/g, function(match, value) { return setting[value]; });
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
                if(e.origin !== 'http://'+window.location.host) return;
                if(e.data) {
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
            var settingsUrl = 'http://'+window.location.host+'/settings?bttvSettings=true';
            window.open(settingsUrl, 'BetterTTV Settings', 'width=800,height=500,top=500,left=800,scrollbars=no,location=no,directories=no,status=no,menubar=no,toolbar=no,resizable=no');
        },
        prefix: "bttv_",
        save: function(setting, value) {
            if(/\?bttvSettings=true/.test(window.location)) {
                window.opener.postMessage('bttv_setting '+setting+' '+value, 'http://'+window.location.host);
            } else {
                if(window.ga) ga('send', 'event', 'BTTV', 'Change Setting: '+setting+'='+value);
                if(/\?bttvDashboard=true/.test(window.location)) window.parent.postMessage('bttv_setting '+setting+' '+value, 'http://'+window.location.host);
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
            badge: function(type, name, description) { return '<div class="ember-view '+type+''+((bttv.settings.get('alphaTags') && ['admin','staff','broadcaster','moderator','turbo','ign'].indexOf(type) !== -1)?' alpha'+(!bttv.settings.get("darkenedMode")?' invert':''):'')+' badge" title="'+description+'">'+name+'</div> '; },
            badges: function(badges) {
                var resp = '<span class="badges">';
                badges.forEach(function(data) {
                    resp += bttv.chat.templates.badge(data.type, data.name, data.description);
                });
                resp += '</span>';
                return resp;
            },
            from: function(name, color) { return '<span '+(color?'style="color: '+color+';" ':'')+'class="from">'+name+'</span><span class="colon">:</span>'+(name!=='jtv'?'&nbsp;<wbr></wbr>':''); },
            timestamp: function(time) { return '<span class="timestamp"><small>'+time+'</small></span>'; },
            modicons: function() { return '<span class="mod-icons"><a class="timeout" title="Timeout">Timeout</a><a class="ban" title="Ban">Ban</a><a class="unban" title="Unban" style="display: none;">Unban</a></span>'; },
            escape: function(message) { return message.replace(/</g,'&lt;').replace(/>/g, '&gt;'); },
            linkify: function(message) {
                var regex = /(\b\x02?((?:https?:\/\/|[\w\-\.\+]+@)?\x02?(?:[\w\-]+\x02?\.)+\x02?(?:com|au|org|tv|net|info|jp|uk|us|cn|fr|mobi|gov|co|ly|me|vg|eu|ca|fm|am|ws)\x02?(?:\:\d+)?\x02?(?:\/[\w\.\/@\?\&\%\#\(\)\,\-\+\=\;\:\x02?]+\x02?[\w\/@\?\&\%\#\(\)\=\;\x02?]|\x02?\w\x02?|\x02?)?\x02?)\x02?\b|(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9]+-?)*[a-z0-9]+)(?:\.(?:[a-z0-9]+-?)*[a-z0-9]+)*(?:\.(?:[a-z]{2,})))(?::\d{2,5})?(?:\/[^\s\"\']*)?)/gi;
                return message.replace(regex, function(e) {
                    if (/\x02/.test(e)) return e;
                    if (e.indexOf("@") > -1 && (e.indexOf("/") === -1 || e.indexOf("@") < e.indexOf("/"))) return '<a href="mailto:' + e + '">' + e + "</a>";
                    var link = e.replace(/^(?!(?:https?:\/\/|mailto:))/i, 'http://');
                    return '<a href="' + link + '" target="_blank">' + e + '</a>';
                });
            },
            emoticon: function(setId, setClass, regex) {
                return '<span class="emoticon '+setClass+'"'+((bttv.TwitchEmoteSets && bttv.TwitchEmoteSets[setId]) ? ' data-channel="'+bttv.TwitchEmoteSets[setId]+'"' : '')+' data-regex="'+encodeURIComponent(getEmoteFromRegEx(regex)).split('').join(' ')+'"></span>';
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
                    userSets.forEach(function(set) {
                        if(emotes[set] === undefined) return;
                        emotes[set].forEach(function(emote) {
                            if(message.match(emote.regex)) {
                                message = message.replace(emote.regex, bttv.chat.templates.emoticon(set, emote.cls, emote.regex));
                            }
                        });
                    });
                }

                emotes['default'].forEach(function(emote) {
                    if(message.match(emote.regex)) {
                        message = message.replace(emote.regex, bttv.chat.templates.emoticon(-1, emote.cls, emote.regex));
                    }
                });

                return message;
            },
            moderationCard: function(user, top, left) {
                return '<div data-user="'+user.name+'" class="bttv-mod-card ember-view moderation-card" style="top: '+top+'px;left: '+left+'px;"><div class="close-button"></div> \
                    <div style="background-color: '+(user.profile_banner_background_color?user.profile_banner_background_color:'#000')+'" class="card-header"> \
                      <img src="'+(user.logo?user.logo:'https://www-cdn.jtvnw.net/images/xarth/404_user_300x300.png')+'" class="channel_logo"> \
                      <div class="drag-handle"></div> \
                      <h3 class="name"> \
                        <a href="'+Twitch.url.profile(user.name)+'" target="_blank">'+user.display_name+'</a> \
                      </h3> \
                      <div class="channel_background_cover"></div> \
                      '+(user.profile_banner?'<img class="channel_background" src="'+user.profile_banner+'">':'')+' \
                    </div> \
                    '+(user.name != vars.userData.login?'<div class="interface"> \
                      <button class="button-simple primary mod-card-follow">Follow</button>\
                      <button class="button-simple dark mod-card-profile" style="height: 30px;vertical-align: top;"><img src="/images/xarth/g/g18_person-00000080.png" style="margin-top: 6px;" /></button> \
                      <button class="button-simple dark mod-card-message" style="height: 30px;vertical-align: top;"><img src="/images/xarth/g/g18_mail-00000080.png" style="margin-top: 6px;" /></button> \
                      <button class="button-simple dark mod-card-ignore">Ignore</button> \
                      '+((vars.userData.isLoggedIn && bttv.chat.helpers.isOwner(vars.userData.login))?' \
                      <button class="button-simple dark mod-card-mod">Mod</button> \
                      ':'')+((vars.userData.isLoggedIn && bttv.chat.helpers.isModerator(vars.userData.login) && (!bttv.chat.helpers.isModerator(user.name) || vars.userData.login === bttv.getChannel()))?' \
                      <br /> \
                      <span class="mod-controls"> \
                        <button class="permit button-simple light" style="width:48px;" title="!permit this user"> \
                          Permit \
                        </button> \
                        <button class="timeout button-simple light" style="width:44px;" data-time="1" title="Clear this user\'s chat"> \
                          Purge \
                        </button> \
                        <button class="timeout button-simple light" data-time="600" title="Temporary 10 minute ban"> \
                          <img src="/images/xarth/g/g18_timeout-00000080.png" /> \
                        </button> \
                        <button class="timeout button-simple light" style="width:30px;" data-time="28800" title="Temporary 8 hour ban"> \
                          8hr \
                        </button> \
                        <button class="timeout button-simple light" style="width:38px;" data-time="86400" title="Temporary 24 hour ban"> \
                          24hr \
                        </button> \
                        <button class="ban button-simple light" title="Permanent Ban"> \
                          <img src="/images/xarth/g/g18_ban-00000080.png" /> \
                        </button> \
                      </span> \
                      ':'')+' \
                    </div>':'')+'\
                </div>';
            },
            message: function(sender, message, userSets, colored) {
                colored = colored || false;
                var templates = bttv.chat.templates;
                var rawMessage = encodeURIComponent(message.replace(/%/g,""));
                if(sender !== 'jtv') {
                    message = templates.escape(message);
                    message = templates.emoticonize(message, userSets);
                    message = templates.linkify(message);
                }
                return '<span class="message" '+(colored?'style="color: '+colored+'" ':'')+'data-raw="'+rawMessage+'">'+message+'</span>';
            },
            privmsg: function(highlight, action, server, isMod, data) {
                var templates = bttv.chat.templates;
                return '<div class="ember-view chat-line'+(highlight?' highlight':'')+(action?' action':'')+(server?' admin':'')+'" data-sender="'+data.sender+'">'+templates.timestamp(data.time)+' '+(isMod?templates.modicons():'')+' '+templates.badges(data.badges)+templates.from(data.nickname, data.color)+templates.message(data.sender, data.message, data.emoteSets, action?data.color:false)+'</div>';
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
            var privateRooms = bttv.getChatController() ? bttv.getChatController().get('connectedPrivateGroupRooms') : false;
            if(privateRooms && privateRooms.length > 0) {
                privateRooms.forEach(function(room) {
                    bttv.chat.store.newRoom(room.get('id'));
                    room.tmiRoom.on('message', bttv.chat.store.getRoom(room.get('id')).chatHandler);
                    room.tmiRoom.on('clearchat', chat.handlers.clearChat);
                });
            }

            // Load BTTV emotes if not loaded
            overrideEmotes();
            handleTwitchChatEmotesScript();

            // Load Chat Settings
            loadChatSettings();

            // Hover over icons
            $("body").off('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a, .bttv-mod-card .mod-controls button').on('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a, .bttv-mod-card .mod-controls button', function() {
                $(this).tipsy({
                    trigger: 'manual',
                    gravity: "sw"
                });
                $(this).tipsy("show");
            }).off('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a, .bttv-mod-card .mod-controls button').on('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a, .bttv-mod-card .mod-controls button', function() {
                $(this).tipsy("hide");
                $('div.tipsy.tipsy-sw').remove();
            })

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
                    $('div.tipsy.tipsy-sw').remove();
                });
            }

            // Message input features (tab completion, message history, anti-prefix completion, extra commands)
            if(!vars.loadedTabCompletion) {
                vars.loadedTabCompletion = true;
                var lastPartialMatch = null;
                var lastMatch = null;
                var lastIndex = null

                $('.ember-chat .chat-interface textarea').live('keydown', function (e) {
                    var keyCode = e.keyCode || e.which;
                    var $chatInput = $('.ember-chat .chat-interface textarea');

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
            }

            $('.ember-chat .chat-messages .chat-line').remove();
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
                if(tmi) return tmi.tmiRoom._roomUserModes._sets;
                return {};
            },
            addMod: function(user) {
                if(!user || user === "") return false;
                var tmi = bttv.chat.tmi();
                if(tmi) tmi.tmiRoom._roomUserModes.add(user, 'mod');
            },
            removeMod: function(user) {
                if(!user || user === "") return false;
                var tmi = bttv.chat.tmi();
                if(tmi) tmi.tmiRoom._roomUserModes.remove(user, 'mod');
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
                                bttv.chat.helpers.serverMessage("By my calculations, this block of users will take "+((bannedUsers.length*2.1)/60).toFixed(2)+" minutes to unban.");
                                if(bannedUsers.length > 70) bttv.chat.helpers.serverMessage("Twitch only provides up to 100 users at a time (some repeat), but this script will cycle through all of the blocks of users.");
                                setTimeout(function() {
                                    var startTime = 0;
                                    bannedUsers.forEach(function(user) {
                                        setTimeout(function() {
                                            bttv.chat.helpers.unban(user);
                                            bttv.chat.store.__unbannedUsers.push(user);
                                        }, startTime += 2100);
                                    });
                                    setTimeout(function() {
                                        bttv.chat.helpers.serverMessage("This block of users has been purged. Checking for more..");
                                        bttv.chat.helpers.massUnban();
                                    }, startTime += 2100);
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
                var language = window.location.host.split('.')[0].replace(/^(www|beta)$/,"en"),
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
                    channel.emberRoom.set('unreadCount', channel.unread);
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
                    bttv.chat.helpers.serverMessage('You switched to: '+bttv.chat.tmi().get('name'));
                } else {
                    if(bttv.chat.store.__messageQueue.length === 0) return;
                    $('.ember-chat .chat-messages .tse-content').append(bttv.chat.store.__messageQueue.join(""));
                    bttv.chat.store.__messageQueue = [];
                }
                bttv.chat.helpers.scrollChat();
            },
            moderationCard: function(user, $event) {
                var makeCard = function(user) {
                    var template = bttv.chat.templates.moderationCard(user, $event.offset().top, $event.offset().left);
                    $('.ember-chat .moderation-card').remove();
                    $('.ember-chat').append(template);

                    var $modCard = $('.ember-chat .moderation-card[data-user="'+user.name+'"]');

                    $modCard.find('.close-button').click(function() {
                        $modCard.remove();
                    });
                    $modCard.find('.permit').click(function() {
                        bttv.chat.helpers.sendMessage('!permit '+user.name);
                        $modCard.remove();
                        $('div.tipsy.tipsy-sw').remove();
                    });
                    $modCard.find('.timeout').click(function() {
                        bttv.chat.helpers.timeout(user.name, $(this).data('time'));
                        $modCard.remove();
                        $('div.tipsy.tipsy-sw').remove();
                    });
                    $modCard.find('.ban').click(function() {
                        bttv.chat.helpers.ban(user.name);
                        $modCard.remove();
                        $('div.tipsy.tipsy-sw').remove();
                    });
                    $modCard.find('.mod-card-profile').click(function() {
                        window.open(Twitch.url.profile(user.name),'_blank');
                    });
                    $modCard.find('.mod-card-message').click(function() {
                        window.open(Twitch.url.compose(user.name),'_blank');
                    });

                    if(bttv.chat.helpers.isIgnored(user.name)) $modCard.find('.mod-card-ignore').text('Unignore');
                    $modCard.find('.mod-card-ignore').click(function() {
                        if($modCard.find('.mod-card-ignore').text() === 'Unignore') {
                            bttv.chat.helpers.sendMessage('/unignore '+user.name);
                            $modCard.find('.mod-card-ignore').text('Ignore');
                        } else {
                            bttv.chat.helpers.sendMessage('/ignore '+user.name);
                            $modCard.find('.mod-card-ignore').text('Unignore');
                        }
                    });

                    if(bttv.chat.helpers.isModerator(user.name)) $modCard.find('.mod-card-mod').text('Demod');
                    $modCard.find('.mod-card-mod').click(function() {
                        if($modCard.find('.mod-card-mod').text() === 'Demod') {
                            bttv.chat.helpers.sendMessage('/unmod '+user.name);
                            $modCard.find('.mod-card-mod').text('Mod');
                        } else {
                            bttv.chat.helpers.sendMessage('/mod '+user.name);
                            $modCard.find('.mod-card-mod').text('Demod');
                        }
                    });

                    Twitch.api.get('users/:login/follows/channels/'+user.name).done(function() {
                        $modCard.find('.mod-card-follow').text('Unfollow');
                    }).fail(function() {
                        $modCard.find('.mod-card-follow').text('Follow');
                    });
                    $modCard.find('.mod-card-follow').text('Unfollow').click(function() {
                        if($modCard.find('.mod-card-follow').text() === 'Unfollow') {
                            Twitch.api.del("users/:login/follows/channels/"+user.name).done(function() {
                                bttv.chat.helpers.serverMessage('User was unfollowed successfully.');
                            }).fail(function() {
                                bttv.chat.helpers.serverMessage('There was an error following this user.');
                            });
                            $modCard.find('.mod-card-follow').text('Follow');
                        } else {
                            Twitch.api.put("users/:login/follows/channels/"+user.name).done(function() {
                                bttv.chat.helpers.serverMessage('User was followed successfully.');
                            }).fail(function() {
                                bttv.chat.helpers.serverMessage('There was an error following this user.');
                            });
                            $modCard.find('.mod-card-follow').text('Unfollow');
                        }
                    });

                    $modCard.drags({ handle: ".drag-handle", el: $modCard });
                }
                Twitch.api.get('/api/channels/'+user.toLowerCase()+'/ember').done(function(user) {
                    makeCard(user);
                }).fail(function() {
                    makeCard({ name: user, display_name: user.capitalize() });
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
                            $('div.tipsy.tipsy-sw').remove();
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

                    $('.ember-chat .chat-messages .tse-content').append(message);
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
                        var wordRegex = new RegExp('(\\s|^)' + keyword + '([!.,:\';?/]|\\s|$)', 'i');
                        if (vars.userData.isLoggedIn && vars.userData.login !== data.from && wordRegex.test(data.message)) {
                            messageHighlighted = true;
                            if(bttv.settings.get("desktopNotifications") === true && bttv.chat.store.activeView === false) {
                                bttv.notify("You were mentioned in "+bttv.chat.helpers.lookupDisplayName(bttv.getChannel())+"'s channel.");
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

                var colorRegex = /^#[0-9a-f]+$/i;
                if(colorRegex.test(data.color)) {
                    while (((calculateColorBackground(data.color) === "light" && bttv.settings.get("darkenedMode") === true) || (calculateColorBackground(data.color) === "dark" && bttv.settings.get("darkenedMode") !== true))) {
                        data.color = calculateColorReplacement(data.color, calculateColorBackground(data.color));
                    }
                }

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
                    "julia_cs": { supporter: true, team: "Design", tagType: "bttvSupporter" },
                    "izl": { supporter: true, team: "Support", tagType: "bttvSupporter" },
                }

                var legacyTags = {
                    //Developers and Supporters
                    "night": { mod: true, tagType: "broadcaster", tagName: "<span style='color:#FFD700;'>Creator</span>", color: "#000;text-shadow: 0 0 10px #FFD700" },
                    //Donations
                    "gspwar": { mod: false, tagType: "admin", tagName: "EH?" },
                    "nightmare": { mod: false, tagType: "broadcaster", tagName: "MLG" },
                    "sour": { mod: false, tagType: "brown", tagName: "<span style='color:#FFE600;'>Saucy</span>", color: data.color+";text-shadow: 0 0 10px #FFD700" },
                    "yorkyyork": { mod: false, tagType: "broadcaster", tagName: "Nerd" },
                    "striker035": { mod: true, tagType: "admin", tagName: "MotherLover" },
                    "dogs": { mod: true, tagType: "orange", tagName: "Smelly", nickname: "Dog" },
                    "jruxdev": { mod: true, tagType: "bot", tagName: "MuttonChops" },
                    "totally_cereal": { mod: true, tagType: "staff", tagName: "Fruity" },
                    "virtz": { mod: true, tagType: "staff", tagName: "Perv" },
                    "unleashedbeast": { mod: true, tagType: "admin", tagName: "<span style='color:black;'>Surface</span>" },
                    "kona": { mod: true, tagType: "broadcaster", tagName: "KK" },
                    "norfolk": { mod: true, tagType: "broadcaster", tagName: "Creamy" },
                    "leftyben": { mod: true, tagType: "lefty", tagName: "&nbsp;" },
                    "maximusloopus": { mod: true, tagType: "admin", tagName: "<span style='color:black;'>Hero</span>" },
                    "nokz": { mod: true, tagType: "staff", tagName: "N47" },
                    "blindfolded": { mod: true, tagType: "broadcaster", tagName: "iLag" },
                    "jjag72": { mod: true, tagType: "admin", tagName: "Jag" },
                    "snorlaxitive": { mod: true, tagType: "purple", tagName: "King" },
                    "excalibur": { mod: true, tagType: "staff", tagName: "Boss" },
                    "chez_plastic": { mod: true, tagType: "staff", tagName: "Frenchy" },
                    "frontiersman72": { mod: true, tagType: "admin", tagName: "TMC" },
                    "dckay14": { mod: true, tagType: "admin", tagName: "Ginger" },
                    "boogie_yellow": { mod: true, tagType: "orange", tagName: "Yellow" },
                    "harksa": { mod: true, tagType: "orange", tagName: "Feet" },
                    "lltherocksaysll": { mod: true, tagType: "broadcaster", tagName: "BossKey" },
                    "melissa_loves_everyone": { mod: true, tagType: "purple", tagName: "Chubby", nickname: "Bunny" },
                    "redvaloroso": { mod: true, tagType: "broadcaster", tagName: "Dio" },
                    "slapage": { mod: true, tagType: "bot", tagName: "I aM" },
                    "deano2518": { mod: true, tagType: "orange", tagName: "<span style='color:black;'>WWFC</span>" },
                    "eternal_nightmare": { mod: true, tagType: "broadcaster", tagName: "Spencer", nickname: "Nickiforek" },
                    "iivii_beauty": { mod: true, tagType: "purple", tagName: "Crave" },
                    "theefrenzy": { mod: true, tagType: "staff", tagName: "Handsome" },
                    "gennousuke69": { mod: true, tagType: "admin", tagName: "Evil" },
                    "zebbazombies": { mod: true, tagType: "moderator", tagName: "Hugs" },
                    "nobama12345": { mod: true, tagType: "broadcaster", tagName: "Señor" },
                    "uleet": { mod: true, tagType: "moderator", tagName: "Taco" },
                    "mrimjustaminorthreat": { mod: true, tagType: "staff", tagName: "<span style='color:pink;'>Major</span>", nickname: "mrimjustamajorthreat" },
                    "sournothardcore": { mod: true, tagType: "brown", tagName: "<span style='color:#FFE600 !important;'>Saucy</span>", color: data.color+";text-shadow: 0 0 10px #FFD700" },
                    //People
                    "whitesammy": { mod: false, color: "white;text-shadow: 0 0 2px #000" },
                    "mac027": { mod: true, tagType: "admin", tagName: "Hacks" },
                    "vaughnwhiskey": { mod: true, tagType: "admin", tagName: "Bacon" },
                    "socaldesigner": { mod: true, tagType: "broadcaster", tagName: "Legend" },
                    "perfectorzy": { mod: true, tagType: "moderator", tagName: "Jabroni Ave" },
                    "pantallideth1": { mod: true, tagType: "staff", tagName: "Windmill" },
                    "mmmjc": { mod: true, tagType: "admin", tagName: "m&m" },
                    "hawkeyye": { mod: true, tagType: "broadcaster", tagName: "EnVy", nickname: "Hawkeye" },
                    "the_chopsticks": { mod: true, tagType: "admin", tagName: "oZn" },
                    "bacon_donut": { mod: true, tagType: "bacon", tagName: "&#8203;", nickname: "Donut" },
                    "tacos": { mod: true, tagType: "taco", tagName: "&#8203;" },
                    "sauce": { mod: true, tagType: "purple", tagName: "Drippin' Dat" },
                    "thejokko": { mod: true, tagType: "purple", tagName: "Swede" },
                    "missmiarose": { mod: true, tagType: "admin", tagName: "Lovely" },
                    //Xmas
                    "r3lapse": { mod: true, tagType: "staff", tagName: "Kershaw" },
                    "im_tony_": { mod: true, tagType: "admin", tagName: "oZn" },
                    "tips_": { mod: true, tagType: "staff", tagName: "241" },
                    "papa_dot": { mod: true, tagType: "moderator", tagName: "v8" },
                    "1danny1032": { mod: true, tagType: "admin", tagName: "1Bar" },
                    "cvagts": { mod: true, tagType: "staff", tagName: "SRL" },
                    "thesabe": { mod: true, tagType: "orange", tagName: "<span style='color:blue;'>Sabey</span>" },
                    "kerviel_": { mod: true, tagType: "staff", tagName: "Almighty" },
                    "ackleyman": { mod: true, tagType: "orange", tagName: "Ack" }
                }

                if(legacyTags[data.from] && ((legacyTags[data.from].mod === true && bttv.chat.helpers.isModerator(data.from)) || legacyTags[data.from].mod === false)) {
                    var userData = legacyTags[data.from];
                    if(userData.tagType) data.bttvTagType = (["moderator","broadcaster","admin","staff","bot"].indexOf(userData.tagType) !== -1) ? 'old'+userData.tagType : userData.tagType;
                    if(userData.tagName) data.bttvTagName = userData.tagName;
                    if(userData.color && data.style !== 'action') data.color = userData.color;
                    if(userData.nickname) data.bttvDisplayName = userData.nickname;
                    data.bttvTagDesc = "Grandfathered BetterTTV Swag Tag";
                }

                var badges = bttv.chat.helpers.getBadges(data.from);
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
                    vars.userData.isLoggedIn ? (bttv.chat.helpers.isModerator(vars.userData.login) && (!bttv.chat.helpers.isModerator(data.sender) || vars.userData.login === channel)) : false,
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
                    delete bttv.chat.tmi().tmiRoom._events['message'];
                    delete bttv.chat.tmi().tmiRoom._events['clearchat'];
                    bttv.chat.store.newRoom(name);
                    bttv.chat.tmi().tmiRoom.on('message', bttv.chat.store.getRoom(name).chatHandler);
                    bttv.chat.tmi().tmiRoom.on('clearchat', bttv.chat.handlers.clearChat);
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
    var removeElement = function (e) {
            // Removes all of an element
            $(e).each(function () {
                $(this).hide();
            });
        },
        displayElement = function (e) {
            // Displays all of an element
            $(e).each(function () {
                $(this).show();
            });
        },
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
            var inputColor = color,
                rgb = "#",
                brightness, c, i;

            color = String(color).replace(/[^0-9a-f]/gi, '');
            if (color.length < 6) {
                color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
            }

            (background === "light") ? (brightness = "0.2") : (brightness = "-0.5");

            for (i = 0; i < 3; i++) {
                c = parseInt(color.substr(i * 2, 2), 16);
                if(c < 10) c = 10;
                c = Math.round(Math.min(Math.max(0, c + (c * brightness)), 255)).toString(16);
                rgb += ("00" + c).substr(c.length);
            }

            if(inputColor === rgb) {
                debug.log("Color did not change: "+inputColor);
                if(background === "light") {
                    return "#ffffff";
                } else {
                    return "#000000";
                }
            } else {
                return rgb;
            }
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

    var clearClutter = function () {
        debug.log("Clearing Clutter");

        // Sidebar is so cluttered
        removeElement('li[data-name="kabam"]');
        removeElement('#nav_advertisement');
        if (bttv.settings.get("showFeaturedChannels") !== true) {
            removeElement('#nav_games');
            removeElement('#nav_streams');
            removeElement('#nav_related_streams');
        }
    }

    var channelReformat = function () {
        if ($('body.ember-application').length === 0 || $('.ember-chat').length === 0 || $("#right_col").length === 0) return;

        debug.log("Reformatting Channel Page");

        if($('.broadcast-meta .title .real').length) {
            var linkifyTitle = function() {
                var linkifiedTitle = bttv.chat.templates.linkify($('.broadcast-meta .title .real').text());

                $('.broadcast-meta .title span').each(function() {
                    $(this).html(linkifiedTitle);
                });
            }
            linkifyTitle();
            setInterval(function() {
                if(!vars.channelTitle) vars.channelTitle = "";
                if($('.broadcast-meta .title .real').html() !== vars.channelTitle) {
                    vars.channelTitle = $('.broadcast-meta .title .real').html();
                    linkifyTitle();
                }
            }, 1000);
        }

        if(!vars.loadedChannelResize) {
            vars.loadedChannelResize = true;

            var resize = false;

            $(document).keydown(function (event) {
                if (event.keyCode === keyCodes.r && event.altKey) {
                    $(window).trigger('resize');
                }
            });

            var resizeTimer = false;

            var handleResize = function () {
                debug.log("Page resized");

                if($('body.ember-application').length === 0 || $('.ember-chat').length === 0) return;

                var d = 0;
                if ($("#large_nav").css("display") !== "none") {
                    d += $("#large_nav").width();
                }
                if ($("#small_nav").css("display") !== "none") {
                    d += $("#small_nav").width();
                }
                if (vars.chatWidth == 0) {
                    $("#right_col").css({
                        display: "none"
                    });
                    $("#right_close span").css({
                        "background-position": "0 0"
                    });
                }
                if ($("#right_col").css("display") !== "none") {
                    if ($("#right_col").width() < 340) {
                        vars.chatWidth = 340;
                        $("#right_col").width(vars.chatWidth);
                        $("#right_col #chat").width(vars.chatWidth);
                        $("#right_col .top").width(vars.chatWidth);
                        $("#right_col").css("display", "inherit");
                        $("#right_close span").css({
                            "background-position": "0 -18px"
                        });
                        handleResize();
                        return;
                    } else {
                        d += $("#right_col").width();
                    }
                }

                $("#main_col").css({
                    width: $(window).width() - d + "px"
                });

                if($("#broadcast_meta").length) {
                    if ($(".live_site_player_container").length) {
                        var h = 0.5625 * $("#main_col").width() - 4;
                        var calcH = $(window).height() - $("#broadcast_meta").outerHeight(true) - $("#stats_and_actions").outerHeight();
                        if (h > calcH) {
                            $(".live_site_player_container").css({
                                height: $(window).height() - $("#stats_and_actions").outerHeight() + "px"
                            });
                            $("#main_col .tse-scroll-content").animate({
                                scrollTop: $('.live_site_player_container').position().top - 10
                            }, 150, "swing");
                        } else {
                            $(".live_site_player_container").css({
                                height: h.toFixed(0) + "px"
                            });
                            $("#main_col .tse-scroll-content").animate({
                                scrollTop: 0
                            }, 150, "swing");
                        }
                    } else if ($(".archive_site_player_container").length) {
                        var h = 0.5625 * $("#main_col").width() - 4;
                        var calcH = $(window).height() - $("#broadcast_meta").outerHeight(true) - $(".archive_info").outerHeight(true) - $("#stats_and_actions").outerHeight();
                        if (h > calcH) {
                            $(".archive_site_player_container").css({
                                height: $(window).height() - $(".archive_info").outerHeight(true) - $("#stats_and_actions").outerHeight() + "px"
                            });
                            $("#main_col .tse-scroll-content").animate({
                                scrollTop: $('.archive_site_player_container').position().top - 10
                            }, 150, "swing");
                        } else {
                            $(".archive_site_player_container").css({
                                height: h.toFixed(0) + "px"
                            });
                            $("#main_col .tse-scroll-content").animate({
                                scrollTop: 0
                            }, 150, "swing");
                        }
                    }

                    var d = $("#broadcast_meta .info .title").width();
                    $("#broadcast_meta .info .title .real_title").width() > d ? $("#broadcast_meta .info").addClass("long_title") : $("#broadcast_meta .info").removeClass("long_title");
                    $("#channel_panels_contain").masonry("reload");
                } else {
                    var h = 0.5625 * $("#main_col").width() - 4;
                    var calcH = $(window).height() - $("#broadcast-meta").outerHeight(true) - $(".stats-and-actions").outerHeight();
                    if (h > calcH) {
                        $("#player, .dynamic-player object, .dynamic-player video").attr('style', 'height: '+ ($(window).height() - $(".stats-and-actions").outerHeight()) + 'px !important; width: 100% !important');
                        setTimeout(function() {
                            $("#main_col .tse-scroll-content").animate({
                                scrollTop: $("#broadcast-meta").outerHeight(true) - 10
                            }, 150, "swing");
                        }, 1000);
                    } else {
                        $("#player, .dynamic-player object, .dynamic-player video").attr('style', 'height: '+ h.toFixed(0) + 'px !important; width: 100% !important');
                        resizeTimer = setTimeout(function() {
                            $("#main_col .tse-scroll-content").animate({
                                scrollTop: 0
                            }, 150, "swing");
                            resizeTimer = false;
                        }, 1000);
                    }

                    var d = $("#broadcast-meta .info .title").width();
                    $("#broadcast-meta .info .title .real_title").width() > d ? $("#broadcast-meta .info").addClass("long_title") : $("#broadcast-meta .info").removeClass("long_title");
                    $("#channel_panels_contain").masonry("reload");
                }
            }

            $(document).mouseup(function (event) {
                if (resize === false) return;
                if (chatWidthStartingPoint) {
                    if (chatWidthStartingPoint === event.pageX) {
                        if ($("#right_col").css("display") !== "none") {
                            $("#right_col").css({
                                display: "none"
                            });
                            $("#right_close span").css({
                                "background-position": "0 0"
                            });
                            vars.chatWidth = 0;
                        }
                    } else {
                        vars.chatWidth = $("#right_col").width();
                    }
                } else {
                    vars.chatWidth = $("#right_col").width();
                }
                bttv.settings.save("chatWidth", vars.chatWidth);

                resize = false;
                handleResize();
            });

            $(document).on('mousedown', '#right_close, #right_col .resizer', function(event) {
                event.preventDefault();
                resize = event.pageX;
                chatWidthStartingPoint = event.pageX;
                $("#chat_text_input").focus();
                if ($("#right_col").css("display") === "none") {
                    $("#right_col").css({
                        display: "inherit"
                    });
                    $("#right_close span").css({
                        "background-position": "0 -18px"
                    });
                    resize = false;
                    if ($("#right_col").width() < 340) {
                        $("#right_col").width($("#right_col .top").width());
                    }
                    vars.chatWidth = $("#right_col").width();
                    bttv.settings.save("chatWidth", vars.chatWidth);
                    handleResize();
                }
            });

            $(document).mousemove(function (event) {
                if (resize) {
                    $("#chat_text_input").focus();
                    if (vars.chatWidth + resize - event.pageX < 340) {
                        $("#right_col").width(340);
                        $("#right_col #chat").width(340);
                        $("#right_col .top").width(340);

                        handleResize();
                    } else if (vars.chatWidth + resize - event.pageX > 541) {
                        $("#right_col").width(541);
                        $("#right_col #chat").width(541);
                        $("#right_col .top").width(541);

                        handleResize();
                    } else {
                        $("#right_col").width(vars.chatWidth + resize - event.pageX);
                        $("#right_col #chat").width(vars.chatWidth + resize - event.pageX);
                        $("#right_col .top").width(vars.chatWidth + resize - event.pageX);

                        handleResize();
                    }
                }
            });

            $(window).off("fluid-resize");
            $(window).off("resize").resize(function () {
                debug.log("Debug: Resize Called");
                setTimeout(handleResize, 1000);
            });
        }

        if (bttv.settings.get["chatWidth"] && bttv.settings.get["chatWidth"] < 0) {
            bttv.settings.save("chatWidth", 0);
        }

        var layout = bttv.storage.getObject('TwitchCache:Layout');

        if(layout.resource && layout.resource.isRightColumnClosedByUserAction === true) {
            bttv.settings.save("chatWidth", 0);
            if ($("#right_col").width() == "0") {
                $("#right_col").width("340px");
            }
            layout.resource.isRightColumnClosedByUserAction = false;

            bttv.storage.putObject('TwitchCache:Layout', layout);
        }

        if($('#right_col .resizer').length === 0) $('#right_col').append("<div class='resizer' onselectstart='return false;' title='Drag to enlarge chat =D'></div>");
        $("#right_col:before").css("margin-left", "-1");

        $("#right_col .bottom #controls #control_buttons .primary_button").css({
            float: 'right',
            marginRight: '-1px' 
        });
        $("#right_nav").css({
            'margin-left': 'auto',
            'margin-right': 'auto',
            'width': '321px',
            'float': 'none',
            'border': 'none'
        });
        $('#right_col .top').css('border-bottom', '1px solid rgba(0, 0, 0, 0.25)')

        $("#right_close").unbind('click');
        $("#right_close").removeAttr('data-ember-action');

        $("#left_close").off('click').click(function () {
            $(window).trigger('resize');
        });

        if (bttv.settings.get("chatWidth") !== null) {
            vars.chatWidth = bttv.settings.get("chatWidth");

            if (vars.chatWidth == 0) {
                $("#right_col").css({
                    display: "none"
                });
                $("#right_close span").css({
                    "background-position": "0 0"
                });
            } else {
                $("#right_col").width(vars.chatWidth);
                $("#right_col #chat").width(vars.chatWidth);
                $("#right_col .top").width(vars.chatWidth);
            }

            $(window).trigger('resize');
        } else {
            if ($("#right_col").width() == "0") {
                $("#right_col").width("340px");

            }
            vars.chatWidth = $("#right_col").width();
            bttv.settings.save("chatWidth", $("#right_col").width());
        }
    }

    var brand = function () {
        debug.log("Branding Site with Better & Importing Styles");

        // Old Site Header Logo Branding
        if ($("#header_logo").length) {
            $("#header_logo").html("<img alt=\"TwitchTV\" src=\"//cdn.betterttv.net/style/logos/black_twitch_logo.png\">");
            var $watermark = $('<img />');
            $watermark.attr('src', '//cdn.betterttv.net/style/logos/logo_icon.png');
            $watermark.css({
                'z-index': 9000,
                'margin-left': 22,
                'margin-top': -45,
                'float': 'left',
                'height': 18
            });
            $("#header_logo").append($watermark);
        }

        // New Site Logo Branding
        if ($("#large_nav #logo").length) {
            var $watermark = $('<img />');
            $watermark.attr('src', '//cdn.betterttv.net/style/logos/logo_icon.png');
            $watermark.css({
                'z-index': 9000,
                'margin-left': 68,
                'margin-top': 9,
                'float': 'left'
            });
            $("#large_nav #logo").append($watermark);
        }

        // Adds BTTV Settings Icon to Left Sidebar
        $(".column .content #you").append('<a class="bttvSettingsIcon" href="#"></a>');
        $(".bttvSettingsIcon").click(function(e){
            e.preventDefault();
            $('#chat_settings_dropmenu').hide();
            $('#bttvSettingsPanel').show("slow");
        })

        // Import Global BTTV CSS Changes
        var globalCSSInject = document.createElement("link");
        globalCSSInject.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv.css?"+bttv.info.versionString());
        globalCSSInject.setAttribute("type", "text/css");
        globalCSSInject.setAttribute("rel", "stylesheet");
        $("body").append(globalCSSInject);

        if (bttv.settings.get("showChatIndentation") !== false) {
            $addCSS = $('<style></style>');
            $addCSS.attr('id', 'bttvChatIndentation');
            $addCSS.html('#chat_line_list .line p { padding-left: 16px;text-indent: -16px; }');
            $('body').append($addCSS);
        }

        // Import Blue Button CSS
        if (bttv.settings.get("showPurpleButtons") !== true) {
            cssBlueButtons();
        }

        // Small Popout/Embed Chat Fixes
        $("body#chat").css("overflow-y", "hidden");
        $('#chat_loading_spinner').attr('src', "data:image/gif;base64,R0lGODlhFgAWAPMGANfX1wAAADc3N1tbW6Ojo39/f2tra8fHx9nZ2RsbG+np6SwsLEtLS4eHh7q6ugAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hoiQ3JlYXRlZCB3aXRoIENoaW1wbHkuY29tIgAh+QQJCgAGACwAAAAAFgAWAAAEbNCESY29OEvBRdDgFXReGI7dZ2oop65YWypIjSgGbSOW/CGAIICnEAIOPdLPSDQiNykDUNgUPn1SZs6ZjE6D1eBVmaVurV1XGXwWp0vfYfv4XpqLaKg6HqbrZzs4OjZ1MBlYhiJkiYWMfy+GEQAh+QQJCgAGACwAAAAAFgAWAAAEctDIKYO9NKe9lwlCKAQZlQzo4IEiWUpnuorjC6fqR7tvjM4tgwJBJN5kuqACwGQef8kQadkEPHMsqbBqNfiwu231CtRSm+Ro7ez04sprbjobH7uR9Kn8Ds2L0XxgSkVGgXA8JV+HNoZqiBocCYuMJX4vEQAh+QQJCgAAACwAAAAAFgAWAAAEcxDISWu4uNLEOwhCKASSGA5AMqxD8pkkIBR0gaqsC4rxXN+s1otXqtlSQR2s+EPmhqGeEfjcRZk06kpJlE2dW+gIe8SFrWNv0yxES9dJ8TsLbi/VdDb3ii/H3WRadl0+eX93hX5ViCaCe2kaKR0ccpGWlREAIfkECQoAAQAsAAAAABYAFgAABHUwyEmrvTisxHlmQigw2mAOiWSsaxMwRVyQy4mqRE64sEzbqYBBt3vJZqVTcKjjHX9KXNPoS5qWRGe1FhVmqTHoVZrThq0377R35o7VZTDSnWbG2XMguYgX1799aFhrT4J7ZnldLC1yfkEXICKOGRcbHY+UlBEAIfkECQoAAQAsAAAAABYAFgAABHIwyEmrvThrOoQXTFYYpFEEQ6EWgkS8rxMUMHGmaxsQR3/INNhtxXL5frPaMGf0AZUooo7nTAqjzN3xecWpplvra/lt9rhjbFlbDaa9RfZZbFPHqXN3HQ5uQ/lmSHpkdzVoe1IiJSZ2OhsTHR8hj5SVFREAIfkECQoAAQAsAAAAABYAFgAABGowyEmrvTjrzWczIJg5REk4QWMShoQAMKAExGEfRLq2QQzPtVtOZeL5ZLQbTleUHIHK4c7pgwqZJWM1eSVmqTGrTdrsbYNjLAv846a9a3PYvYRr5+j6NPDCR9U8FyQmKHYdHiEih4uMjRQRACH5BAkKAAEALAAAAAAWABYAAARkMMhJq7046807d0QYSkhZKoFiIqhzvAchATSNIjWABC4sBznALbfrvX7BYa0Ii81yShrT96xFdbwmEhrALbNUINcrBR+rti7R7BRb1V9jOwkvy38rVmrV0nokICI/f4SFhocSEQAh+QQJCgABACwAAAAAFgAWAAAEWjDISau9OOvNu7dIGCqBIiKkeUoH4AIk8gJIOR/sHM+1cuev3av3C7SCAdnQ9sIZdUke0+U8uoQuYhN4jS592ydSmZ0CqlAyzYweS8FUyQlVOqXmn7x+z+9bIgA7");

        // Run Beta Chat After BTTV CSS
        betaChat();
    }

    var betaChat = function () {
        if (bttv.settings.get("bttvChat") === true && vars.userData.isLoggedIn) {

            if($("body#chat").length || $('body[data-page="ember#chat"]').length) return;

            debug.log("Running Beta Chat");

            if(!vars.betaChatLoaded) {
                vars.betaChatLoaded = true;
                $.getJSON("//chat.betterttv.net/login.php?onsite=true&user="+vars.userData.login+"&callback=?", function(d) {

                    if(d.status === true) {
                        debug.log("Logged into BTTV Chat");
                    } else {
                        debug.log("Not logged into BTTV Chat");
                    }

                    var chatDJSInject = document.createElement("script");
                    chatDJSInject.setAttribute("src", "//chat.betterttv.net/client/external.php?type=djs");
                    chatDJSInject.setAttribute("type", "text/javascript");
                    $("body").append(chatDJSInject);

                    setTimeout(function() {
                        var chatJSInject = document.createElement("script");
                        chatJSInject.setAttribute("src", "//chat.betterttv.net/client/external.php?type=js");
                        chatJSInject.setAttribute("type", "text/javascript");
                        $("body").append(chatJSInject);
                    }, 5000);

                });

                var chatCSSInject = document.createElement("link");
                chatCSSInject.setAttribute("href", "//chat.betterttv.net/client/external.php?type=css");
                chatCSSInject.setAttribute("type", "text/css");
                chatCSSInject.setAttribute("id", "arrowchat_css");
                chatCSSInject.setAttribute("rel", "stylesheet");
                $("head").append(chatCSSInject);

                jqac = $;
            }

            if(!bttv.getChannel()) return;
            $('body').append("<style>.ember-chat .chat-interface .textarea-contain { bottom: 70px !important; } .ember-chat .chat-interface .chat-buttons-container { top: 75px !important; } .ember-chat .chat-interface { height: 140px; } .ember-chat .chat-messages { bottom: 140px; } .ember-chat .chat-settings { bottom: 68px; } .ember-chat .emoticon-selector { bottom: 135px !important; }</style>");
        }
    }

    var checkMessages = function () {
        debug.log("Check for New Messages");

        if($("body#chat").length) return;

        if (vars.userData.isLoggedIn && window.Firebase) {
            var newMessages = function(id, namespaced) {
                var notificationsLoaded = false;
                var notifications = 0;
                namespaced.child("users/" + id + "/messages").on("value", function (f) {
                    var f = f.val() || {}, j = f.unreadMessagesCount;
                    $(".js-unread_message_count").text(j || "");
                    j ? $(".js-unread_message_count").show() : $(".js-unread_message_count").hide();
                    if (notificationsLoaded === true && notifications < j) {
                        $.get('/inbox', function (data) {
                            var $message = $(data).find("#message-list .unread:first");
                                
                            if ($message) {
                                var $senderData = $message.children("div.from_to_user"),
                                    $messageData = $message.children("div.message_data"),
                                    url = "http://www.twitch.tv"+$messageData.children(".message_subject").attr("href"),
                                    avatar = $senderData.children(".prof").children("img").attr("src"),
                                    sender = $senderData.children(".capital").text().capitalize();
                            } else {
                                var url = "http://www.twitch.tv/inbox",
                                    avatar = "//www-cdn.jtvnw.net/images/xarth/404_user_50x50.png",
                                    sender = "Someone";
                            }
                            bttv.notify(sender+' just sent you a Message!\nClick here to view it.', 'Twitch Message Received', url, avatar, 'new_message_'+sender);
                        });
                    }
                    notifications = j;
                    notificationsLoaded = true;
                    if (notifications > 0 && document.getElementById("header_logo")) {
                        if (document.getElementById("messagescount")) {
                            document.getElementById("messagescount").innerHTML = notifications;
                        } else {
                            var messagesnum = document.createElement("a");
                            var header_following = document.getElementById("header_following");
                            messagesnum.setAttribute("id", "messagescont");
                            messagesnum.setAttribute("href", "/inbox");
                            messagesnum.setAttribute("class", "normal_button");
                            messagesnum.setAttribute("style", "margin-right: 10px;");
                            messagesnum.innerHTML = "<span id='messagescount' style='padding-left:28px;background-image:url(//cdn.betterttv.net/style/icons/messages.png);background-position: 8px 4px;padding-top:-1px;background-repeat: no-repeat;color:black;'>" + notifications + "</span>";
                            header_following.parentNode.insertBefore(messagesnum, header_following);
                        }
                    } else {
                        if (document.getElementById("messagescont")) document.getElementById("messagescont").remove();
                    }
                });
            }
            window.getFirebase().then(function(e) {
                Twitch.user(function(d) {
                    newMessages(d.id, e.namespaced);
                });
            });
        }

    }

    var cssBlueButtons = function () {
        debug.log("Turning Purple to Blue");

        var globalCSSInject = document.createElement("style");
        globalCSSInject.setAttribute("type", "text/css");
        globalCSSInject.setAttribute("id", "bttvBlueButtons");
        globalCSSInject.innerHTML = "#large_nav .game_filter.selected a { border-left: 4px solid #374a9b !important; } button.primary, .button-simple.primary, .primary_button:hover, .primary_button:focus, #subscribe_action .subscribe-text:hover, #subscribe_action .subscribe-text:focus { background: linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%) !important; background: -o-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%) !important; background: -moz-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%) !important; background: -webkit-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%) !important; background: -ms-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%) !important; } button.primary, .primary_button, #subscribe_action .subscribe-text {border-color: #000 !important;background: linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%) !important; background: -o-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%) !important; background: -moz-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%) !important; background: -webkit-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%) !important; background: -ms-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%) !important; }#team_member_list .page_links a, .page_links span.next_page b, .page_links a.next_page b, #main_col .messages div.preview.unread {border-left-color: #374a9b !important;}#team_member_list .page_links a b.left {border-left-color: #374a9b !important;}#team_member_list .page_links a b.right, .page_links span.previous_page b, .page_links a.previous_page b {border-right-color: #374a9b !important;}";
        $("body").append(globalCSSInject);
    }

    var directoryFunctions = function () {

        if(bttv.settings.get("showDirectoryLiveTab") === true && $('h2.title:contains("Channels You Follow")').length && $('a.active:contains("Overview")').length) {

            debug.log("Changing Directory View");

            $('a:contains("Live Channels")').click();

        }

        if(vars.watchScroll) return;
        vars.watchScroll = $("#main_col .tse-scroll-content").scroll(function() {
            var scrollHeight = $("#main_col .tse-scroll-content")[0].scrollHeight - $("#main_col .tse-scroll-content").height(),
                scrollTop = $("#main_col .tse-scroll-content").scrollTop(),
                distanceFromBottom = scrollHeight - scrollTop;

            if(distanceFromBottom < 251) {
                if($("#directory-list a.list_more .spinner").length) return;
                $("#directory-list a.list_more").click();
            }
        });
    }

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

    var checkFollowing = function () {

        debug.log("Check Following List");

        if($("body#chat").length || $('body[data-page="ember#chat"]').length || !vars.userData.isLoggedIn) return;

        var fetchFollowing = function(callback, followingList, followingNames, offset) {
            var followingList = followingList || [],
                followingNames = followingNames || [],
                offset = offset || 0;

            Twitch.api.get("streams/followed?limit=100&offset="+offset).done(function (d) {
                if (d.streams && d.streams.length > 0) {
                    d.streams.forEach(function(stream) {
                        if(followingNames.indexOf(stream.channel.name) === -1) {
                            followingNames.push(stream.channel.name);
                            followingList.push(stream);
                        }
                    });
                    if(d.streams.length === 100) {
                        fetchFollowing(function(followingList) {
                            callback(followingList);
                        }, followingList, followingNames, offset+100);
                    } else {
                        callback(followingList);
                    }
                } else {
                    callback(followingList);
                }
            });
        }

        fetchFollowing(function(streams) {
            if (vars.liveChannels.length === 0) {
                vars.liveChannels.push("loaded");
                streams.forEach(function(stream) {
                    var channel = stream.channel;
                    if (vars.liveChannels.indexOf(channel.name) === -1) {
                        vars.liveChannels.push(channel.name);
                    }
                });
            } else if(streams.length > 0) {
                var channels = [];
                streams.forEach(function(stream) {
                    var channel = stream.channel;
                    channels.push(channel.name);
                    if (vars.liveChannels.indexOf(channel.name) === -1) {
                        debug.log(channel.name+" is now streaming");
                        if (channel.game == null) channel.game = "on Twitch";
                        bttv.notify(channel.display_name + ' just started streaming ' + channel.game + '.\nClick here to head to ' + channel.display_name + '\'s channel.', channel.display_name + ' is Now Streaming', channel.url, channel.logo, 'channel_live_'+channel.name);
                    }
                });
                vars.liveChannels = channels;
            }

            if(!$("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"] .js-total").length) {
                $("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"]").append('<span class="total_count js-total" style="display: none;"></span>');
            }
            $("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"] .js-total").text(streams.length);
            $("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"] .js-total").css("display","inline");

            setTimeout(checkFollowing, 60000);
        });

    }

    var checkBroadcastInfo = function () {

        var channel = bttv.getChannel();

        if(!channel) return;

        debug.log("Check Channel Title/Game");

        Twitch.api.get("channels/"+channel).done(function (d) {
            if (d.game && d.status) {
                $("#channel #broadcast-meta .js-game").text(d.game).attr("href",Twitch.uri.game(d.game));
            }
            setTimeout(checkBroadcastInfo, 60000);
        });

    }

    var overrideEmotes = function () {

        if (vars.emotesLoaded) return;

        debug.log("Overriding Twitch Emoticons");

        var betterttvEmotes = [
                                { url: "//cdn.betterttv.net/emotes/trollface.png", width: 23, height: 19, regex: "(\\:trollface\\:|\\:tf\\:)" },
                                { url: "//cdn.betterttv.net/emotes/cry.png", width: 19, height: 19, regex: "\\:'\\(" },
                                { url: "//cdn.betterttv.net/emotes/puke.png", width: 19, height: 19, regex: "\\(puke\\)" },
                                { url: "//cdn.betterttv.net/emotes/mooning.png", width: 19, height: 19, regex: "\\(mooning\\)" },
                                { url: "//cdn.betterttv.net/emotes/poolparty.png", width: 19, height: 19, regex: "\\(poolparty\\)" },
                                { url: "//cdn.betterttv.net/emotes/kona.png", width: 25, height: 34, regex: "KKona" },
                                { url: "//cdn.betterttv.net/emotes/foreveralone.png", width: 29, height: 30, regex: "ForeverAlone" },
                                { url: "//cdn.betterttv.net/emotes/chez.png", width: 32, height: 35, regex: "TwaT" },
                                { url: "//cdn.betterttv.net/emotes/black.png", width: 26, height: 30, regex: "RebeccaBlack" },
                                { url: "//cdn.betterttv.net/emotes/rage.png", width: 33, height: 30, regex: "RageFace" },
                                { url: "//cdn.betterttv.net/emotes/striker.png", width: 44, height: 35, regex: "rStrike" },
                                { url: "//cdn.betterttv.net/emotes/chaccept.png", width: 23, height: 34, regex: "CHAccepted" },
                                { url: "//cdn.betterttv.net/emotes/fuckyea.png", width: 45, height: 34, regex: "FuckYea" },
                                { url: "//cdn.betterttv.net/emotes/namja.png", width: 37, height: 40, regex: "ManlyScreams" },
                                { url: "//cdn.betterttv.net/emotes/pancakemix.png", width: 22, height: 30, regex: "PancakeMix" },
                                { url: "//cdn.betterttv.net/emotes/pedobear.png", width: 32, height: 30, regex: "PedoBear" },
                                { url: "//cdn.betterttv.net/emotes/genie.png", width: 25, height: 35, regex: "WatChuSay" },
                                { url: "//cdn.betterttv.net/emotes/pedonam.png", width: 37, height: 40, regex: "PedoNam" },
                                { url: "//cdn.betterttv.net/emotes/nam.png", width: 38, height: 40, regex: "NaM" },
                                { url: "//cdn.betterttv.net/emotes/luda.png", width: 36, height: 34, regex: "LLuda" },
                                { url: "//cdn.betterttv.net/emotes/updog.png", width: 32, height: 32, regex: "iDog" },
                                { url: "//cdn.betterttv.net/emotes/blackhawk.png", width: 33, height: 34, regex: "iAMbh" },
                                { url: "//cdn.betterttv.net/emotes/sdaw.png", width: 24, height: 34, regex: "ShoopDaWhoop" },
                                { url: "//cdn.betterttv.net/emotes/hydro.png", width: 22, height: 34, regex: "HHydro" },
                                { url: "//cdn.betterttv.net/emotes/chanz.png", width: 37, height: 40, regex: "OhGodchanZ" },
                                { url: "//cdn.betterttv.net/emotes/ohgod.png", width: 31, height: 34, regex: "OhGod" },
                                { url: "//cdn.betterttv.net/emotes/fapmeme.png", width: 35, height: 35, regex: "FapFapFap" },
                                { url: "//cdn.betterttv.net/emotes/socal.png", width: 100, height: 40, regex: "iamsocal" },
                                { url: "//cdn.betterttv.net/emotes/herbert.png", width: 29, height: 34, regex: "HerbPerve" },
                                { url: "//cdn.betterttv.net/emotes/panda.png", width: 36, height: 40, regex: "SexPanda" },
                                { url: "//cdn.betterttv.net/emotes/mandm.png", width: 36, height: 30, regex: "M&Mjc" },
                                { url: "//cdn.betterttv.net/emotes/jokko.png", width: 23, height: 35, regex: "SwedSwag" },
                                { url: "//cdn.betterttv.net/emotes/pokerface.png", width: 23, height: 35, regex: "PokerFace" },
                                { url: "//cdn.betterttv.net/emotes/jamontoast.png", width: 33, height: 30, regex: "ToasTy" },
                                { url: "//cdn.betterttv.net/emotes/basedgod.png", width: 33, height: 34, regex: "BasedGod" },
                                { url: "//cdn.betterttv.net/emotes/fishmoley.png", width: 56, height: 34, regex: "FishMoley" },
                                { url: "//cdn.betterttv.net/emotes/angry.png", width: 27, height: 35, regex: "cabbag3" },
                                { url: "//cdn.betterttv.net/emotes/snatchy.png", width: 21, height: 35, regex: "OhhhKee" },
                                { url: "//cdn.betterttv.net/emotes/sourpls.gif", width: 40, height: 40, regex: "SourPls" },
                                { url: "//cdn.betterttv.net/emotes/stray.png", width: 45, height: 35, regex: "She'llBeRight" },
                                { url: "//cdn.betterttv.net/emotes/taxi.png", width: 87, height: 30, regex: "TaxiBro" },
                                { url: "//cdn.betterttv.net/emotes/cookiethump.png", width: 29, height: 25, regex: "CookieThump" },
                                { url: "//cdn.betterttv.net/emotes/ohmygoodness.png", width: 20, height: 30, regex: "OhMyGoodness" },
                                { url: "//cdn.betterttv.net/emotes/jesssaiyan.png", width: 20, height: 30, regex: "JessSaiyan" },
                                { url: "//cdn.betterttv.net/emotes/yetiz.png", width: 60, height: 30, regex: "YetiZ" },
                                { url: "//cdn.betterttv.net/emotes/urn.png", width: 19, height: 30, regex: "UrnCrown" },
                                { url: "//cdn.betterttv.net/emotes/teh.png", width: 32, height: 20, regex: "tEh" },
                                { url: "//cdn.betterttv.net/emotes/cobalt.png", width: 46, height: 30, regex: "BroBalt" },
                                { url: "//cdn.betterttv.net/emotes/roll.png", width: 94, height: 20, regex: "RollIt!" },
                                { url: "//cdn.betterttv.net/emotes/mmmbutter.png", width: 25, height: 23, regex: "ButterSauce" },
                                { url: "//cdn.betterttv.net/emotes/baconeffect.png", width: 23, height: 28, regex: "BaconEffect" },
                                { url: "//cdn.betterttv.net/emotes/yolk.png", width: 28, height: 25, regex: "WhatAYolk" },
                                { url: "//cdn.betterttv.net/emotes/grip.png", width: 31, height: 30, regex: "CiGrip" },
                                { url: "//cdn.betterttv.net/emotes/danish.png", width: 29, height: 25, regex: "aPliS" },
                                { url: "//cdn.betterttv.net/emotes/datsauce.png", width: 32, height: 28, regex: "DatSauce" },
                                { url: "//cdn.betterttv.net/emotes/doge.png", width: 25, height: 25, regex: "ConcernDoge" },
                                { url: "//cdn.betterttv.net/emotes/hhehehe.png", width: 30, height: 21, regex: "Hhehehe" },
                                { url: "//cdn.betterttv.net/emotes/suchcrream.png", width: 32, height: 32, regex: "SuchFraud" },
                                { url: "//cdn.betterttv.net/emotes/vaughnrage.png", width: 32, height: 32, regex: "CandianRage" },
                                { url: "//cdn.betterttv.net/emotes/parappakappa.png", width: 28, height: 28, regex: "KaRappa" },
                                { url: "//cdn.betterttv.net/emotes/helix.png", width: 28, height: 28, regex: "HailHelix" },
                                { url: "//cdn.betterttv.net/emotes/juliacs.png", width: 28, height: 28, regex: "JuliAwesome" },
                                { url: "//cdn.betterttv.net/emotes/bttvnice.png", width: 42, height: 28, regex: "bttvNice" }
                              ];

        if (bttv.settings.get("showDefaultEmotes") !== true) {
            betterttvEmotes.push({
                url: "//cdn.betterttv.net/emotes/aww.png",
                width: 19,
                height: 19,
                regex: "D\\:"
            });
        }

        if (bttv.getChannel() === "bacon_donut" || bttv.getChannel() === "straymav") {
            betterttvEmotes.push({
                url: "//cdn.betterttv.net/emotes/bacondance.gif",
                width: 72,
                height: 35,
                regex: "AwwwYeah"
            });
            betterttvEmotes.push({
                url: "//cdn.betterttv.net/emotes/bacon.gif",
                width: 33,
                height: 35,
                regex: "BaconTime"
            });
        }

        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/blackappa.png",
            width: 25,
            height: 28,
            regex: "Blackappa",
            channel: "Night",
            emoticon_set: "night"
        });

        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/aplis.png",
            width: 48,
            height: 28,
            regex: "aplis!",
            channel: "Night",
            emoticon_set: "night"
        });

        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/badass.png",
            width: 42,
            height: 28,
            regex: "BadAss",
            channel: "Night",
            emoticon_set: "night"
        });

        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/dogewitit.png",
            width: 28,
            height: 28,
            regex: "DogeWitIt",
            channel: "Night",
            emoticon_set: "night"
        });

        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/batkappa.png",
            width: 32,
            height: 32,
            regex: "BatKappa",
            channel: "Night",
            emoticon_set: "night"
        });

        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/soserious.png",
            width: 23,
            height: 30,
            regex: "SoSerious",
            channel: "Night",
            emoticon_set: "night"
        });

        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/kaged.png",
            width: 28,
            height: 28,
            regex: "Kaged",
            channel: "Night",
            emoticon_set: "night"
        });

        if(bttv.getChannel() === "night") {
            betterttvEmotes.push({
                url: "//cdn.betterttv.net/emotes/nightbanned.gif",
                width: 71,
                height: 30,
                regex: "BanAplis",
                channel: "Night",
                emoticon_set: "night"
            });
        }

        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/blamen7.png",
            width: 24,
            height: 32,
            regex: "BlameN7",
            channel: "Blindfolded",
            emoticon_set: 1925
        });

        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/blindpls.gif",
            width: 28,
            height: 28,
            regex: "BlindPls",
            channel: "Blindfolded",
            emoticon_set: 1925
        });

        if(window.App && App.Channel && App.Channel.findOne(BetterTTV.getChannel()) && (App.Channel.findOne(BetterTTV.getChannel()).get('game') === "Battlefield 4" || App.Channel.findOne(BetterTTV.getChannel()).get('game') === "Battlefield 3")) {
            betterttvEmotes.push({
                url: "//cdn.betterttv.net/emotes/banned.gif",
                width: 53,
                height: 35,
                regex: "BanPls",
                channel: "Blindfolded",
                emoticon_set: 1925
            });
        }

        if(bttv.getChannel() === "ducksauce") {
            betterttvEmotes.push({
                url: "//cdn.betterttv.net/emotes/duckbutt.png",
                width: 28,
                height: 28,
                regex: "DuckButt",
                channel: "Ducksauce",
                emoticon_set: 94
            });
        }

        if(window.App && App.Channel && App.Channel.findOne(BetterTTV.getChannel()) && App.Channel.findOne(BetterTTV.getChannel()).get('game') === "Minecraft") {
            betterttvEmotes.push({
                url: "//cdn.betterttv.net/emotes/stick.gif",
                width: 30,
                height: 30,
                regex: "PunchStick",
                channel: "bacon_donut",
                emoticon_set: 172
            });   
        }

        var oldEmotes = [
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ebf60cd72f7aa600-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d570c4b3b8d8fc4d-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ae4e17f5b9624e2f-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-b9cbb6884788aa62-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-2cde79cfe74c6169-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-577ade91d46d7edc-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-374120835234cb29-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-cfaf6eac72fe4de6-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-e838e5e34d9f240c-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-3407bf911ad2fd4a-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-0536d670860bf733-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-8e128fa8dc1de29c-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d31223e81104544a-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-9f2ac5d4b53913d7-24x18.png"
        ];
        var newEmotes = [
            "//cdn.betterttv.net/emotes/jtv/happy.gif",
            "//cdn.betterttv.net/emotes/jtv/sad.gif",
            "//cdn.betterttv.net/emotes/jtv/surprised.gif",
            "//cdn.betterttv.net/emotes/jtv/bored.gif",
            "//cdn.betterttv.net/emotes/jtv/cool.gif",
            "//cdn.betterttv.net/emotes/jtv/horny.gif",
            "//cdn.betterttv.net/emotes/jtv/skeptical.gif",
            "//cdn.betterttv.net/emotes/jtv/wink.gif",
            "//cdn.betterttv.net/emotes/jtv/raspberry.gif",
            "//cdn.betterttv.net/emotes/jtv/winkberry.gif",
            "//cdn.betterttv.net/emotes/jtv/pirate.gif",
            "//cdn.betterttv.net/emotes/jtv/drunk.gif",
            "//cdn.betterttv.net/emotes/jtv/angry.gif",
            "//cdn.betterttv.net/emotes/mw.png"
        ];

        var emoteController = (window.Ember && window.App) ? (App.__container__.lookup("controller:emoticons") || false) : false;
        var emoticonSets = emoteController ? emoteController.get('emoticonSets') : {};
        var emoticons = emoteController ? emoteController.get('emoticons') : [];

        var _id = 0;
        var getId = function() { return 'bttv-'+(_id++); };

        vars.emotesLoaded = true;
        var cssString = "";
        if(vars.userData.isLoggedIn && bttv.chat.helpers.getEmotes(vars.userData.login)) {
            var user = vars.userData.login;
            var userEmoteSets = bttv.chat.helpers.getEmotes(vars.userData.login);
        } else {
            var user = false;
        }
        var moragEmote = false;
        emoticons.forEach(function (emote) {
            if(emote.images) {
                emote.images.forEach(function (image) {
                    if(!image.url) return;
                    if(oldEmotes.indexOf(image.url.replace("http://","https://")) !== -1 && bttv.settings.get("showDefaultEmotes") !== true) {
                        image.url = newEmotes[oldEmotes.indexOf(image.url.replace("http://","https://"))];
                        image.height = 22;
                        image.width = 22;
                        cssString += bttv.chat.templates.emoticonCss(image, image.id);
                    }

                    if(user && userEmoteSets.indexOf(image.emoticon_set) !== -1) {
                        var prefixRegex = /^([a-z]+)([0-9A-Z][0-9A-Za-z]+)$/,
                            rawCommand = prefixRegex.exec(emote.regex);

                        if(rawCommand) {
                            if(/^[a-zA-Z0-9]{5,}$/.test(rawCommand[2])) {
                                bttv.chat.store.autoCompleteEmotes[rawCommand[2]] = rawCommand[1]+rawCommand[2];
                            }
                        }
                    }

                    /* For tehMorag, because I can */
                    if(emote.regex === "tehBUFR") {
                        moragEmote = image.id;
                    }
                });
            }
        });
        if (bttv.settings.get("bttvEmotes") !== false) {
            betterttvEmotes.forEach(function (b) {
                var a = {};
                a.text = b.regex.replace(/\\/g,"").replace(/\((.*)\|(.*)\)/,"$1");
                b.regex.match(/^\w+$/) ? a.regex = new RegExp("\\b" + b.regex + "\\b", "g") : a.regex = new RegExp(b.regex, "g");
                a.channel = b.channel || "BetterTTV Emotes";
                a.badge = "//cdn.betterttv.net/tags/kappa.png";
                a.images = [];
                a.images.push({
                    emoticon_set: b.emoticon_set || null,
                    width: b.width,
                    height: b.height,
                    url: b.url
                });
                if(a.text === "SourPls") {
                    a.hidden = true;
                }
                a.images.forEach(function (c) {
                    var id = getId();
                    cssString += bttv.chat.templates.emoticonCss(c, id);
                    var imageObject = {
                        cls: "emo-"+id,
                        isEmoticon: true,
                        regex: a.regex,
                    }
                    if(emoticonSets) {
                        c.emoticon_set ? (emoticonSets[c.emoticon_set] === undefined && (emoticonSets[c.emoticon_set] = []), emoticonSets[c.emoticon_set].push(imageObject)) : emoticonSets['default'].push(imageObject);
                    }
                });
                emoticons.push(a);
            });
        }
        $("body").on('mouseover', '.chat-line span.emoticon', function() {
            vars.hoveringEmote = $(this);
            $(this).tipsy({
                trigger: 'manual',
                gravity: "sw",
                live: false,
                html: true,
                fallback: function() {
                    var $emote = vars.hoveringEmote;
                    if($emote && $emote.data('regex')) {
                        var raw = decodeURIComponent($emote.data('regex').split(' ').join(''));
                        if($emote.data('channel')) {
                            return "Emote: "+raw+"<br />Channel: "+$emote.data('channel');
                        } else {
                            return raw;
                        }
                    } else {
                        return "Kappab"
                    }
                }
            });
            $(this).tipsy("show");
            if($(this).data('channel')) {
                $(this).css('cursor','pointer');
            }
        }).on('mouseout', '.chat-line span.emoticon', function() {
            $(this).tipsy("hide");
            if($(this).data('channel')) {
                $(this).css('cursor','normal');
            }
            $('div.tipsy.tipsy-sw').remove();
        }).on('click', '.chat-line span.emoticon', function() {
            if($(this).data('channel')) {
                window.open('http://www.twitch.tv/'+$(this).data('channel'),'_blank');
            }
        });
        
        $('#bttvEmotes').remove();
        cssString += ".emoticon { display: inline-block; }";
        if(moragEmote !== false) {
            var spinner = "emo-"+moragEmote;
            cssString += '@keyframes "spinner"{from{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-o-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}@-moz-keyframes spinner{from{-moz-transform:rotate(0);transform:rotate(0)}to{-moz-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes "spinner"{from{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-ms-keyframes "spinner"{from{-ms-transform:rotate(0);transform:rotate(0)}to{-ms-transform:rotate(360deg);transform:rotate(360deg)}}@-o-keyframes "spinner"{from{-o-transform:rotate(0);transform:rotate(0)}to{-o-transform:rotate(360deg);transform:rotate(360deg)}}.spinner{-webkit-animation:spinner 1.5s linear infinite;-moz-animation:spinner 1.5s linear infinite;-ms-animation:spinner 1.5s linear infinite;-o-animation:spinner 1.5s linear infinite;animation:spinner 1.5s linear infinite}'.replace(/spinner/g, spinner);
        }
        var emoteCSS = document.createElement("style");
        emoteCSS.setAttribute("type", "text/css");
        emoteCSS.setAttribute("id", "bttvEmotes");
        emoteCSS.innerHTML = cssString;
        $('body').append(emoteCSS);
    }

    var handleBackground = function (tiled) {
        var tiled = tiled || false;

        var canvasID = 'custom-bg';

        if($("#"+canvasID).length === 0) {
            var $bg = $('<canvas />');
                $bg.attr('id', canvasID);
            $('#channel').prepend($bg);
        }

        App.Panel.find("user", { user: bttv.getChannel() } ).get('content').forEach(function(panel) {
            var url = panel.get('data').link;
            if(url && url.indexOf('#BTTV#') !== -1) {
                var options = {};
                var queryString = url.split('#BTTV#')[1];
                var list = queryString.split('=');

                for(var i=0; i<list.length; i+=2) {
                    options[list[i]] = list[i+1];
                }

                if(options['bg']) {
                    $("#"+canvasID).attr('image', options['bg']);
                }
            }
        });

        if(tiled) {
            $("#"+canvasID).addClass('tiled');
        } else {
            if($("#"+canvasID).attr("image")) {
                var img = new Image();
                img.onload = function() {
                    if(img.naturalWidth < $('#main_col').width()) {
                        setTimeout(function(){
                            handleBackground(true);
                        }, 2000);
                    }
                }
                img.src = $("#"+canvasID).attr("image");
            }
        }

        var g = $("#"+canvasID),
            d = g[0];
        if (d && d.getContext) {
            var c = d.getContext("2d"),
                h = $("#"+canvasID).attr("image");
            if (!h) {
                $(d).css("background-image", "");
                c.clearRect(0, 0, d.width, d.height);
            } else if (g.css({
                width: "100%",
                "background-position": "center top"
            }), g.hasClass("tiled")) {
                g.css({
                    "background-image": 'url("' + h + '")'
                }).attr("width", 200).attr("height", 200);
                d = c.createLinearGradient(0, 0, 0, 200);
                if (bttv.settings.get("darkenedMode") === true) {
                    d.addColorStop(0, "rgba(20,20,20,0.4)");
                    d.addColorStop(1, "rgba(20,20,20,1)");
                } else {
                    d.addColorStop(0, "rgba(245,245,245,0.65)");
                    d.addColorStop(1, "rgba(245,245,245,1)");
                }
                c.fillStyle = d;
                c.fillRect(0, 0, 200, 200);
            } else {
                var i = document.createElement("IMG");
                i.onload = function () {
                    var a = this.width,
                        d = this.height,
                        h;
                    g.attr("width", a).attr("height", d);
                    c.drawImage(i, 0, 0);
                    if (bttv.settings.get("darkenedMode") === true) {
                        d > a ? (h = c.createLinearGradient(0, 0, 0, a), h.addColorStop(0, "rgba(20,20,20,0.4)"), h.addColorStop(1, "rgba(20,20,20,1)"), c.fillStyle = h, c.fillRect(0, 0, a, a), c.fillStyle = "rgb(20,20,20)", c.fillRect(0, a, a, d - a)) : (h = c.createLinearGradient(0, 0, 0, d), h.addColorStop(0, "rgba(20,20,20,0.4)"), h.addColorStop(1, "rgba(20,20,20,1)"), c.fillStyle = h, c.fillRect(0, 0, a, d))
                    } else {
                        d > a ? (h = c.createLinearGradient(0, 0, 0, a), h.addColorStop(0, "rgba(245,245,245,0.65)"), h.addColorStop(1, "rgba(245,245,245,1)"), c.fillStyle = h, c.fillRect(0, 0, a, a), c.fillStyle = "rgb(245,245,245)", c.fillRect(0, a, a, d - a)) : (h = c.createLinearGradient(0, 0, 0, d), h.addColorStop(0, "rgba(245,245,245,0.65)"), h.addColorStop(1, "rgba(245,245,245,1)"), c.fillStyle = h, c.fillRect(0, 0, a, d))
                    }
                };
                i.src = h;
            }
        }
    };

    var darkenPage = function () {

        var $body = $('body');

        /* Twitch broke BGs */
        setTimeout(handleBackground, 1000);

        if(bttv.settings.get("darkenedMode") !== true || !$body.attr('data-page')) return;

        debug.log("Darkening Page");

        var pageKind = $('body').data('page').split('#')[0],
            pageType = $('body').data('page').split('#')[1] || "none",
            allowedPages = ['ember', 'message', 'dashboards', 'chat', 'chapter', 'archive', 'channel', 'user'];

        if(allowedPages.indexOf(pageKind) !== -1) {

            if(pageKind === "dashboards" && pageType !== "show") return;

            var darkCSS = document.createElement("link");
            darkCSS.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-dark.css?"+bttv.info.versionString());
            darkCSS.setAttribute("type", "text/css");
            darkCSS.setAttribute("rel", "stylesheet");
            darkCSS.setAttribute("id", "darkTwitch");
            $('body').append(darkCSS);

            $("#main_col .content #stats_and_actions #channel_stats #channel_viewer_count").css("display", "none");
            //setTimeout(handleBackground, 1000);

            // Messages Delete Icon Fix
            $('#main_col .messages img[src="http://www-cdn.jtvnw.net/images/xarth/g/g18_trash-00000080.png"]').attr("src", "//cdn.betterttv.net/style/icons/delete.png");
            $('#main_col .messages img[src="http://www-cdn.jtvnw.net/images/xarth/g/g16_trash-00000020.png"]').attr("src", "//cdn.betterttv.net/style/icons/delete.png").attr("width","16").attr("height","16");
        }

    }

    var splitChat = function () {

        if (bttv.settings.get("splitChat") !== false) {

            debug.log("Splitting Chat");

            var splitCSS = document.createElement("link");
            bttv.settings.get("darkenedMode") === true ? splitCSS.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-split-chat-dark.css") : splitCSS.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-split-chat.css");
            splitCSS.setAttribute("type", "text/css");
            splitCSS.setAttribute("rel", "stylesheet");
            splitCSS.setAttribute("id", "splitChat");
            $('body').append(splitCSS);
        }

    }

    var flipDashboard = function () {

        if ($("#dash_main").length && bttv.settings.get("flipDashboard") === true) {

            debug.log("Flipping Dashboard");

            // We want to move the chat to the left, and the dashboard controls to the right.
            $("#controls_column, #player_column").css({
                float: "right",
                marginLeft: "500px"
            });
            $("#chat,iframe").css({
                float: "left",
                left: "20px",
                right: ""
            });

        }

    }

    var formatDashboard = function () {

        if ($("#dash_main").length) {

            debug.log("Formatting Dashboard");

            // Move Page Elements to Sub-DIV & Account for Changes
            $('<div style="position:relative;" id="bttvDashboard"></div>').appendTo('#dash_main');
            $("#dash_main #controls_column").appendTo("#bttvDashboard");
            $("#dash_main #player_column").appendTo("#bttvDashboard");
            $("#dash_main iframe").css("top",
                (bttv.settings.get('darkenedMode') ? 11 : 0)+
                (($('.js-broadcaster-message').css('display') !== 'none') ? $('.js-broadcaster-message').outerHeight(true) : 0)+
                $('#dashboard_title').outerHeight(true)+
                $('#setup_link').outerHeight(true)+
                $('#dash_nav').outerHeight(true)+
                $('#stream-config-status').outerHeight(true)
            ).css("border","none");
            if($("#dash_main iframe").length) {
                $("#dash_main iframe")[0].style.height = "514px";
                $("#dash_main iframe")[0].src = "/"+bttv.getChannel()+"/chat?bttvDashboard=true";
            }

            // Small Dashboard Fixes
            $("#commercial_options .dropmenu_action[data-length=150]").text("2m 30s");
            $("#controls_column #form_submit button").attr("class", "primary_button");

        }

    }

    var dashboardChannelInfo = function () {

        if ($("#dash_main").length) {

            debug.log("Updating Dashboard Channel Info");

            Twitch.api.get("streams/" + bttv.getChannel()).done(function (a) {
                if (a.stream) {
                    $("#channel_viewer_count").text(Twitch.display.commatize(a.stream.viewers));
                    if(a.stream.channel.views) $("#views_count").html(Twitch.display.commatize(a.stream.channel.views));
                } else {
                    $("#channel_viewer_count").text("Offline");
                }
            });
            Twitch.api.get("channels/" + bttv.getChannel() + "/follows?limit=1").done(function (a) {
                if (a["_total"]) {
                    $("#followers_count").text(Twitch.display.commatize(a["_total"]));
                }
            });
            if(!$("#chatters_count").length) {
                var $chattersContainer = $("<span></span>");
                $chattersContainer.attr("class", "stat");
                $chattersContainer.attr("id", "chatters_count");
                $chattersContainer.attr("tooltipdata", "Chatters");
                $chattersContainer.text('0');
                $("#followers_count").after($chattersContainer);
                if($("#commercial_buttons").length) $("#followers_count").after('<div style="margin-top:5px;"> </div>');
            }

            $.getJSON('http://tmi.twitch.tv/group/user/' + bttv.getChannel() + '/chatters?callback=?', function(data) {
                if(data.data && data.data.chatter_count) $("#chatters_count").text(Twitch.display.commatize(data.data.chatter_count));
            });

            if(vars.dontCheckSubs !== true) {
                $.get('/broadcast/dashboard/partnership', function (data) {
                    var $subsContainer = $(data).find("div.main div.wrapper"),
                        subsRegex = /Your channel currently has ([0-9,]+) paying subscribers and ([0-9,]+) total active subscribers/;
                        
                    if ($subsContainer) {
                        var containerText = $subsContainer.text();

                        if(containerText.match(subsRegex)) {
                            var subAmounts = subsRegex.exec(containerText),
                                activeSubs = subAmounts[2];

                            if(!$("#channel_subs_count").length) {
                                var $subsContainer = $("<span></span>");
                                $subsContainer.attr("class", "stat");
                                $subsContainer.attr("id", "channel_subs_count");
                                $subsContainer.attr("tooltipdata", "Active Subscribers");
                                $subsContainer.text(Twitch.display.commatize(activeSubs));
                                $("#chatters_count").after($subsContainer);

                                Twitch.api.get("chat/" + bttv.getChannel() + "/badges").done(function (a) {
                                    if (a.subscriber) {
                                        $("#channel_subs_count").css("background", "url("+a.subscriber.image+") no-repeat left center");
                                        $("#channel_subs_count").css("background-size", "14px 14px");
                                    }
                                });
                            } else {
                                $("#channel_subs_count").text(Twitch.display.commatize(activeSubs));
                            }
                        } else {
                            vars.dontCheckSubs = true;
                            debug.log("Dashboard Info -> Channel doesn't have subscribers.");
                        }
                    } else {
                        debug.warn("Dashboard Info -> Error loading partnership page.");
                    }
                });
            }

            setTimeout(dashboardChannelInfo, 60000);
        }

    }

    var giveawayCompatibility = function () {

        if ($("#dash_main").length) {

            debug.log("Giveaway Plugin Dashboard Compatibility");

            $(".tga_modal").appendTo("#bttvDashboard");
            $(".tga_button").click(function () {
                if (bttv.settings.get("flipDashboard") === true) {
                    $("#chat").width("330px");
                    $(".tga_modal").css("right", "0px");
                } else {
                    $("#chat").width("330px");
                    $(".tga_modal").css("right", "inherit");
                }
            });
            $("button[data-action=\"close\"]").click(function () {
                $("#chat").width("500px");
            });
        }

    }

    var handleTwitchChatEmotesScript = function () {

        if (($("#twitch_chat").length || $(".ember-chat").length) && bttv.settings.get("clickTwitchEmotes") === true) {

            debug.log("Injecting Twitch Chat Emotes Script");

            var emotesJSInject = document.createElement("script");
            emotesJSInject.setAttribute("src", "//cdn.betterttv.net/js/twitchemotes.js?"+bttv.info.versionString());
            emotesJSInject.setAttribute("type", "text/javascript");
            emotesJSInject.setAttribute("id", "clickTwitchEmotes");
            $("body").append(emotesJSInject);
        }

    }

    var loadChatSettings = function() {

        if(!$('.ember-chat .chat-settings').length || $('.ember-chat .chat-settings .bttvChatSettings').length) return;

        debug.log("Loading BetterTTV Chat Settings");

        $('.ember-chat .chat-settings .clear-chat').remove();

        var settings = '<div class="chat-menu-header">BetterTTV</div> \
        <div class="chat-menu-content"> \
            ' + ($("body[data-page=\"ember#chat\"]").length ? '<p><a href="#" class="g18_gear-00000080 blackChatLink">Black Chat (Chroma Key)</a></p>' : '') + ' \
            ' + (($("#dash_main").length || /\?bttvDashboard=true/.test(window.location)) ? '<p><a href="#" class="g18_gear-00000080 flipDashboard">' + (bttv.settings.get("flipDashboard") === true ? 'Unflip Dashboard' : 'Flip Dashboard') + '</a></p>' : '') + ' \
            <p><a href="#" class="g18_gear-00000080 setBlacklistKeywords">Set Blacklist Keywords</a></p> \
            <p><a href="#" class="g18_gear-00000080 setHighlightKeywords">Set Highlight Keywords</a></p> \
            <p><a href="#" class="g18_gear-00000080 setScrollbackAmount">Set Scrollback Amount</a></p> \
            <p><a href="#" class="g18_trash-00000080 clearChat">Clear My Chat</a></p> \
            <p><a href="#" class="button-simple dark openSettings" style="display: block;margin-top: 8px;text-align: center;">BetterTTV Settings</a></p> \
        </div>';

        var $settings = $('<div></div>');

        $settings.attr('class', 'bttvChatSettings');
        $settings.html(settings);

        $('.ember-chat .chat-interface .chat-settings').append($settings);

        if($('body[data-page="ember#chat"]').length) {
            $('.openSettings').click(function(e) {
                e.preventDefault();
                bttv.settings.popup();
            });
        } else {
            $('.openSettings').click(function(e) {
                e.preventDefault();
                $('.chat-option-buttons .settings').click();
                $('#bttvSettingsPanel').show("slow");
            });
        }

        $('.blackChatLink').click(function(e) {
            e.preventDefault();
            if (vars.blackChat) {
                vars.blackChat = false;
                $("#blackChat").remove();
                darkenPage();
                splitChat();
                $(".blackChatLink").text("Black Chat (Chroma Key)");
            } else {
                vars.blackChat = true;
                $("#darkTwitch").remove();
                $("#splitChat").remove();
                var darkCSS = document.createElement("link");
                darkCSS.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-blackchat.css");
                darkCSS.setAttribute("type", "text/css");
                darkCSS.setAttribute("rel", "stylesheet");
                darkCSS.setAttribute("id", "blackChat");
                darkCSS.innerHTML = '';
                $('body').append(darkCSS);
                $(".blackChatLink").text("Unblacken Chat");
            }
        });

        $('.clearChat').click(function(e) {
            e.preventDefault();
            removeElement(".chat-line");
        });

        $('.flipDashboard').click(function(e) {
            e.preventDefault();
            if (bttv.settings.get("flipDashboard") === true) {
                bttv.settings.save("flipDashboard", false);
            } else {
                bttv.settings.save("flipDashboard", true);
            }
        });

        $('.setBlacklistKeywords').click(function(e) {
            e.preventDefault();
            var keywords = prompt("Type some blacklist keywords. Messages containing keywords will be filtered from your chat. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase. Wildcards are supported.", bttv.settings.get("blacklistKeywords"));
            if (keywords != null) {
                keywords = keywords.trim().replace(/\s\s+/g, ' ');
                bttv.settings.save("blacklistKeywords", keywords);
            }
        });

        $('.setHighlightKeywords').click(function(e) {
            e.preventDefault();
            var keywords = prompt("Type some highlight keywords. Messages containing keywords will turn red to get your attention. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase, and () around a word to specify a username. Wildcards are supported.", bttv.settings.get("highlightKeywords"));
            if (keywords != null) {
                keywords = keywords.trim().replace(/\s\s+/g, ' ');
                bttv.settings.save("highlightKeywords", keywords);
            }
        });

        $('.setScrollbackAmount').click(function(e) {
            e.preventDefault();
            var lines = prompt("What is the maximum amount of lines that you want your chat to show? Twitch default is 150. Leave the field blank to disable.", bttv.settings.get("scrollbackAmount"));
            if (lines != null && lines === "") {
                bttv.settings.save("scrollbackAmount", 150);
            } else if (lines != null && isNaN(lines) !== true && lines > 0) {
                bttv.settings.save("scrollbackAmount", parseInt(lines));
            } else {
                bttv.settings.save("scrollbackAmount", 150);
            }
        });
    }

    var createSettings = function () {

        debug.log("Creating BetterTTV Settings");

        var settingsPanel = document.createElement("div");
        settingsPanel.setAttribute("id", "bttvSettingsPanel");
        settingsPanel.style.display = "none";
        settingsPanel.innerHTML = '<div id="header"> \
                                    <span id="logo"><img height="45px" src="//cdn.betterttv.net/style/logos/settings_logo.png" /></span> \
                                    <ul class="nav"> \
                                        <li><a href="#bttvAbout">About</a></li> \
                                        <li class="active"><a href="#bttvSettings">Settings</a></li> \
                                        <li><a href="#bttvChangelog">Changelog</a></li> \
                                        <li><a href="#bttvPrivacy">Privacy Policy</a></li> \
                                        <li><a href="#bttvBackup">Backup/Import</a></li> \
                                    </ul><span id="close">&times;</span> \
                                   </div> \
                                   <div id="bttvSettings" class="scroll scroll-dark" style="height:425px;"> \
                                      <div class="tse-content options-list"> \
                                        <h2 class="option"> Here you can manage the various BetterTTV options. Click On or Off to toggle settings.</h2> \
                                      </div> \
                                   </div> \
                                   <div id="bttvAbout" style="display:none;"> \
                                    <div class="aboutHalf"> \
                                        <img class="bttvAboutIcon" src="//cdn.betterttv.net/style/logos/mascot.png" /> \
                                        <h1>BetterTTV v'+ bttv.info.versionString() + '</h1> \
                                        <h2>from your friends at <a href="http://www.nightdev.com" target="_blank">NightDev</a></h2> \
                                        <br /> \
                                    </div> \
                                    <div class="aboutHalf"> \
                                        <h1 style="margin-top: 100px;">Think this addon is awesome?</h1><br /><br /> \
                                        <h2><a target="_blank" href="https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped">Drop a Review on the Chrome Webstore</a></h2> \
                                        <br /> \
                                        <h2>or maybe</h2> \
                                        <br /> \
                                        <h2><a target="_blank" href="http://streamdonations.net/c/night">Support the Developer</a></h2> \
                                        <br /> \
                                    </div> \
                                   </div> \
                                   <div id="bttvPrivacy" class="scroll scroll-dark" style="display:none;height:425px;"> \
                                    <div class="tse-content"></div> \
                                   </div> \
                                   <div id="bttvChangelog" class="scroll scroll-dark" style="display:none;height:425px;"> \
                                    <div class="tse-content"></div> \
                                   </div> \
                                   <div id="bttvBackup" style="display:none;height:425px;padding:25px;"> \
                                    <h1 style="padding-bottom:15px;">Backup Settings</h1> \
                                    <button class="primary_button" id="bttvBackupButton"><span>Download</span></button> \
                                    <h1 style="padding-top:25px;padding-bottom:15px;">Import Settings</h1> \
                                    <input type="file" id="bttvImportInput" style="height: 25px;width: 250px;"> \
                                   </div> \
                                   <div id="footer"> \
                                    <span>BetterTTV &copy; <a href="http://www.nightdev.com" target="_blank">NightDev</a> 2014</span><span style="float:right;"><a href="http://www.nightdev.com/contact" target="_blank">Get Support</a> | <a href="http://bugs.nightdev.com/projects/betterttv/issues/new?tracker_id=1" target="_blank">Report a Bug</a> | <a href="http://streamdonations.net/c/night" target="_blank">Support the Developer</a></span> \
                                   </div>';
        $("body").append(settingsPanel);

        if(/\?bttvSettings=true/.test(window.location)) {
            $('#bttvSettingsPanel').show();
            $('#body').css({
                overflow: 'hidden !important',
                height: '100% !important',
                width: '100% !important'
            });
            $('#mantle_skin').remove();
            $('#site_header').remove();
            $('#site_footer').remove();
        }

        $.get('//cdn.betterttv.net/privacy.html', function (data) {
            if(data) {
                $('#bttvPrivacy .tse-content').html(data);
            }
        });

        $.get('//cdn.betterttv.net/changelog.html?'+ bttv.info.versionString(), function (data) {
            if(data) {
                $('#bttvChangelog .tse-content').html(data);
            }
        });

        $('#bttvBackupButton').click(function() {
            bttv.settings.backup();
        });

        $('#bttvImportInput').change(function() {
            bttv.settings.import(this);
        });

        $('#bttvSettingsPanel .scroll').TrackpadScrollEmulator({
            scrollbarHideStrategy: 'rightAndBottom'
        });

        $("#bttvSettingsPanel #close").click(function () {
            $("#bttvSettingsPanel").hide("slow");
        });

        $("#bttvSettingsPanel .nav a").click(function (e) {
            e.preventDefault();
            var tab = $(this).attr("href");

            $("#bttvSettingsPanel .nav a").each(function () {
                var currentTab = $(this).attr("href");
                $(currentTab).hide();
                $(this).parent("li").removeClass("active");
            });

            $(tab).fadeIn();
            $(this).parent("li").addClass("active");
        });
    }

    var handleLookupServer = function() {
        var socketJSInject = document.createElement("script");
        socketJSInject.setAttribute("src", "//cdn.betterttv.net/js/sock.js?"+bttv.info.versionString());
        socketJSInject.setAttribute("type", "text/javascript");
        $("head").append(socketJSInject);
    }

    var checkJquery = function (times) {
        times = times || 0;
        if(times > 9) return;
        if(typeof ($j) === 'undefined') {
            debug.log("jQuery is undefined.");
            setTimeout(function() { checkJquery(times+1); }, 1000);
            return;
        } else {
            var $ = $j;
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

            brand();
            clearClutter();
            channelReformat();
            checkMessages();
            checkFollowing();
            checkBroadcastInfo();
            darkenPage();
            splitChat();
            flipDashboard();
            formatDashboard();
            giveawayCompatibility();
            dashboardChannelInfo();
            directoryFunctions();

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

    if (document.URL.indexOf("receiver.html") !== -1 || document.URL.indexOf("cbs_ad_local.html") !== -1) {
        debug.log("HTML file called by Twitch.");
        return;
    }

    if(location.pathname.match(/^\/(.*)\/popout/)) {
        debug.log("Popout player detected.");
        return;
    }

    if (window.BTTVLOADED === true) return;
    debug.log("BTTV LOADED " + document.URL);
    BTTVLOADED = true;
    checkJquery();

}(window.BetterTTV = window.BetterTTV || {}));