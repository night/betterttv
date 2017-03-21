var chat = bttv.chat, vars = bttv.vars;
var splitChat = require('./features/split-chat'),
    darkenPage = require('./features/darken-page'),
    handleBackground = require('./features/handle-background'),
    flipDashboard = require('./features/flip-dashboard'),
    cssLoader = require('./features/css-loader'),
    hostButton = require('./features/host-btn-below-video'),
    anonChat = require('./features/anon-chat'),
    betterViewerList = require('./features/better-viewer-list'),
    disableChannelHeader = require('./features/disable-channel-header'),
    handleTwitchChatEmotesScript = require('./features/handle-twitchchat-emotes'),
    audibleFeedback = require('./features/audible-feedback'),
    playerKeyboardShortcuts = require('./features/player-keyboard-shortcuts'),
    imagePreview = require('./features/image-preview'),
    chatFontSettings = require('./features/chat-font-settings');

var displayElement = require('./helpers/element').display,
    removeElement = require('./helpers/element').remove;

module.exports = [
    {
        name: 'Anon Chat',
        description: 'Join channels without appearing in chat',
        default: false,
        storageKey: 'anonChat',
        toggle: function() {
            anonChat();
        },
        load: function() {
            anonChat();
        }
    },
    {
        name: 'Alpha Chat Badges',
        description: 'Removes the background from chat badges',
        default: false,
        storageKey: 'alphaTags'
    },
    {
        name: 'Automatic Theatre Mode',
        description: 'Automatically enables theatre mode',
        default: false,
        storageKey: 'autoTheatreMode'
    },
    {
        name: 'Better Viewer List',
        description: 'Adds extra features to the viewer list, such as filtering',
        default: true,
        storageKey: 'betterViewerList',
        toggle: function(value) {
            if (value === true) {
                betterViewerList();
                $('a.button[title="Viewer List"]').hide();
            } else {
                $('#bvl-button').hide();
                $('#bvl-panel').remove();
                $('a.button[title="Viewer List"]').show();
            }
        },
        load: function() {
            betterViewerList();
        }
    },
    {
        name: 'BetterTTV Emotes',
        description: 'BetterTTV adds extra cool emotes for you to use',
        default: true,
        storageKey: 'bttvEmotes'
    },
    {
        name: 'BetterTTV GIF Emotes',
        description: 'We realize not everyone likes GIFs, but some people do.',
        default: false,
        storageKey: 'bttvGIFEmotes'
    },
    {
        name: 'Blue Buttons',
        description: 'Blue is better than purple, so we make it an option.',
        default: false,
        storageKey: 'showBlueButtons',
        toggle: function(value) {
            if (value === true) {
                cssLoader.load('blue-buttons', 'showBlueButtons');
            } else {
                cssLoader.unload('showBlueButtons');
            }
        },
        load: function() {
            cssLoader.load('blue-buttons', 'showBlueButtons');
        }
    },
    {
        name: 'Chat Image Preview',
        description: 'Preview chat images on mouse over',
        default: true,
        storageKey: 'chatImagePreview',
        toggle: function(value) {
            if (value === true) {
                imagePreview.enablePreview();
            } else {
                imagePreview.disablePreview();
            }
        }
    },
    {
        name: 'Click to Play/Pause Stream',
        description: 'Click on the twitch player to pause/resume playback',
        default: false,
        storageKey: 'clickToPlay',
    },
    {
        name: 'Completion Tooltip',
        description: 'Shows a tooltip with suggested names when typing @ or using tab completion',
        default: true,
        storageKey: 'tabCompletionTooltip'
    },
    {
        name: 'DarkenTTV',
        description: 'A sleek, grey theme which will make you love the site even more',
        default: false,
        storageKey: 'darkenedMode',
        toggle: function(value) {
            if (value === true) {
                darkenPage();
                if (bttv.settings.get('splitChat') !== false) {
                    $('#splitChat').remove();
                    splitChat();
                }
            } else {
                $('#darkTwitch').remove();
                handleBackground();
                if (bttv.settings.get('splitChat') !== false) {
                    $('#splitChat').remove();
                    splitChat();
                }
            }
        },
        load: function() {
            if (!window.App) return;

            var currentDarkStatus = false;
            var toggleDarkMode = function() {
                if (this.get('isTheatreMode') === true) {
                    currentDarkStatus = bttv.settings.get('darkenedMode');
                    if (currentDarkStatus === false) {
                        bttv.settings.save('darkenedMode', true);

                        // Toggles setting back without removing the darkened css
                        bttv.storage.put('bttv_darkenedMode', false);
                    }
                } else if (currentDarkStatus === false) {
                    bttv.settings.save('darkenedMode', false);
                }
            };

            var controller = App.__container__.lookup('controller:channel');
            if (controller) {
                controller.addObserver('isTheatreMode', toggleDarkMode);

                // "Looking" at this field seems to initialize something which magically makes
                // the observer work on VODs, otherwise we need to also bind on controller:vod
                controller.get('isTheatreMode');
            }
        }
    },
    {
        name: 'Default to Live Channels',
        description: 'BetterTTV can click on "Channels" for you in the Following Overview automatically',
        default: false,
        storageKey: 'showDirectoryLiveTab'
    },
    {
        name: 'Desktop Notifications',
        description: 'BetterTTV can send you desktop notifications when you are tabbed out of Twitch',
        default: false,
        storageKey: 'desktopNotifications',
        toggle: function(value) {
            if (value === true) {
                if (window.Notification) {
                    if (Notification.permission === 'default' || (window.webkitNotifications && webkitNotifications.checkPermission() === 1)) {
                        Notification.requestPermission(function() {
                            if (Notification.permission === 'granted' || (window.webkitNotifications && webkitNotifications.checkPermission() === 0)) {
                                bttv.settings.save('desktopNotifications', true);
                                bttv.notify('Desktop notifications are now enabled.');
                            } else {
                                bttv.notify('You denied BetterTTV permission to send you notifications.');
                            }
                        });
                    } else if (Notification.permission === 'granted' || (window.webkitNotifications && webkitNotifications.checkPermission() === 0)) {
                        bttv.settings.save('desktopNotifications', true);
                        bttv.notify('Desktop notifications are now enabled.');
                    } else if (Notification.permission === 'denied' || (window.webkitNotifications && webkitNotifications.checkPermission() === 2)) {
                        Notification.requestPermission(function() {
                            if (Notification.permission === 'granted' || (window.webkitNotifications && webkitNotifications.checkPermission() === 0)) {
                                bttv.settings.save('desktopNotifications', true);
                                bttv.notify('Desktop notifications are now enabled.');
                            } else {
                                bttv.notify('You denied BetterTTV permission to send you notifications.');
                            }
                        });
                    } else {
                        bttv.notify('Your browser is not capable of desktop notifications.');
                    }
                } else {
                    bttv.notify('Your browser is not capable of desktop notifications.');
                }
            } else {
                bttv.notify('Desktop notifications are now disabled.');
            }
        }
    },
    {
        name: 'Double-Click Translation',
        description: 'Double-clicking on chat lines translates them with Google Translate',
        default: false,
        storageKey: 'dblclickTranslation',
        toggle: function(value) {
            if (value === true) {
                $('body').on('dblclick', '.chat-line', function() {
                    chat.helpers.translate($(this).find('.message'), $(this).data('sender'), $(this).find('.message').text());
                    $(this).find('.message').text('Translating...');
                    $('div.tipsy').remove();
                });
            } else {
                $('body').unbind('dblclick');
            }
        }
    },
    {
        name: 'Directory Preview',
        description: 'Hover over streams to get a live preview of the stream',
        default: false,
        storageKey: 'directoryPreview',
        toggle: function(value) {
            if (value === true) {
                this.load();
            } else {
                $('body').off('mouseover', '#directory-list .streams a.cap').off('mouseout', '#directory-list .streams a.cap');
            }
        },
        load: function() {
            if (bttv.settings.get('directoryPreview') === false) return;

            $('body').on('mouseover', '#directory-list .streams a.cap', function() {
                var chan = encodeURIComponent($(this).attr('href').substr(1));

                $('div.tipsy').remove();

                var $this = $(this);
                setTimeout(function() {
                    if (!$this.is(':hover')) return;

                    $('div.tipsy').remove();
                    $this.tipsy({
                        trigger: 'manual',
                        gravity: $.fn.tipsy.autoWE,
                        html: true,
                        opacity: 1,
                        title: function() { return '<iframe src="https://player.twitch.tv/?channel=' + chan + '&!branding&!showInfo&autoplay&volume=0.1" style="border: none;" width="320" height="208"></iframe><style>.tipsy-inner{max-width:320px;}</style>'; }
                    });
                    $this.tipsy('show');
                }, 1500);
            }).on('mouseout', '#directory-list .streams a.cap', function() {
                var $this = $(this);

                if (!$('div.tipsy').length) return;

                var timer = setInterval(function() {
                    if ($('div.tipsy').length && $('div.tipsy').is(':hover')) return;

                    clearInterval(timer);
                    $this.tipsy('hide');
                }, 1000);
            }).on('click', '#directory-list .streams a.cap', function() {
                $(this).tipsy('hide');
                $('div.tipsy').remove();
            });
        }
    },
    {
        name: 'Disable Channel Header',
        description: 'Disables the large header on top of channels in the new layout',
        default: false,
        storageKey: 'disableChannelHeader',
        toggle: disableChannelHeader
    },
    {
        name: 'Disable Host Mode',
        description: 'Disables hosted channels on Twitch',
        default: false,
        storageKey: 'disableHostMode',
        toggle: function(value) {
            try {
                window.App.__container__.lookup('service:globals').set('enableHostMode', !value);
            } catch (e) {}
        },
        load: function() {
            try {
                window.App.__container__.lookup('service:globals').set('enableHostMode', !bttv.settings.get('disableHostMode'));
            } catch (e) {}
        }
    },
    {
        name: 'Disable Localized Names',
        description: 'Show usernames instead of localized names in chat',
        default: false,
        storageKey: 'disableLocalizedNames'
    },
    {
        name: 'Disable Name Colors',
        description: 'Disables colors in chat (useful for those who may suffer from color blindness)',
        default: false,
        storageKey: 'disableUsernameColors',
        toggle: function(value) {
            if (value === true) {
                $('.ember-chat .chat-room').addClass('no-name-colors');
            } else {
                $('.ember-chat .chat-room').removeClass('no-name-colors');
            }
        }
    },
    {
        name: 'Disable Whispers',
        description: 'Disables the Twitch whisper feature and hides any whispers you receive',
        default: false,
        storageKey: 'disableWhispers'
    },
    {
        name: 'Disable Frontpage Autoplay',
        description: 'Disable autoplay on the frontpage video player',
        default: false,
        storageKey: 'disableFPVideo',
        load: function() {
            if (window.location.href === 'https://www.twitch.tv/' && bttv.settings.get('disableFPVideo') === true) {
                $(window).load(function() {
                    var frameSrc = $('#player').children('iframe').eq(0).attr('src');
                    $('#player').children('iframe').eq(0).attr('src', frameSrc + '&autoplay=false');
                    $('#player').bind('DOMNodeInserted DOMNodeRemoved', function() {
                        frameSrc = $('#player').children('iframe').eq(0).attr('src');
                        $('#player').children('iframe').eq(0).attr('src', frameSrc + '&autoplay=false');
                    });
                });
            }
        }
    },
    {
        name: 'Double-Click Auto-Complete',
        description: 'Double-clicking a username in chat copies it into the chat text box',
        default: false,
        storageKey: 'dblClickAutoComplete'
    },
    {
        name: 'Embedded Polling',
        description: 'See polls posted by the broadcaster embedded right into chat',
        default: true,
        storageKey: 'embeddedPolling'
    },
    {
        name: 'Emote Menu',
        description: 'Get a more advanced emote menu for Twitch. (Made by Ryan Chatham)',
        default: false,
        storageKey: 'clickTwitchEmotes',
        toggle: function() {
            handleTwitchChatEmotesScript();
        }
    },
    {
        name: 'Featured Channels',
        description: 'The left sidebar is too cluttered, so BetterTTV removes featured channels by default',
        default: false,
        storageKey: 'showFeaturedChannels',
        toggle: function(value) {
            if (value === true) {
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
        name: 'Following Notifications',
        description: 'BetterTTV will notify you when channels you follow go live',
        default: true,
        storageKey: 'followingNotifications'
    },
    {
        name: 'Hide Bits',
        description: 'Bits can be annoying. Disable \'em in chat with this (we can\'t block \'em on stream, sry)',
        default: false,
        storageKey: 'hideBits',
        toggle: function(value) {
            if (value === true) {
                chat.helpers.dismissPinnedCheer();
                cssLoader.load('hide-bits', 'hideBits');
            } else {
                cssLoader.unload('hideBits');
            }
        },
        load: function() {
            cssLoader.load('hide-bits', 'hideBits');
        }
    },
    {
        name: 'Hide Conversations When Inactive',
        description: 'Only show conversations ui on mousverover or when active',
        default: false,
        storageKey: 'hideConversations',
        toggle: function() {
            bttv.conversations.toggleAutoHide();
        }
    },
    {
        name: 'Hide Friends',
        description: 'Hides the friend list from the left sidebar',
        default: false,
        storageKey: 'hideFriends',
        toggle: function(value) {
            if (value === true) {
                cssLoader.load('hide-friends', 'hideFriends');
            } else {
                cssLoader.unload('hideFriends');
            }
        },
        load: function() {
            cssLoader.load('hide-friends', 'hideFriends');
        }
    },
    {
        name: 'Hide Friends Activity in Chat',
        description: 'Hides things like "friend has started watching" in chat',
        default: false,
        storageKey: 'hideFriendsChatActivity',
        toggle: function() {
            window.location.reload();
        }
    },
    {
        name: 'Hide Group Chat',
        description: 'Hides the group chat bar above chat',
        default: false,
        storageKey: 'groupChatRemoval',
        toggle: function(value) {
            if (value === true) {
                cssLoader.load('hide-group-chat', 'groupChatRemoval');
            } else {
                cssLoader.unload('groupChatRemoval');
            }
        },
        load: function() {
            cssLoader.load('hide-group-chat', 'groupChatRemoval');
        }
    },
    {
        name: 'Hide Prime Promotions',
        description: 'Hides the "Free With Prime" section of the sidebar',
        default: false,
        storageKey: 'hidePrimePromotion',
        toggle: function(value) {
            if (value === true) {
                removeElement('.js-offers');
            } else {
                displayElement('.js-offers');
            }
        }
    },
    {
        name: 'Host Button',
        description: 'Places a Host/Unhost button below the video player',
        default: false,
        storageKey: 'hostButton',
        toggle: function(value) {
            if (value === true) {
                hostButton();
            } else {
                $('#bttv-host-button').remove();
            }
        }
    },
    {
        name: 'JTV Chat Badges',
        description: 'BetterTTV can replace the chat badges with the ones from JTV',
        default: false,
        storageKey: 'showJTVTags'
    },
    {
        name: 'JTV Monkey Emotes',
        description: 'BetterTTV replaces the robot emoticons with the old JTV monkey faces',
        default: false,
        storageKey: 'showMonkeyEmotes'
    },
    {
        name: 'Left side chat',
        description: 'Moves the chat to the left of the player',
        default: false,
        storageKey: 'leftSideChat',
        toggle: function(value) {
            $('body').toggleClass('swap-chat', value);
        },
        load: function() {
            if (bttv.settings.get('leftSideChat') === true) {
                $('body').addClass('swap-chat');
            }
        }
    },
    {
        name: 'Mod Card Keybinds',
        description: 'Enable keybinds when you click on a username: P(urge), T(imeout), B(an), W(hisper)',
        default: false,
        storageKey: 'modcardsKeybinds'
    },
    {
        name: 'Other Messages Alert',
        description: 'BetterTTV can alert you when you receive a message to your "Other" messages folder',
        default: false,
        storageKey: 'alertOtherMessages'
    },
    {
        name: 'Pin Highlighted Messages',
        description: 'Pin your ten latest highlighted messages right above chat',
        default: false,
        storageKey: 'pinnedHighlights',
        toggle: function(value) {
            if (value === false) {
                $('#bttv-pin-container').remove();
            }
        }
    },
    {
        name: 'Play Sound on Highlight/Whisper',
        description: 'Get audio feedback for messages directed at you (BETA)',
        default: false,
        storageKey: 'highlightFeedback',
        load: audibleFeedback.load
    },
    {
        name: 'Player Keyboard Shortcuts',
        description: 'Simple keyboard shortcuts. K for play/pause, F for fullscreen and M for mute.',
        default: false,
        storageKey: 'playerKeyboardShortcuts',
        toggle: playerKeyboardShortcuts,
        load: playerKeyboardShortcuts
    },
    {
        name: 'Remove Deleted Messages',
        description: 'Completely removes timed out messages from view',
        default: false,
        storageKey: 'hideDeletedMessages'
    },
    {
        name: 'Shift-Click Custom Timeouts',
        description: 'Requires shift + click to activate the custom timeout selector',
        default: false,
        storageKey: 'customTOShiftOnly'
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
        default: false,
        storageKey: 'splitChat',
        toggle: function(value) {
            if (value === true) {
                splitChat();
            } else {
                $('#splitChat').remove();
            }
        }
    },
    {
        name: 'Tab Completion Emote Priority',
        description: 'Prioritize emotes over usernames when using tab completion',
        default: false,
        storageKey: 'tabCompletionEmotePriority'
    },
    {
        name: 'Timeout Pinned Highlights',
        description: 'Automatically hide pinned highlights after 1 minute',
        default: false,
        storageKey: 'timeoutHighlights',
    },
    {
        name: 'Unread Whispers Count in Title',
        description: 'Display the number of unread whispers in the tab title',
        default: true,
        storageKey: 'unreadInTitle'
    },
    {
        name: 'BetterTTV Beta',
        description: 'Help test the future of BetterTTV. WARNING: may lack some features and may be buggy',
        default: false,
        storageKey: 'beta',
        toggle: function() {
            window.location.reload();
        }
    },
    {
        default: '',
        storageKey: 'blacklistKeywords',
        toggle: function(keywords) {
            var phraseRegex = /\{.+?\}/g;
            var testCases = keywords.match(phraseRegex);
            var phraseKeywords = [];
            var i;
            if (testCases) {
                for (i = 0; i < testCases.length; i++) {
                    var testCase = testCases[i];
                    keywords = keywords.replace(testCase, '').replace(/\s\s+/g, ' ').trim();
                    phraseKeywords.push('"' + testCase.replace(/(^\{|\}$)/g, '').trim() + '"');
                }
            }

            keywords === '' ? keywords = phraseKeywords : keywords = keywords.split(' ').concat(phraseKeywords);

            for (i = 0; i < keywords.length; i++) {
                if (/^\([a-z0-9_\-\*]+\)$/i.test(keywords[i])) {
                    keywords[i] = keywords[i].replace(/(\(|\))/g, '');
                }
            }

            var keywordList = keywords.join(', ');
            if (keywordList === '') {
                chat.helpers.serverMessage('Blacklist Keywords list is empty', true);
            } else {
                chat.helpers.serverMessage('Blacklist Keywords are now set to: ' + keywordList, true);
            }
        }
    },
    {
        default: true,
        storageKey: 'chatLineHistory',
        toggle: function(value) {
            if (value === true) {
                chat.helpers.serverMessage('Chat line history enabled.', true);
            } else {
                chat.helpers.serverMessage('Chat line history disabled.', true);
            }
        }
    },
    {
        default: 340,
        storageKey: 'chatWidth'
    },
    {
        default: false,
        storageKey: 'consoleLog'
    },
    {
        default: false,
        storageKey: 'importNonSsl'
    },
    {
        default: false,
        storageKey: 'flipDashboard',
        toggle: function(value) {
            if (value === true) {
                $('#flipDashboard').text('Unflip Dashboard');
                flipDashboard();
            } else {
                $('#flipDashboard').text('Flip Dashboard');
                flipDashboard();
            }
        }
    },
    {
        default: (vars.userData.isLoggedIn ? vars.userData.name : ''),
        storageKey: 'highlightKeywords',
        toggle: function(keywords) {
            var phraseRegex = /\{.+?\}/g;
            var testCases = keywords.match(phraseRegex);
            var phraseKeywords = [];

            if (testCases) {
                for (var i = 0; i < testCases.length; i++) {
                    var testCase = testCases[i];
                    keywords = keywords.replace(testCase, '').replace(/\s\s+/g, ' ').trim();
                    phraseKeywords.push('"' + testCase.replace(/(^\{|\}$)/g, '').trim() + '"');
                }
            }

            keywords === '' ? keywords = phraseKeywords : keywords = keywords.split(' ').concat(phraseKeywords);

            for (var j = 0; j < keywords.length; j++) {
                if (/^\([a-z0-9_\-\*]+\)$/i.test(keywords[j])) {
                    keywords[j] = keywords[j].replace(/(\(|\))/g, '');
                }
            }

            var keywordList = keywords.join(', ');
            if (keywordList === '') {
                chat.helpers.serverMessage('Highlight Keywords list is empty', true);
            } else {
                chat.helpers.serverMessage('Highlight Keywords are now set to: ' + keywordList, true);
            }
        }
    },
    {
        default: 150,
        storageKey: 'scrollbackAmount',
        toggle: function(lines) {
            if (lines === 150) {
                chat.helpers.serverMessage('Chat scrollback is now set to: default (150)', true);
            } else {
                chat.helpers.serverMessage('Chat scrollback is now set to: ' + lines, true);
            }
        }
    },
    {
        storageKey: 'chatFontFamily',
        default: '',
        load: function() {
            chatFontSettings.initFontFamily();
        },
        toggle: function(font) {
            chatFontSettings.setFontFamily(font);
        }
    },
    {
        storageKey: 'chatFontSize',
        default: 0,
        load: function() {
            chatFontSettings.initFontSize();
        },
        toggle: function(size) {
            chatFontSettings.setFontSize(size);
        }
    }
];
