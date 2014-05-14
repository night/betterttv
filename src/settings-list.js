/** BTTV :
 * cssBlueButtons
 * handleTwitchChatEmotesScript
 */

var chat = bttv.chat, vars = bttv.vars;
var betaChat = require('features/beta-chat'),
    splitChat = require('features/split-chat'),
    darkenPage = require('features/darken-page'),
    handleBackground = require('features/handle-background'),
    flipDashboard = require('features/flip-dashboard'),
    loader = require('features/css-loader');
var displayElement = require('element').display,
    removeElement = require('element').remove;

module.exports = [
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
                bttv.cssBlueButtons();
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
        description: 'Turn this on to change <message deleted> back to users\' messages.',
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
                bttv.handleTwitchChatEmotesScript();
            } else {
                window.location.reload();
            }
        }
    },

    {
        name: 'Hide Private Chat System',
        description: 'Hides the top banner used for private chats',
        default: false,
        storageKey: 'PrivateChatRemoval',
        toggle: function(value) {
            var cssId = 'removePC'; 
            if(value === true) {
                    loader.css("HidePrivChat.css", cssId);
            } else {
                 if (document.getElementById(cssId))
                {
                    $('#'+cssId).remove();
                }
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
                chat.helpers.serverMessage("Blacklist Keywords list is empty");
            } else {
                chat.helpers.serverMessage("Blacklist Keywords are now set to: " + keywordList);
            }
        }
    },
    {
        default: true,
        storageKey: 'chatLineHistory',
        toggle: function(value) {
            if(value === true) {
                chat.helpers.serverMessage("Chat line history enabled.");
            } else {
                chat.helpers.serverMessage("Chat line history disabled.");
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
                bttv.flipDashboard();
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
                chat.helpers.serverMessage("Highlight Keywords list is empty");
            } else {
                chat.helpers.serverMessage("Highlight Keywords are now set to: " + keywordList);
            }
        }
    },
    {
        default: 150,
        storageKey: 'scrollbackAmount',
        toggle: function(lines) {
            if(lines === 150) {
                chat.helpers.serverMessage("Chat scrollback is now set to: default (150)");
            } else {
                chat.helpers.serverMessage("Chat scrollback is now set to: " + lines);
            }
        }
    }
];