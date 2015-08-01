/** @license
 * Copyright (c) 2015 NightDev
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
/** @license
 * Jade
 * https://github.com/visionmedia/jade
 *
 * Copyright (c) 2009-2014 TJ Holowaychuk (tj@vision-media.ca)
 * Licensed under the MIT license.
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jade = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return (Array.isArray(val) ? val.map(joinClasses) :
    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
    [val]).filter(nulls).join(' ');
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};


exports.style = function (val) {
  if (val && typeof val === 'object') {
    return Object.keys(val).map(function (style) {
      return style + ':' + val[style];
    }).join(';');
  } else {
    return val;
  }
};
/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if (key === 'style') {
    val = exports.style(val);
  }
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    if (JSON.stringify(val).indexOf('&') !== -1) {
      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
                   'will be escaped to `&amp;`');
    };
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will eliminate the double quotes around dates in ' +
                   'ISO form after 2.0.0');
    }
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var jade_encode_html_rules = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};
var jade_match_html = /[&<>"]/g;

function jade_encode_char(c) {
  return jade_encode_html_rules[c] || c;
}

exports.escape = jade_escape;
function jade_escape(html){
  var result = String(html).replace(jade_match_html, jade_encode_char);
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

exports.DebugItem = function DebugItem(lineno, filename) {
  this.lineno = lineno;
  this.filename = filename;
}

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1])(1)
});(function(bttv) {(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = [
    'nightbot',
    'moobot',
    'xanbot'
];

},{}],2:[function(require,module,exports){
exports.tmi = require('./chat/tmi');
exports.templates = require('./chat/templates');
exports.takeover = require('./chat/takeover');
exports.emotes = require('./chat/emotes');
exports.helpers = require('./chat/helpers');
exports.handlers = require('./chat/handlers');
exports.store = require('./chat/store');
exports.imagePreview = require('./chat/image-preview');

},{"./chat/emotes":3,"./chat/handlers":4,"./chat/helpers":5,"./chat/image-preview":6,"./chat/store":8,"./chat/takeover":9,"./chat/templates":10,"./chat/tmi":11}],3:[function(require,module,exports){
var tmi = require('./tmi'),
    store = require('./store'),
    helpers = require('./helpers');

var vars = bttv.vars;

module.exports = function() {
    if (bttv.settings.get('bttvEmotes') === false) {
        return [];
    }
    var emotes = store.bttvEmotes;
    var usableEmotes = [];
    var emoteSets;

    if (vars.userData.isLoggedIn && bttv.chat.helpers.getEmotes(vars.userData.login)) {
        emoteSets = helpers.getEmotes(vars.userData.login);
    }

    Object.keys(emotes).forEach(function(key) {
        var emote = emotes[key];

        if (emote.restrictions) {
            if (emote.restrictions.channels.length && emote.restrictions.channels.indexOf(bttv.getChannel()) === -1) return;
            if (emote.restrictions.games.length && tmi().channel && emote.restrictions.games.indexOf(tmi().channel.game) === -1) return;

            if (emote.restrictions.emoticonSet && emoteSets.indexOf(emote.restrictions.emoticonSet) === -1) return;
        }

        if (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') !== true) {
            return;
        }

        emote.text = emote.code;

        if (!emote.channel) {
            emote.channel = 'BetterTTV Emotes';
            emote.badge = 'https://cdn.betterttv.net/tags/developer.png';
        }

        usableEmotes.push(emote);
    });

    return usableEmotes;
};

},{"./helpers":5,"./store":8,"./tmi":11}],4:[function(require,module,exports){
var vars = require('../vars'),
    debug = require('../helpers/debug'),
    store = require('./store'),
    tmi = require('./tmi'),
    helpers = require('./helpers'),
    templates = require('./templates'),
    rooms = require('./rooms'),
    embeddedPolling = require('../features/embedded-polling'),
    channelState = require('../features/channel-state'),
    audibleFeedback = require('../features/audible-feedback');

// Helper Functions
var getRgb = require('../helpers/colors').getRgb;

exports.commands = function(input) {
    var sentence = input.trim().split(' ');
    var command = sentence[0].toLowerCase();

    if (command === '/join') {
        bttv.settings.save('anonChat', false);
    } else if (command === '/part') {
        bttv.settings.save('anonChat', true);
    } else if (command === '/b') {
        helpers.ban(sentence[1]);
    } else if (command === '/t') {
        var time = 600;
        if (!isNaN(sentence[2])) time = sentence[2];
        helpers.timeout(sentence[1], time);
    } else if (command === '/p' || command === '/purge') {
        helpers.timeout(sentence[1], 1);
    } else if (command === '/massunban' || ((command === '/unban' || command === '/u') && sentence[1] === 'all')) {
        helpers.massUnban();
    } else if (command === '/u') {
        helpers.unban(sentence[1]);
    } else if (command === '/w' && bttv.settings.get('disableWhispers') === true) {
        helpers.serverMessage('You have disabled whispers in BetterTTV settings');
    } else if (command === '/sub') {
        tmi().tmiRoom.startSubscribersMode();
    } else if (command === '/suboff') {
        tmi().tmiRoom.stopSubscribersMode();
    } else if (command === '/localsub') {
        helpers.serverMessage('Local subscribers-only mode enabled.', true);
        vars.localSubsOnly = true;
    } else if (command === '/localsuboff') {
        helpers.serverMessage('Local subscribers-only mode disabled.', true);
        vars.localSubsOnly = false;
    } else if (command === '/localmod') {
        helpers.serverMessage('Local moderators-only mode enabled.', true);
        vars.localModsOnly = true;
    } else if (command === '/localmodoff') {
        helpers.serverMessage('Local moderators-only mode disabled.', true);
        vars.localModsOnly = false;
    } else if (command === '/viewers') {
        bttv.TwitchAPI.get('streams/' + bttv.getChannel()).done(function(stream) {
            helpers.serverMessage('Current Viewers: ' + Twitch.display.commatize(stream.stream.viewers), true);
        }).fail(function() {
            helpers.serverMessage('Could not fetch viewer count.', true);
        });
    } else if (command === '/followers') {
        bttv.TwitchAPI.get('channels/' + bttv.getChannel() + '/follows').done(function(channel) {
            helpers.serverMessage('Current Followers: ' + Twitch.display.commatize(channel._total), true);
        }).fail(function() {
            helpers.serverMessage('Could not fetch follower count.', true);
        });
    } else if (command === '/linehistory') {
        if (sentence[1] === 'off') {
            bttv.settings.save('chatLineHistory', false);
        } else {
            bttv.settings.save('chatLineHistory', true);
        }
    } else if (command === '/uptime') {
        bttv.TwitchAPI.get('streams/' + bttv.getChannel()).done(function(stream) {
            if (stream.stream !== null) {
                var startedTime = new Date(stream.stream.created_at),
                    totalUptime = Math.round(Math.abs((Date.now() - (startedTime.getTime() - (startedTime.getTimezoneOffset() * 60 * 1000))) / 1000)),
                    days = Math.floor(totalUptime / 86400),
                    hours = Math.floor(totalUptime / 3600) - (days * 24),
                    minutes = Math.floor(totalUptime / 60) - (days * 1440) - (hours * 60),
                    seconds = totalUptime - (days * 86400) - (hours * 3600) - (minutes * 60);
                helpers.serverMessage('Stream uptime: ' +
                    (days > 0 ? days + ' day' + (days === 1 ? '' : 's') + ', ' : '') +
                    (hours > 0 ? hours + ' hour' + (hours === 1 ? '' : 's') + ', ' : '') +
                    (minutes > 0 ? minutes + ' minute' + (minutes === 1 ? '' : 's') + ', ' : '') +
                    seconds + ' second' + (seconds === 1 ? '' : 's'),
                    true
                );
            } else {
                helpers.serverMessage('Stream offline', true);
            }
        }).fail(function() {
            helpers.serverMessage('Could not fetch start time.', true);
        });
    } else if (command === '/help') {
        helpers.serverMessage('BetterTTV Chat Commands:');
        helpers.serverMessage('/b [username] -- Shortcut for /ban');
        helpers.serverMessage('/followers -- Retrieves the number of followers for the channel');
        helpers.serverMessage('/linehistory on/off -- Toggles the chat field history (pressing up/down arrow in textbox)');
        helpers.serverMessage('/localmod -- Turns on local mod-only mode (only your chat is mod-only mode)');
        helpers.serverMessage('/localmodoff -- Turns off local mod-only mode');
        helpers.serverMessage('/localsub -- Turns on local sub-only mode (only your chat is sub-only mode)');
        helpers.serverMessage('/localsuboff -- Turns off local sub-only mode');
        helpers.serverMessage('/purge [username] (or /p) -- Purges a user\'s chat');
        helpers.serverMessage('/massunban (or /unban all or /u all) -- Unbans all users in the channel (channel owner only)');
        helpers.serverMessage('/r -- Type \'/r \' to respond to your last whisper');
        helpers.serverMessage('/sub -- Shortcut for /subscribers');
        helpers.serverMessage('/suboff -- Shortcut for /subscribersoff');
        helpers.serverMessage('/t [username] [time in seconds] -- Shortcut for /timeout');
        helpers.serverMessage('/u [username] -- Shortcut for /unban');
        helpers.serverMessage('/uptime -- Retrieves the amount of time the channel has been live');
        helpers.serverMessage('/viewers -- Retrieves the number of viewers watching the channel');
        helpers.serverMessage('Native Chat Commands:');
        return false;
    } else {
        return false;
    }
    return true;
};

exports.countUnreadMessages = function() {
    var controller = bttv.getChatController(),
        channels = rooms.getRooms(),
        unreadChannels = 0;

    channels.forEach(function(channel) {
        channel = rooms.getRoom(channel);
        if (channel.unread > 0) {
            unreadChannels++;
        }
        try {
            channel.emberRoom.set('unreadCount', channel.unread);
        } catch(e) {
            debug.log('Error setting unread count! Ember controller for channel must be removed.');
        }
    });
    controller.set('notificationsCount', unreadChannels);
};

exports.shiftQueue = function() {
    if (!tmi() || !tmi().get('id')) return;
    var id = tmi().get('id');
    if (id !== store.currentRoom && tmi().get('name')) {
        $('.ember-chat .chat-messages .tse-content .chat-line').remove();
        store.currentRoom = id;
        store.__messageQueue = [];
        rooms.getRoom(id).playQueue();
        helpers.serverMessage('You switched to: ' + tmi().get('name').replace(/</g, '&lt;').replace(/>/g, '&gt;'), true);
    } else {
        if (store.__messageQueue.length === 0) return;
        $('.ember-chat .chat-messages .tse-content .chat-lines').append(store.__messageQueue.join(''));
        store.__messageQueue = [];
    }
    helpers.scrollChat();
};

exports.moderationCard = function(user, $event) {
    var makeCard = require('../features/make-card');

    bttv.TwitchAPI.get('/api/channels/' + user.toLowerCase() + '/ember').done(function(userApi) {
        if (!userApi.name) {
            makeCard({ name: userApi, display_name: userApi.capitalize() }, $event);
            return;
        }

        makeCard(userApi, $event);
    }).fail(function() {
        makeCard({ name: user, display_name: user.capitalize() }, $event);
    });
};

exports.labelsChanged = function(user) {
    if (bttv.settings.get('adminStaffAlert') === true) {
        var specials = helpers.getSpecials(user);

        if (specials.indexOf('admin') !== -1) {
            helpers.notifyMessage('admin', user + ' just joined! Watch out foo!');
        } else if (specials.indexOf('staff') !== -1) {
            helpers.notifyMessage('staff', user + ' just joined! Watch out foo!');
        }
    }
};

exports.clearChat = function(user) {
    var trackTimeouts = store.trackTimeouts;

    // Remove chat image preview if it exists.
    // We really shouldn't have to place this here, but since we don't emit events...
    $('#chat_preview').remove();

    if (!user) {
        helpers.serverMessage('Chat was cleared by a moderator (Prevented by BetterTTV)', true);
    } else {
        if ($('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"]').length === 0) return;
        if (bttv.settings.get('hideDeletedMessages') === true) {
            $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"]').each(function() {
                $(this).hide();
                $('div.tipsy').remove();
            });
            setTimeout(function() {
                $('.chat-line .mod-icons .bot, .chat-line .mod-icons .oldbot').each(function() {
                    $(this).parent().parent().find("span.message:contains('" + user.replace(/%/g, '_').replace(/[<>,]/g, '') + "')").each(function() {
                        $(this).parent().hide();
                    });
                });
            }, 3000);
        } else {
            if (bttv.settings.get('showDeletedMessages') !== true) {
                $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"] .message').each(function() {
                    $(this).addClass('timed-out');
                    $(this).html('<span style="color: #999">&lt;message deleted&gt;</span>').off('click').on('click', function() {
                        $(this).replaceWith(templates.message(user, decodeURIComponent($(this).data('raw'))));
                    });
                });
            } else {
                $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"] .message').each(function() {
                    $('a', this).each(function() {
                        var rawLink = '<span style="text-decoration: line-through;">' + $(this).attr('href').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
                        $(this).replaceWith(rawLink);
                    });
                    $('.emoticon', this).each(function() {
                        $(this).css('opacity', '0.1');
                    });
                    $(this).addClass('timed-out');
                    $(this).html('<span style="color: #999">' + $(this).html() + '</span>');
                });
            }
            if (trackTimeouts[user]) {
                trackTimeouts[user].count++;
                $('#times_from_' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '_' + trackTimeouts[user].timesID).each(function() {
                    $(this).text('(' + trackTimeouts[user].count + ' times)');
                });
            } else {
                trackTimeouts[user] = {
                    count: 1,
                    timesID: Math.floor(Math.random() * 100001)
                };
                var displayName = helpers.lookupDisplayName(user);
                helpers.serverMessage(displayName + ' has been timed out. <span id="times_from_' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '_' + trackTimeouts[user].timesID + '"></span>', true);
            }
        }
    }
};

exports.notice = function(data) {
    var messageId = data.msgId;
    var message = data.message;

    channelState({
        type: 'notice',
        tags: {
            'msg-id': messageId
        },
        message: message
    });

    helpers.serverMessage(message, true);
};

var privmsg = exports.privmsg = function(channel, data) {
    // Store display names
    var message;
    if (data.tags && data.tags['display-name']) {
        store.displayNames[data.from] = data.tags['display-name'];
    }

    try {
        tmi().trackLatency(data);
        tmi().trackWhisper(data);
    } catch(e) {
        debug.log('Error sending tracking data to Twitch');
    }

    if (data.style && ['admin', 'action', 'notification', 'whisper'].indexOf(data.style) === -1) return;

    if (data.style === 'admin' || data.style === 'notification') {
        if (data.message.indexOf('Sorry, we were unable to connect to chat.') > -1 && store.ignoreDC === true) {
            store.ignoreDC = false;
            return;
        }

        data.style = 'admin';
        message = templates.privmsg(
            false,
            data.style === 'action' ? true : false,
            data.style === 'admin' ? true : false,
            vars.userData.isLoggedIn ? helpers.isModerator(vars.userData.login) : false,
            {
                message: data.message,
                time: data.date == null ? '' : data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
                nickname: data.from || 'jtv',
                sender: data.from,
                badges: data.badges || (data.from === 'twitchnotify' ? [{
                    type: 'subscriber',
                    name: '',
                    description: 'Channel Subscriber'
                }] : []),
                color: '#555'
            }
        );

        $('.ember-chat .chat-messages .tse-content .chat-lines').append(message);
        helpers.scrollChat();
        return;
    }

    if (!store.chatters[data.from]) store.chatters[data.from] = {lastWhisper: 0};

    if (store.trackTimeouts[data.from]) delete store.trackTimeouts[data.from];

    var blacklistFilter = require('../features/keywords-lists').blacklistFilter,
        highlighting = require('../features/keywords-lists').highlighting;

    if (bttv.settings.get('blacklistKeywords')) {
        if (blacklistFilter(data)) return;
    }

    var messageHighlighted = bttv.settings.get('highlightKeywords') && highlighting(data);

    // Strawpoll
    embeddedPolling(data);

    data.color = (data.tags && data.tags.color && data.tags.color.length) ? data.tags.color : helpers.getColor(data.from);

    data.color = helpers.calculateColor(data.color);

    if (helpers.hasGlow(data.from) && data.style !== 'action') {
        var rgbColor = (data.color === '#ffffff' ? getRgb('#000000') : getRgb(data.color));
        if (bttv.settings.get('darkenedMode') === true) data.color = data.color + '; text-shadow: 0 0 20px rgba(' + rgbColor.r + ',' + rgbColor.g + ',' + rgbColor.b + ',0.8)';
    }

    if (vars.blackChat && data.color === '#000000') {
        data.color = '#ffffff';
    }

    var badges = helpers.getBadges(data.from);
    var bttvBadges = helpers.assignBadges(badges, data);

    var from = data.from;
    var sender = data.from;

    if (data.bttvDisplayName) {
        helpers.lookupDisplayName(data.from);
        from = data.bttvDisplayName;
    } else {
        from = helpers.lookupDisplayName(data.from);
    }

    // handle twitch whispers
    if (data.style === 'whisper') {
        var toColor = helpers.getColor(data.to);
        toColor = helpers.calculateColor(toColor);

        message = templates.whisper({
            message: data.message,
            time: data.date == null ? '' : data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
            from: from,
            sender: sender,
            receiver: data.to,
            to: helpers.lookupDisplayName(data.to),
            fromColor: data.color,
            toColor: toColor,
            emotes: data.tags.emotes
        });

        $('.ember-chat .chat-messages .tse-content .chat-lines').append(message);
        helpers.scrollChat();
        return;
    }

    if (vars.localSubsOnly && !helpers.isModerator(data.from) && !helpers.isSubscriber(data.from)) return;
    if (vars.localModsOnly && !helpers.isModerator(data.from)) return;

    message = templates.privmsg(
        messageHighlighted,
        data.style === 'action' ? true : false,
        data.style === 'admin' ? true : false,
        vars.userData.isLoggedIn ? (helpers.isModerator(vars.userData.login) && (!helpers.isModerator(sender) || (vars.userData.login === channel && vars.userData.login !== sender))) : false,
        {
            message: data.message,
            time: data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
            nickname: from,
            sender: sender,
            badges: bttvBadges,
            color: data.color,
            emotes: data.tags.emotes
        }
    );

    store.__messageQueue.push(message);
};

exports.onPrivmsg = function(channel, data) {
    if (!rooms.getRoom(channel).active() && data.from && data.from !== 'jtv') {
        rooms.getRoom(channel).queueMessage(data);
        return;
    }
    if (!data.message.length) return;
    if (!tmi() || !tmi().tmiRoom) return;
    try {
        if (data.style === 'whisper') {
            store.chatters[data.from] = {lastWhisper: Date.now()};
            if (bttv.settings.get('disableWhispers') === true) return;
            if (data.from !== vars.userData.login) {
                audibleFeedback();
                if (bttv.settings.get('desktopNotifications') === true && bttv.chat.store.activeView === false) bttv.notify('You received a whisper from ' + ((data.tags && data.tags['display-name']) || data.from));
            }
        }
        privmsg(channel, data);
    } catch(e) {
        if (store.__reportedErrors.indexOf(e.message) !== -1) return;
        store.__reportedErrors.push(e.message);
        console.log(e);
        var error = {
            stack: e.stack,
            message: e.message
        };
        $.get('https://nightdev.com/betterttv/errors/?obj=' + encodeURIComponent(JSON.stringify(error)));
        helpers.serverMessage('BetterTTV encountered an error reading chat. The developer has been sent a log of this action. Please try clearing your cookies and cache.');
    }
};


},{"../features/audible-feedback":14,"../features/channel-state":21,"../features/embedded-polling":32,"../features/keywords-lists":41,"../features/make-card":42,"../helpers/colors":45,"../helpers/debug":46,"../vars":64,"./helpers":5,"./rooms":7,"./store":8,"./templates":10,"./tmi":11}],5:[function(require,module,exports){
var vars = require('../vars'),
    debug = require('../helpers/debug'),
    keyCodes = require('../keycodes'),
    tmi = require('./tmi'),
    store = require('./store'),
    templates = require('./templates'),
    bots = require('../bots'),
    punycode = require('punycode'),
    channelState = require('../features/channel-state');

// Helper functions
var calculateColorBackground = require('../helpers/colors').calculateColorBackground;
var calculateColorReplacement = require('../helpers/colors').calculateColorReplacement;

var lookupDisplayName = exports.lookupDisplayName = function(user) {
    if (!user || user === '') return;

    // There's no display-name when sending messages, so we'll fill in for that
    if (vars.userData.isLoggedIn && user === vars.userData.login) {
        store.displayNames[user] = Twitch.user.displayName() || user;
    }

    // Get subscription status (Night's subs)
    bttv.io.lookupUser(user);

    if (tmi()) {
        if (store.displayNames.hasOwnProperty(user)) {
            return store.displayNames[user] || user.capitalize();
        } else if (user !== 'jtv' && user !== 'twitchnotify') {
            return user.capitalize();
        } else {
            return user;
        }
    } else {
        return user.capitalize();
    }
};

var tcCommands = [
    'mod',
    'unmod',
    'ban',
    'unban',
    'timeout',
    'purge',
    'host',
    'unhost',
    'b',
    't',
    'u',
    'w',
    'p'
];

var detectServerCommand = function(input) {
    input = input.split(' ');

    if (input.length < 2) return false;

    input.pop();
    var checkCommand = input[input.length - 1];

    if (input[0] !== checkCommand) return false;

    for (var i = 0; i < tcCommands.length; i++) {
        var r = new RegExp('^(\\/|\\.)' + tcCommands[i] + '$', 'i');

        if (r.test(checkCommand)) return true;
    }

    return false;
};

exports.parseTags = function(tags) {
    var rawTags = tags.slice(1, tags.length).split(';');

    tags = {};

    for (var i = 0; i < rawTags.length; i++) {
        var tag = rawTags[i];
        var pair = tag.split('=');
        tags[pair[0]] = pair[1];
    }

    return tags;
};

exports.parseRoomState = function(e) {
    try {
        channelState({
            type: 'roomstate',
            tags: e.tags
        });
    } catch(err) {
        debug.log('Couldn\'t handle roomstate update.', err);
    }
};

var completableEmotes = function() {
    var completableEmotesList = [];

    bttv.chat.emotes().forEach(function(emote) {
        if (!emote.text) return;

        completableEmotesList.push(emote.text);
    });

    try {
        var usableEmotes = tmi().tmiSession._emotesParser.emoticonRegexToIds;

        for (var emote in usableEmotes) {
            if (!usableEmotes.hasOwnProperty(emote)) continue;

            if (usableEmotes[emote].isRegex === true) continue;

            completableEmotesList.push(emote);
        }
    } catch(e) {
        debug.log('Couldn\'t grab user emotes for tab completion.', e);
    }

    return completableEmotesList;
};

var suggestions = exports.suggestions = function(words, index) {
    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');
    var $suggestions = $chatInterface.find('.suggestions');
    if ($suggestions.length) $suggestions.remove();

    var input = $chatInput.val();
    var sentence = input.trim().split(' ');
    var lastWord = sentence.pop();
    if (
        lastWord.charAt(0) !== '@' &&
        !detectServerCommand(input) &&
        bttv.settings.get('tabCompletionTooltip') === false
    ) {
        return;
    }

    $suggestions = $chatInterface.find('.textarea-contain').append(templates.suggestions(words, index)).find('.suggestions');
    $suggestions.find('.suggestion').on('click', function() {
        var user = $(this).text();
        sentence = $chatInput.val().trim().split(' ');
        lastWord = (detectServerCommand(input) && !sentence[1]) ? '' : sentence.pop();

        var isEmote = (completableEmotes().indexOf(user) !== -1);

        if (!isEmote) {
            if (lastWord.charAt(0) === '@') {
                sentence.push('@' + lookupDisplayName(user));
            } else {
                sentence.push(lookupDisplayName(user));
            }
        } else {
            sentence.push(user);
        }

        if (sentence.length === 1 && !isEmote) {
            $chatInput.val(sentence.join(' ') + ', ');
        } else {
            $chatInput.val(sentence.join(' ') + ' ');
        }

        $suggestions.remove();
    }).on('mouseover', function() {
        var $firstElement = $suggestions.find('.suggestion').eq(0);
        $firstElement.parent().removeClass('highlighted');

        $(this).parent().addClass('highlighted');
    }).on('mouseout', function() {
        $(this).parent().removeClass('highlighted');
    });
    $suggestions.on('click', function() {
        $(this).remove();
    });
};

exports.tabCompletion = function(e) {
    var keyCode = e.keyCode || e.which;
    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');

    var input = $chatInput.val();
    var sentence = input.trim().split(' ');
    var lastWord = sentence.pop().replace(/,$/, '');

    // If word is an emote, casing is important
    var emotes = completableEmotes();
    if (emotes.indexOf(lastWord) === -1) {
        lastWord = lastWord.toLowerCase();
    }

    if ((detectServerCommand(input) || keyCode === keyCodes.Tab || lastWord.charAt(0) === '@') && keyCode !== keyCodes.Enter) {
        var sugStore = store.suggestions;

        var currentMatch = lastWord.replace(/^@/, '');
        var currentIndex = sugStore.matchList.indexOf(currentMatch);

        var user;

        if (currentMatch === sugStore.lastMatch && currentIndex > -1) {
            var nextIndex;
            var prevIndex;

            if (currentIndex + 1 < sugStore.matchList.length) {
                nextIndex = currentIndex + 1;
            } else {
                nextIndex = sugStore.matchList.length - 1;
            }

            if (currentIndex - 1 >= 0) {
                prevIndex = currentIndex - 1;
            } else {
                prevIndex = 0;
            }

            var index = e.shiftKey ? prevIndex : nextIndex;

            user = sugStore.matchList[index];

            if (sugStore.matchList.length < 6) {
                suggestions(sugStore.matchList, index);
            } else {
                var slice;

                if (index - 2 < 0) {
                    slice = 0;
                } else if (index + 2 > sugStore.matchList.length - 1) {
                    slice = sugStore.matchList.length - 5;
                    index = (index === sugStore.matchList.length - 1) ? 4 : 3;
                } else {
                    slice = index - 2;
                    index = 2;
                }

                suggestions(sugStore.matchList.slice(slice, slice + 5), index);
            }
        } else {
            var search = currentMatch;
            var users = Object.keys(store.chatters);

            var recentWhispers = [];

            if (detectServerCommand(input)) {
                for (var i = users.length; i >= 0; i--) {
                    if (store.chatters[users[i]] !== undefined && store.chatters[users[i]].lastWhisper !== 0) {
                        recentWhispers.push(users[i]);
                        users.splice(i, 1);
                    }
                }

                recentWhispers.sort(function(a, b) {
                    return store.chatters[b].lastWhisper - store.chatters[a].lastWhisper;
                });
            }

            users.sort();
            users = recentWhispers.concat(users);

            // Mix in emotes if not directly asking for a user
            if (lastWord.charAt(0) !== '@' && !detectServerCommand(input)) {
                users = users.concat(emotes);
            }

            if (users.indexOf(vars.userData.login) > -1) users.splice(users.indexOf(vars.userData.login), 1);

            if (/^(\/|\.)/.test(search)) {
                search = '';
            }

            if (search.length) {
                users = users.filter(function(userToFilter) {
                    var lcUser = userToFilter.toLowerCase();
                    return (lcUser.search(search) === 0);
                });
            }

            if (!users.length) return;

            sugStore.matchList = users;

            suggestions(users.slice(0, 5), 0);

            user = users[0];
        }

        var $suggestions = $chatInterface.find('.suggestions');
        setTimeout(function() {
            $suggestions.remove();
        }, 10000);

        if (keyCode !== keyCodes.Tab) return;

        sugStore.lastMatch = user;

        // Casing is important for emotes
        var isEmote = true;
        if (emotes.indexOf(user) === -1) {
            user = lookupDisplayName(user);
            isEmote = false;
        }

        if (/^(\/|\.)/.test(lastWord)) {
            user = lastWord + ' ' + user;
            $chatInput.val(user);
            return;
        }

        if (lastWord.charAt(0) === '@') {
            user = '@' + user;
        }

        sentence.push(user);

        if (sentence.length === 1 && !isEmote) {
            $chatInput.val(sentence.join(' ') + ', ');
        } else {
            $chatInput.val(sentence.join(' '));
        }
    }
};

var serverMessage = exports.serverMessage = function(message, displayTimestamp) {
    var handlers = require('./handlers');
    handlers.onPrivmsg(store.currentRoom, {
        from: 'jtv',
        date: displayTimestamp ? new Date() : null,
        message: message,
        style: 'admin'
    });
};

exports.whisperReply = function() {
    var $chatInput = $('.ember-chat .chat-interface').find('textarea');
    if ($chatInput.val() === '/r ' && bttv.settings.get('disableWhispers') === false) {
        var to = ($.grep(store.__rooms[store.currentRoom].messages, function(msg) {
            return (msg.style === 'whisper' && msg.from.toLowerCase() !== vars.userData.login);
        }).pop() || {from: null}).from;
        if (to) {
            $chatInput.val('/w ' + to + ' ');
        } else {
            $chatInput.val('');
            serverMessage('You have not received any whispers', true);
        }
    }
};
exports.chatLineHistory = function($chatInput, e) {
    if (bttv.settings.get('chatLineHistory') === false) return;

    var keyCode = e.keyCode || e.which;

    var historyIndex = store.chatHistory.indexOf($chatInput.val().trim());
    if (keyCode === keyCodes.UpArrow) {
        if (historyIndex >= 0) {
            if (store.chatHistory[historyIndex + 1]) {
                $chatInput.val(store.chatHistory[historyIndex + 1]);
            }
        } else {
            if ($chatInput.val().trim().length) {
                store.chatHistory.unshift($chatInput.val().trim());
                $chatInput.val(store.chatHistory[1]);
            } else {
                $chatInput.val(store.chatHistory[0]);
            }
        }
    } else if (keyCode === keyCodes.DownArrow) {
        if (historyIndex >= 0) {
            if (store.chatHistory[historyIndex - 1]) {
                $chatInput.val(store.chatHistory[historyIndex - 1]);
            } else {
                $chatInput.val('');
            }
        }
    }
};

exports.notifyMessage = function(type, message) {
    var handlers = require('./handlers');
    var tagType = (bttv.settings.get('showJTVTags') === true && ['moderator', 'broadcaster', 'admin', 'global-moderator', 'staff', 'bot'].indexOf(type) !== -1) ? 'old' + type : type;
    handlers.onPrivmsg(store.currentRoom, {
        from: 'twitchnotify',
        date: new Date(),
        badges: [{
            type: tagType,
            name: ((bttv.settings.get('showJTVTags') && type !== 'subscriber' && type !== 'turbo') ? type.capitalize() : ''),
            description: tagType.capitalize()
        }],
        message: message,
        style: 'notification'
    });
};

exports.sendMessage = function(message) {
    if (!message || message === '') return;
    if (tmi()) {
        if (!vars.userData.isLoggedIn) {
            try {
                window.Ember.$.login();
            } catch(e) {
                serverMessage('You must be logged into Twitch to send messages.');
            }

            return;
        }

        if (bttv.settings.get('anonChat') === true) {
            serverMessage('You can\'t send messages when Anon Chat is enabled. You can disable Anon Chat in the BetterTTV settings.');
            return;
        }

        if (message.charAt(0) === '/' || message.charAt(0) === '.') {
            message = message.split(' ');
            message[0] = message[0].toLowerCase();
            message = message.join(' ');
        }

        tmi().tmiRoom.sendMessage(message);

        try {
            if (!/^\/w(\s|$)/.test(message)) {
                channelState({
                    type: 'outgoing_message'
                });
                tmi().trackSubOnly(message);
                tmi().trackChat();
            }
        } catch(e) {
            debug.log('Error sending tracking data to Twitch');
        }

        // Fixes issue when using Twitch's sub emote selector
        tmi().set('messageToSend', '');
        tmi().set('savedInput', '');
    }
};

exports.reparseMessages = function(user) {
    if (!user || !user.length) return;

    bttv.jQuery('.chat-line[data-sender="' + user + '"] .message').each(function() {
        var message = $(this);

        var rawMessage = decodeURIComponent(message.data('raw'));
        var emotes = message.data('emotes') ? JSON.parse(decodeURIComponent(message.data('emotes'))) : false;
        var color = message.attr('style') ? message.attr('style').split(': ')[1] : false;

        message.replaceWith(templates.message(user, rawMessage, emotes, color));
    });
};

exports.listMods = function() {
    if (tmi()) return tmi().tmiRoom._roomUserLabels._sets;
    return {};
};

exports.addMod = function(user) {
    if (!user || user === '') return false;
    if (tmi()) tmi().tmiRoom._roomUserLabels.add(user, 'mod');
};

exports.removeMod = function(user) {
    if (!user || user === '') return false;
    if (tmi()) tmi().tmiRoom._roomUserLabels.remove(user, 'mod');
};

exports.isIgnored = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiSession.isIgnored(user);
};

var isOwner = exports.isOwner = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('owner') !== -1;
};

var isAdmin = exports.isAdmin = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('admin') !== -1;
};

var isGlobalMod = exports.isGlobalMod = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('global_mod') !== -1;
};

var isStaff = exports.isStaff = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('staff') !== -1;
};

var isModerator = exports.isModerator = function(user) {
    if (!user || user === '') return false;
    return tmi() && (tmi().tmiRoom.getLabels(user).indexOf('mod') !== -1 ||
                    isAdmin(user) || isStaff(user) || isOwner(user) || isGlobalMod(user));
};

exports.isTurbo = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('turbo') !== -1;
};

exports.isSubscriber = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('subscriber') !== -1;
};

exports.getBadges = function(user) {
    if (!user || user === '') return false;
    var badges = [];
    if (tmi() && tmi().tmiRoom.getLabels(user)) badges = tmi().tmiRoom.getLabels(user);
    if (store.__subscriptions[user] && store.__subscriptions[user].indexOf(bttv.getChannel()) !== -1) badges.push('subscriber');
    if (store.__channelBots.indexOf(user) > -1 || (bots.indexOf(user) > -1 && isModerator(user))) badges.push('bot');
    return badges;
};

exports.hasGlow = function(user) {
    if (!user || user === '') return false;
    if (store.__subscriptions[user] && store.__subscriptions[user].indexOf('_glow') !== -1) return true;
};

exports.getColor = function(user) {
    if (!user || user === '') return false;
    return tmi() ? tmi().tmiSession.getColor(user) : null;
};

exports.getEmotes = function(user) {
    if (!user || user === '') return false;
    var emotes = [];
    if (tmi() && tmi().tmiRoom.getEmotes && tmi().tmiRoom.getEmotes(user)) emotes = tmi().tmiRoom.getEmotes(user);
    if (store.__subscriptions[user]) {
        store.__subscriptions[user].forEach(function(channel) {
            emotes.push(channel);
        });
    }
    return emotes;
};

exports.getSpecials = function(user) {
    if (!user || user === '') return false;
    var specials = [];
    if (tmi() && tmi().tmiSession && tmi().tmiSession._users) specials = tmi().tmiSession._users.getSpecials(user);
    if (store.__subscriptions[user] && store.__subscriptions[user].indexOf(bttv.getChannel()) !== -1) specials.push('subscriber');
    return specials;
};

exports.scrollChat = function() {
    var $chat = $('.ember-chat');

    var chatPaused = $chat.find('.chat-interface').children('span').children('.more-messages-indicator').length;

    if (chatPaused || !$chat.length) return;

    var $chatMessages = $chat.find('.chat-messages');
    var $chatScroller = $chatMessages.children('.tse-scroll-content');
    var $chatLines = $chatScroller.children('.tse-content').children('.chat-lines').children('div.chat-line');

    setTimeout(function() {
        if (!$chatScroller.length) return;

        $chatScroller[0].scrollTop = $chatScroller[0].scrollHeight;
    });

    var linesToDelete = $chatLines.length - bttv.settings.get('scrollbackAmount');

    if (linesToDelete <= 0) return;

    $chatLines.slice(0, linesToDelete).each(function() {
        $(this).remove();
    });
};

exports.calculateColor = function(color) {
    var colorRegex = /^#[0-9a-f]+$/i;
    if (colorRegex.test(color)) {
        while (((calculateColorBackground(color) === 'light' && bttv.settings.get('darkenedMode') === true) || (calculateColorBackground(color) === 'dark' && bttv.settings.get('darkenedMode') !== true))) {
            color = calculateColorReplacement(color, calculateColorBackground(color));
        }
    }

    return color;
};
var surrogateOffset = function(surrogates, index) {
    var offset = index;

    for (var id in surrogates) {
        if (!surrogates.hasOwnProperty(id)) continue;
        if (id < index) offset++;
    }

    return offset;
};

exports.handleSurrogatePairs = function(message, emotes) {
    // Entire message decoded to array of char codes, combines
    // surrogate pairs to a single index
    var decoded = punycode.ucs2.decode(message);

    var surrogates = {};
    var i;
    for (i = 0; i < decoded.length; i++) {
        // Not surrogate
        if (decoded[i] <= 0xFFFF) continue;

        surrogates[i] = true;
    }

    // We can loop through all emote ids and all indexes that id
    // appears in the message, offsetting the indexes +1 for each
    // surrogate pair occurring before the index
    for (var id in emotes) {
        if (!emotes.hasOwnProperty(id)) continue;

        var emote = emotes[id];
        for (i = emote.length - 1; i >= 0; i--) {
            for (var j = 0; j < emote[i].length; j++) {
                emote[i][j] = surrogateOffset(surrogates, emote[i][j]);
            }
        }
    }

    return emotes;
};

exports.loadBadges = function() {
    if ($('#bttv_volunteer_badges').length) return;

    $.getJSON('https://api.betterttv.net/2/badges').done(function(data) {
        var $style = $('<style />');

        $style.attr('id', 'bttv_volunteer_badges');

        data.types.forEach(function(badge) {
            $style.append('.ember-chat .badges .bttv-' + badge.name + ' { background: url("' + badge.svg + '"); background-size: 100%; }');
            store.__badgeTypes[badge.name] = badge;
        });

        $style.appendTo('head');

        data.badges.forEach(function(user) {
            store.__badges[user.name] = user.type;
        });
    });
};

exports.assignBadges = function(badges, data) {
    data = data || {};
    var bttvBadges = [];
    var legacyTags = require('../legacy-tags')(data);

    if (badges.indexOf('staff') !== -1) {
        bttvBadges.push({
            type: 'staff',
            name: 'Staff',
            description: 'Twitch Staff'
        });
    } else if (badges.indexOf('admin') !== -1) {
        bttvBadges.push({
            type: 'admin',
            name: 'Admin',
            description: 'Twitch Admin'
        });
    } else if (badges.indexOf('global_mod') !== -1) {
        bttvBadges.push({
            type: 'global-moderator',
            name: 'GMod',
            description: 'Twitch Global Moderator'
        });
    } else if (badges.indexOf('bot') !== -1) {
        bttvBadges.push({
            type: 'bot',
            name: 'Bot',
            description: 'Channel Bot'
        });
    } else if (badges.indexOf('owner') !== -1 && !legacyTags[data.from]) {
        bttvBadges.push({
            type: 'broadcaster',
            name: 'Host',
            description: 'Channel Broadcaster'
        });
    } else if (badges.indexOf('mod') !== -1 && !legacyTags[data.from]) {
        bttvBadges.push({
            type: 'moderator',
            name: 'Mod',
            description: 'Channel Moderator'
        });
    }

    // Legacy Swag Tags
    if (
        legacyTags[data.from] &&
        (
            (
                legacyTags[data.from].mod === true && isModerator(data.from)
            ) ||
            legacyTags[data.from].mod === false
        )
    ) {
        var userData = legacyTags[data.from];

        // Shouldn't be setting color and nickname here, but it's legacy so
        if (userData.color && data.style !== 'action') data.color = userData.color;
        if (userData.nickname) data.bttvDisplayName = userData.nickname;

        bttvBadges.unshift({
            type: userData.tagType,
            name: userData.tagName,
            description: 'Grandfathered BetterTTV Swag Tag'
        });
    }

    // Volunteer badges
    if (data.from in store.__badges) {
        var type = store.__badges[data.from];
        bttvBadges.push({
            type: 'bttv-' + type,
            name: '',
            description: store.__badgeTypes[type].description
        });
    }

    if (badges.indexOf('turbo') !== -1) {
        bttvBadges.push({
            type: 'turbo',
            name: '',
            description: 'Twitch Turbo'
        });
    }

    if (badges.indexOf('subscriber') !== -1) {
        bttvBadges.push({
            type: 'subscriber',
            name: '',
            description: 'Channel Subscriber'
        });
    }

    bttvBadges.forEach(function(badge) {
        if (
            bttv.settings.get('showJTVTags') === false &&
            badge.description !== 'Grandfathered BetterTTV Swag Tag'
        ) {
            badge.name = '';
            return;
        }

        if (
            [
                'moderator',
                'broadcaster',
                'admin',
                'global-moderator',
                'staff',
                'bot'
            ].indexOf(badge.type) === -1
        ) {
            return;
        }

        badge.type = 'old' + badge.type;
    });

    return bttvBadges;
};

exports.ban = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom ? tmi().tmiRoom.banUser(user) : null;
};

exports.timeout = function(user, time) {
    time = time || 600;
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom ? tmi().tmiRoom.timeoutUser(user + ' ' + time) : null;
};

var unban = exports.unban = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom ? tmi().tmiRoom.unbanUser(user) : null;
};

var massUnban = exports.massUnban = function() {
    if (!vars.userData.isLoggedIn || vars.userData.login !== bttv.getChannel()) {
        serverMessage("You're not the channel owner.");
        return;
    }

    var bannedUsers = [];
    serverMessage('Fetching banned users...');
    $.ajax({url: '/settings/channel', cache: !1, timeoutLength: 6E3, dataType: 'html'}).done(function(chatInfo) {
        if (chatInfo) {
            $(chatInfo).find('#banned_chatter_list .ban .obj').each(function() {
                var user = $(this).text().trim();
                if (store.__unbannedUsers.indexOf(user) === -1 && bannedUsers.indexOf(user) === -1) bannedUsers.push(user);
            });
            if (bannedUsers.length > 0) {
                serverMessage('Fetched ' + bannedUsers.length + ' banned users.');
                if (bannedUsers.length > 10) {
                    serverMessage('Starting purge process in 5 seconds. Get ready for a spam fest!');
                } else {
                    serverMessage('Starting purge process in 5 seconds.');
                }
                serverMessage('By my calculations, this block of users will take ' + (bannedUsers.length * 0.333).toFixed(1) + ' minutes to unban.');
                if (bannedUsers.length > 70) serverMessage('Twitch only provides up to 100 users at a time (some repeat), but this script will cycle through all of the blocks of users.');
                setTimeout(function() {
                    var startTime = 0;
                    bannedUsers.forEach(function(user) {
                        setTimeout(function() {
                            unban(user);
                            store.__unbannedUsers.push(user);
                        }, startTime += 333);
                    });
                    setTimeout(function() {
                        serverMessage('This block of users has been purged. Checking for more..');
                        massUnban();
                    }, startTime += 333);
                }, 5000);
            } else {
                serverMessage('You have no banned users.');
                store.__unbannedUsers = [];
            }
        }
    });
};

exports.translate = function($element, sender, text) {
    var language = (window.cookie && window.cookie.get('language')) ? window.cookie.get('language') : 'en';

    var qs = $.param({
        target: language,
        q: text
    });

    $.getJSON('https://api.betterttv.net/2/translate?' + qs).success(function(data) {
        $element.replaceWith(templates.message(sender, data.translation));
    }).error(function(data) {
        if (data.responseJSON && data.responseJSON.message) {
            $element.text(data.responseJSON.message);
        } else {
            $element.text('Translation Error');
        }
    });
};

},{"../bots":1,"../features/channel-state":21,"../helpers/colors":45,"../helpers/debug":46,"../keycodes":50,"../legacy-tags":51,"../vars":64,"./handlers":4,"./store":8,"./templates":10,"./tmi":11,"punycode":67}],6:[function(require,module,exports){

// Add mouseover image preview to image links
module.exports = function(imgUrl) {
    return '<a href="' + imgUrl + '" class="chat-preview" target="_blank">' + imgUrl + '</a>';
};

},{}],7:[function(require,module,exports){
/* eslint "no-use-before-define": 0 */

var tmi = require('./tmi'),
    store = require('./store');

var newRoom = exports.newRoom = function(name) {
    var handlers = require('./handlers');
    var emberRoom = null;
    var groupRooms = bttv.getChatController().get('connectedPrivateGroupRooms');
    var channelRoom = bttv.getChatController().get('currentChannelRoom');
    var i;

    if (channelRoom.get('id') === name) {
        emberRoom = channelRoom;
    } else {
        for (i = 0; i < groupRooms.length; i++) {
            if (groupRooms[i].get('id') === name) {
                emberRoom = groupRooms[i];
                break;
            }
        }
    }
    store.__rooms[name] = {
        name: name,
        unread: 0,
        emberRoom: emberRoom,
        active: function() { return (bttv.getChatController() && bttv.getChatController().currentRoom && bttv.getChatController().currentRoom.get('id') === name) ? true : false; },
        messages: [],
        playQueue: function() {
            store.__rooms[name].unread = 0;
            handlers.countUnreadMessages();
            for (i = 0; i < store.__rooms[name].messages.length; i++) {
                var message = store.__rooms[name].messages[i];
                handlers.onPrivmsg(name, message);
            }
        },
        queueMessage: function(message) {
            if (store.__rooms[name].messages.length > bttv.settings.get('scrollbackAmount')) {
                store.__rooms[name].messages.shift();
            }
            store.__rooms[name].messages.push(message);
        },
        chatHandler: function(data) {
            if (data.from && data.from !== 'jtv') getRoom(name).queueMessage(data);

            if (getRoom(name).active()) {
                handlers.onPrivmsg(name, data);
            } else {
                store.__rooms[name].unread++;
                handlers.countUnreadMessages();
            }
        }
    };
};

var getRoom = exports.getRoom = function(name) {
    if (!store.__rooms[name]) {
        var handlers = require('./handlers');
        newRoom(name);
        if (tmi().tmiRoom) {
            delete tmi().tmiRoom._events.message;
            delete tmi().tmiRoom._events.clearchat;
            tmi().tmiRoom.on('message', getRoom(name).chatHandler);
            tmi().tmiRoom.on('clearchat', handlers.clearChat);
        }
    }
    return store.__rooms[name];
};

exports.getRooms = function() {
    return Object.keys(store.__rooms);
};

},{"./handlers":4,"./store":8,"./tmi":11}],8:[function(require,module,exports){
exports.__rooms = {};
exports.__messageQueue = [];
exports.__reportedErrors = [];
exports.__subscriptions = {};
exports.__unbannedUsers = [];
exports.__channelBots = [];
exports.__badgeTypes = {};
exports.__badges = {};
exports.displayNames = {};
exports.trackTimeouts = {};
exports.chatters = {};
exports.tabCompleteHistory = [];
exports.suggestions = {
    matchList: [],
    lastMatch: ''
};
exports.chatHistory = [];
exports.bttvEmotes = {};
exports.autoCompleteEmotes = {};

// as these aren't objects, they can't be local variables (otherwise we wouldn't be able to modify them from outside)
exports.__messageTimer = false;
exports.currentRoom = '';
exports.activeView = true;

},{}],9:[function(require,module,exports){
var vars = require('../vars'),
    debug = require('../helpers/debug'),
    keyCodes = require('../keycodes');
var store = require('./store'),
    handlers = require('./handlers'),
    helpers = require('./helpers'),
    rooms = require('./rooms'),
    templates = require('./templates');
var overrideEmotes = require('../features/override-emotes'),
    loadChatSettings = require('../features/chat-load-settings'),
    anonChat = require('../features/anon-chat');

var takeover = module.exports = function() {
    var tmi = require('./tmi')();
    var channel;

    // Anonymize Chat if it isn't already
    anonChat();

    if (bttv.settings.get('disableUsernameColors') === true) {
        $('.ember-chat .chat-room').addClass('no-name-colors');
    } else {
        $('.ember-chat .chat-room').removeClass('no-name-colors');
    }

    if (store.isLoaded) return;

    // Hides Group List if coming from directory
    bttv.getChatController().set('showList', false);

    if (tmi.get('isLoading')) {
        debug.log('chat is still loading');
        setTimeout(function() {
            takeover();
        }, 1000);
        return;
    }

    // Default timestamps & mod icons to on
    var settings = bttv.storage.getObject('chatSettings');
    if (typeof settings.showModIcons === 'undefined') {
        settings.showModIcons = true;
        $('.ember-chat .chat-messages').removeClass('hideModIcons');
        bttv.storage.putObject('chatSettings', settings);
    }
    if (typeof settings.showTimestamps === 'undefined') {
        settings.showTimestamps = true;
        $('.ember-chat .chat-messages').removeClass('hideTimestamps');
        bttv.storage.putObject('chatSettings', settings);
    }
    if (settings.darkMode === true) {
        settings.darkMode = false;
        $('.chat-container').removeClass('dark');
        bttv.storage.putObject('chatSettings', settings);
        bttv.settings.save('darkenedMode', true);
    }

    store.isLoaded = true;

    // Take over listeners
    debug.log('Loading chat listeners');
    for (channel in tmi.tmiSession._rooms) {
        if (tmi.tmiSession._rooms.hasOwnProperty(channel)) {
            delete tmi.tmiSession._rooms[channel]._events.message;
            delete tmi.tmiSession._rooms[channel]._events.clearchat;
            delete tmi.tmiSession._rooms[channel]._events.notice;
        }
    }

    // Handle Channel Chat
    rooms.newRoom(bttv.getChannel());
    tmi.tmiRoom.on('message', rooms.getRoom(bttv.getChannel()).chatHandler);
    tmi.tmiRoom.on('clearchat', handlers.clearChat);
    tmi.tmiRoom.on('notice', handlers.notice);
    tmi.tmiRoom.on('roomstate', helpers.parseRoomState);
    if (tmi.channel) tmi.set('name', tmi.channel.get('display_name'));
    store.currentRoom = bttv.getChannel();
    // tmi.tmiRoom.on('labelschanged', handlers.labelsChanged);

    // Fake the initial roomstate
    helpers.parseRoomState({
        tags: {
            'subs-only': tmi.get('subsOnly'),
            slow: tmi.get('slow'),
            r9k: tmi.get('r9k')
        }
    });

    // Handle Group Chats
    var privateRooms = bttv.getChatController().get('connectedPrivateGroupRooms');
    if (privateRooms && privateRooms.length > 0) {
        privateRooms.forEach(function(room) {
            rooms.newRoom(room.get('id'));
            room.tmiRoom.on('message', rooms.getRoom(room.get('id')).chatHandler);
            room.tmiRoom.on('clearchat', handlers.clearChat);
        });
    }

    // Load BTTV emotes if not loaded
    overrideEmotes();
    var i;
    var bttvEmoteKeys = Object.keys(store.bttvEmotes);
    for (i = bttvEmoteKeys.length - 1; i >= 0; i--) {
        var bttvEmoteKey = bttvEmoteKeys[i];
        if (!store.bttvEmotes[bttvEmoteKey].channelEmote) continue;
        delete store.bttvEmotes[bttvEmoteKey];
    }
    store.__channelBots = [];
    $.getJSON('https://api.betterttv.net/2/channels/' + bttv.getChannel()).done(function(data) {
        data.emotes.forEach(function(bttvEmote) {
            bttvEmote.channelEmote = true;
            bttvEmote.urlTemplate = data.urlTemplate.replace('{{id}}', bttvEmote.id);
            bttvEmote.url = bttvEmote.urlTemplate.replace('{{image}}', '1x');
            store.bttvEmotes[bttvEmote.code] = bttvEmote;
        });
        store.__channelBots = data.bots;
    });

    // Load Volunteer Badges
    helpers.loadBadges();

    // Load Chat Settings
    loadChatSettings();

    // Hover over links
    $('body').off('mouseover', '.chat-line .message a').on('mouseover', '.chat-line .message a', function() {
        var $this = $(this);

        var encodedURL = encodeURIComponent($this.attr('href'));
        $.getJSON('https://api.betterttv.net/2/link_resolver/' + encodedURL).done(function(data) {
            if (!data.tooltip || !$this.is(':hover')) return;

            $this.tipsy({
                trigger: 'manual',
                gravity: $.fn.tipsy.autoNS,
                html: true,
                title: function() { return data.tooltip; }
            });
            $this.tipsy('show');
        });
    }).off('mouseout', '.chat-line .message a').on('mouseout', '.chat-line .message a', function() {
        $(this).tipsy('hide');
        $('div.tipsy').remove();
    });

    // Hover over icons
    $('body').off('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a').on('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a', function() {
        $(this).tipsy({
            trigger: 'manual',
            gravity: 'sw'
        });
        $(this).tipsy('show');
    }).off('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a').on('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a', function() {
        $(this).tipsy('hide');
        $('div.tipsy').remove();
    });

    // hover over mod card icons
    $('body').off('mouseover', '.bttv-mod-card button').on('mouseover', '.bttv-mod-card button', function() {
        $(this).tipsy({
            trigger: 'manual',
            gravity: 's'
        });
        $(this).tipsy('show');
    }).off('mouseout', '.bttv-mod-card button').on('mouseout', '.bttv-mod-card button', function() {
        $(this).tipsy('hide');
        $('div.tipsy').remove();
    });

    // Make Timeout/Ban/Unban buttons work and Turbo/Subscriber clickable
    $('body').off('click', '.chat-line .mod-icons .timeout').on('click', '.chat-line .mod-icons .timeout', function() {
        helpers.timeout($(this).parents('.chat-line').data('sender'));
        $(this).parent().children('.ban').hide();
        $(this).parent().children('.unban').show();
    }).off('click', '.chat-line .mod-icons .ban').on('click', '.chat-line .mod-icons .ban', function() {
        helpers.ban($(this).parents('.chat-line').data('sender'));
        $(this).parent().children('.ban').hide();
        $(this).parent().children('.unban').show();
    }).off('click', '.chat-line .mod-icons .unban').on('click', '.chat-line .mod-icons .unban', function() {
        helpers.unban($(this).parents('.chat-line').data('sender'));
        $(this).parent().children('.ban').show();
        $(this).parent().children('.unban').hide();
    }).off('click', '.chat-line .badges .turbo, .chat-line .badges .subscriber').on('click', '.chat-line .badges .turbo, .chat-line .badges .subscriber', function() {
        if ($(this).hasClass('turbo')) {
            window.open('/products/turbo?ref=chat_badge', '_blank');
        } else if ($(this).hasClass('subscriber')) {
            window.open(Twitch.url.subscribe(bttv.getChannel(), 'in_chat_subscriber_link'), '_blank');
        }
    });

    // Make names clickable
    $('body').off('click', '.chat-line .from').on('click', '.chat-line .from', function() {
        var sender = $(this).data('sender') || $(this).parent().data('sender');
        handlers.moderationCard(sender + '', $(this));
    });

    // Give some tips to Twitch Emotes
    if (bttv.TwitchEmoteSets && tmi.product && tmi.product.emoticons) {
        for (i = 0; i < tmi.product.emoticons.length; i++) {
            var emote = tmi.product.emoticons[i];

            if (emote.state && emote.state === 'active' && !bttv.TwitchEmoteSets[emote.emoticon_set]) {
                channel = bttv.getChannel();
                $.post('https://api.betterttv.net/2/emotes/channel_tip/' + encodeURIComponent(channel)).done(function() {
                    debug.log('Gave an emote tip about ' + channel);
                }).fail(function() {
                    debug.log('Error giving an emote tip about ' + channel);
                });
                break;
            }
        }
    }

    // Make chat translatable
    if (!vars.loadedDoubleClickTranslation && bttv.settings.get('dblclickTranslation') !== false) {
        vars.loadedDoubleClickTranslation = true;
        $('body').on('dblclick', '.chat-line .message', function() {
            var sender = $(this).parent().data('sender');
            var message = decodeURIComponent($(this).data('raw'));

            if ($(this).hasClass('timed-out')) {
                $(this).replaceWith(templates.message(sender, message));
            } else {
                helpers.translate($(this), sender, message);
                $(this).text('Translating..');
            }
            $('div.tipsy').remove();
        });
    }

    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');
    var $chatSend = $chatInterface.find('.send-chat-button');

    // Disable Twitch's chat senders
    $chatInput.off('keydown').off('keyup').off('mouseup');
    $chatSend.off();

    // Message input features (tab completion, message history)
    $chatInput.on('keyup', function(e) {
        // '@' completion is captured only on keyup
        if (e.which === keyCodes.Tab || e.which === keyCodes.Shift) return;
        helpers.tabCompletion(e);
        helpers.whisperReply(e);
    });

    // Implement our own text senders (+ commands & legacy tab completion)
    $chatInput.on('keydown', function(e) {
        var $suggestions = $chatInterface.find('.suggestions');

        if (e.which === keyCodes.Enter) {
            var val = $chatInput.val().trim(),
                bttvCommand = false;
            if (e.shiftKey || !val.length) {
                return e.preventDefault();
            }

            if ($suggestions.length) {
                $suggestions.find('.highlighted').children().click();
                return e.preventDefault();
            }

            if (val.charAt(0) === '/') {
                bttvCommand = handlers.commands(val);
            }

            // Easter Egg Kappa
            var words = val.toLowerCase().split(' ');
            if (words.indexOf('twitch') > -1 && words.indexOf('amazon') > -1 && words.indexOf('google') > -1) {
                helpers.serverMessage('<img src="https://cdn.betterttv.net/special/twitchtrollsgoogle.gif"/>');
            }

            if (!bttvCommand) {
                helpers.sendMessage(val);
            }

            if (bttv.settings.get('chatLineHistory') === true) {
                if (store.chatHistory.indexOf(val) !== -1) {
                    store.chatHistory.splice(store.chatHistory.indexOf(val), 1);
                }
                store.chatHistory.unshift(val);
            }

            $chatInput.val('');
            return e.preventDefault();
        }

        if ($suggestions.length && e.which !== keyCodes.Shift) {
            $suggestions.remove();
        }

        /* eslint-disable */
        // No idea why /^(\/|.)w $/.test(val) is there, val is undefined
        // Actual tabs must be captured on keydown
        if ((e.which === keyCodes.Tab && !e.ctrlKey) || /^(\/|.)w $/.test(val)) {
            helpers.tabCompletion(e);
            e.preventDefault();
        }
        /* eslint-enable */

        helpers.chatLineHistory($chatInput, e);
    });
    $chatSend.on('click', function() {
        var val = $chatInput.val().trim(),
            bttvCommand = false;
        if (!val.length) return;

        if (val.charAt(0) === '/') {
            bttvCommand = handlers.commands(val);
        }

        if (!bttvCommand) {
            helpers.sendMessage(val);
        }

        if (bttv.settings.get('chatLineHistory') === true) {
            if (store.chatHistory.indexOf(val) !== -1) {
                store.chatHistory.splice(store.chatHistory.indexOf(val), 1);
            }
            store.chatHistory.unshift(val);
        }

        $chatInput.val('');
    });

    $('.ember-chat .chat-messages .chat-line').remove();
    $.getJSON('https://api.betterttv.net/2/channels/' + encodeURIComponent(bttv.getChannel()) + '/history').done(function(data) {
        if (data.messages.length) {
            data.messages.forEach(function(message) {
                var badges = [];
                if (message.user.name === message.channel.name) badges.push('owner');

                if (bttv.chat.helpers.isIgnored(message.user.name)) return;

                message = bttv.chat.templates.privmsg(false, false, false, false, {
                    message: message.message,
                    time: (new Date(message.date.replace('T', ' ').replace(/\.[0-9]+Z/, ' GMT'))).toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
                    nickname: message.user.displayName,
                    sender: message.user.name,
                    badges: bttv.chat.helpers.assignBadges(badges),
                    color: bttv.chat.helpers.calculateColor(message.user.color),
                    emotes: message.parsedEmotes
                });

                $('.ember-chat .chat-messages .tse-content .chat-lines').append(message);
            });
        }
    }).always(function() {
        helpers.serverMessage('<center><small>BetterTTV v' + bttv.info.version + ' Loaded.</small></center>');
        helpers.serverMessage('Welcome to ' + helpers.lookupDisplayName(bttv.getChannel()) + '\'s chat room!', true);

        bttv.chat.helpers.scrollChat();
    });

    bttv.io.joinChannel();

    // Reset chatters list
    store.chatters = {};
    store.chatters[bttv.getChannel()] = {lastWhisper: 0};

    // When messages come in too fast, things get laggy
    if (!store.__messageTimer) store.__messageTimer = setInterval(handlers.shiftQueue, 500);

    // Active Tab monitoring - Useful for knowing if a user is 'watching' chat
    $(window).off('blur focus').on('blur focus', function(e) {
        var prevType = $(this).data('prevType');

        /* eslint-disable indent */
        // bug in eslint doesn't like switch formatting
        if (prevType !== e.type) {   //  reduce double fire issues
            switch (e.type) {
                case 'blur':
                    store.activeView = false;
                    break;
                case 'focus':
                    $('.chat-interface textarea').focus();
                    store.activeView = true;
                    break;
            }
        }
        /* eslint-enable indent */

        $(this).data('prevType', e.type);
    });

    // Keycode to quickly timeout users
    $(window).off('keydown').on('keydown', function(e) {
        var keyCode = e.keyCode || e.which;

        if ($('.bttv-mod-card').length && bttv.settings.get('modcardsKeybinds') === true) {
            var user = $('.bttv-mod-card').data('user');
            /* eslint-disable indent */
            // bug in eslint doesn't like switch formatting
            switch (keyCode) {
                case keyCodes.Esc:
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.t:
                    helpers.timeout(user);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.p:
                    helpers.timeout(user, 1);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.a:
                    helpers.sendMessage('!permit ' + user);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.u:
                    helpers.sendMessage('/unban ' + user);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.b:
                    helpers.ban(user);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.i:
                    helpers.sendMessage('/ignore ' + user);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.w:
                    e.preventDefault();
                    $chatInput = $('.ember-chat .chat-interface').find('textarea');
                    $chatInput.val('/w ' + user + ' ');
                    $chatInput.focus();
                    $('.bttv-mod-card').remove();
                    break;
            }
            /* eslint-enable indent */
        }
    });

    $('.tse-content').on('dblclick', '.chat-line .from', function() {
        if (bttv.settings.get('dblClickAutoComplete') === false) return;
        var sender = $(this).text();
        if (sender) {
            $('.ember-chat .chat-interface').find('textarea').val(sender + ', ');
        }
    });
};

},{"../features/anon-chat":13,"../features/chat-load-settings":22,"../features/override-emotes":43,"../helpers/debug":46,"../keycodes":50,"../vars":64,"./handlers":4,"./helpers":5,"./rooms":7,"./store":8,"./templates":10,"./tmi":11}],10:[function(require,module,exports){
var tmi = require('./tmi'),
    store = require('./store');

var badge = exports.badge = function(type, name, description) {
    return '<div class="' + type + '' + ((bttv.settings.get('alphaTags') && ['admin', 'global-moderator', 'staff', 'broadcaster', 'moderator', 'turbo', 'ign'].indexOf(type) !== -1) ? ' alpha' + (!bttv.settings.get('darkenedMode') ? ' invert' : '') : '') + ' badge" title="' + description + '">' + name + '</div> ';
};

var badges = exports.badges = function(badgeList) {
    var resp = '<span class="badges">';
    badgeList.forEach(function(data) {
        resp += badge(data.type, data.name, data.description);
    });
    resp += '</span>';
    return resp;
};

var escape = exports.escape = function(message) {
    return message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

var from = exports.from = function(name, color) {
    return '<span ' + (color ? 'style="color: ' + color + ';" ' : '') + 'class="from">' + escape(bttv.storage.getObject('nicknames')[name.toLowerCase()] || name) + '</span><span class="colon">:</span>' + (name !== 'jtv' ? '&nbsp;<wbr></wbr>' : '');
};

var timestamp = exports.timestamp = function(time) {
    return '<span class="timestamp"><small>' + time + '</small></span>';
};

var modicons = exports.modicons = function() {
    return '<span class="mod-icons"><a class="timeout" title="Timeout">Timeout</a><a class="ban" title="Ban">Ban</a><a class="unban" title="Unban" style="display: none;">Unban</a></span>';
};

var linkify = exports.linkify = function(message) {
    var regex = /(?:https?:\/\/)?(?:[-a-zA-Z0-9@:%_\+~#=]+\.)+[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*)/gi;
    return message.replace(regex, function(e) {
        if (/\x02/.test(e)) return e;
        if (e.indexOf('@') > -1 && (e.indexOf('/') === -1 || e.indexOf('@') < e.indexOf('/'))) return '<a href="mailto:' + e + '">' + e + '</a>';
        var link = e.replace(/^(?!(?:https?:\/\/|mailto:))/i, 'http://');
        return '<a href="' + link + '" target="_blank">' + e + '</a>';
    });
};

var emoticonBTTV = exports.emoticonBTTV = function(emote) {
    var channel = emote.channel ? 'data-channel="' + emote.channel + '" ' : '';
    return '<img class="emoticon bttv-emo-' + emote.id + '" src="' + emote.urlTemplate.replace('{{image}}', '1x') + '" srcset="' + emote.urlTemplate.replace('{{image}}', '2x') + ' 2x" ' + channel + 'data-regex="' + encodeURIComponent(emote.code) + '" />';
};

var jtvEmoticonize = exports.jtvEmoticonize = function(id) {
    var jtvEmotes = [
        'https://cdn.betterttv.net/emotes/jtv/happy.gif',
        'https://cdn.betterttv.net/emotes/jtv/sad.gif',
        'https://cdn.betterttv.net/emotes/mw.png',
        'https://cdn.betterttv.net/emotes/jtv/angry.gif',
        'https://cdn.betterttv.net/emotes/jtv/bored.gif',
        'https://cdn.betterttv.net/emotes/jtv/drunk.gif',
        'https://cdn.betterttv.net/emotes/jtv/cool.gif',
        'https://cdn.betterttv.net/emotes/jtv/surprised.gif',
        'https://cdn.betterttv.net/emotes/jtv/horny.gif',
        'https://cdn.betterttv.net/emotes/jtv/skeptical.gif',
        'https://cdn.betterttv.net/emotes/jtv/wink.gif',
        'https://cdn.betterttv.net/emotes/jtv/raspberry.gif',
        'https://cdn.betterttv.net/emotes/jtv/winkberry.gif',
        'https://cdn.betterttv.net/emotes/jtv/pirate.gif'
    ];

    return jtvEmotes[id - 1];
};

var emoticon = exports.emoticon = function(id, name) {
    if (id < 15 && bttv.settings.get('showMonkeyEmotes') === true) {
        return '<img class="emoticon ttv-emo-' + id + '" src="' + jtvEmoticonize(id) + '" data-id="' + id + '" data-regex="' + encodeURIComponent(name) + '" />';
    }
    return '<img class="emoticon ttv-emo-' + id + '" src="https://static-cdn.jtvnw.net/emoticons/v1/' + id + '/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/' + id + '/2.0 2x" data-id="' + id + '" data-regex="' + encodeURIComponent(name) + '" />';
};

exports.emoticonCss = function(image, id) {
    var css = '';
    if (image.height > 18) css = 'margin: -' + (image.height - 18) / 2 + 'px 0px';
    return '.emo-' + id + ' {' + 'background-image: url("' + image.url + '");' + 'height: ' + image.height + 'px;' + 'width: ' + image.width + 'px;' + css + '}';
};

var emoticonize = exports.emoticonize = function(message, emotes) {
    if (!emotes) return [message];

    var tokenizedMessage = [];
    var replacements = [];

    Object.keys(emotes).forEach(function(id) {
        var emote = emotes[id];

        for (var i = emote.length - 1; i >= 0; i--) {
            replacements.push({ id: id, first: emote[i][0], last: emote[i][1] });
        }
    });

    replacements.sort(function(a, b) {
        return b.first - a.first;
    });

    replacements.forEach(function(replacement) {
        // The emote command
        var name = message.slice(replacement.first, replacement.last + 1);

        // Unshift the end of the message (that doesn't contain the emote)
        tokenizedMessage.unshift(message.slice(replacement.last + 1));

        // Unshift the emote HTML (but not as a string to allow us to process links and escape html still)
        tokenizedMessage.unshift([ emoticon(replacement.id, name) ]);

        // Splice the unparsed piece of the message
        message = message.slice(0, replacement.first);
    });

    // Unshift the remaining part of the message (that contains no emotes)
    tokenizedMessage.unshift(message);

    return tokenizedMessage;
};

var bttvEmoticonize = exports.bttvEmoticonize = function(sender, message, emote) {
    if (emote.restrictions) {
        if (emote.restrictions.channels.length && emote.restrictions.channels.indexOf(bttv.getChannel()) === -1) return message;
        if (emote.restrictions.games.length && tmi().channel && emote.restrictions.games.indexOf(tmi().channel.game) === -1) return message;

        var emoteSets = require('./helpers').getEmotes(sender);
        if (emote.restrictions.emoticonSet && emoteSets.indexOf(emote.restrictions.emoticonSet) === -1) return message;
    }

    return message.replace(emote.code, emoticonBTTV(emote));
};

var bttvMessageTokenize = exports.bttvMessageTokenize = function(sender, message) {
    var tokenizedString = message.split(' ');

    for (var i = 0; i < tokenizedString.length; i++) {
        var piece = tokenizedString[i];

        if (bttv.settings.get('chatImagePreview') === true) {
            var imageTest = new RegExp('(https?:\/\/.)([a-z\-_0-9\/\:\.\%\+]*\.(jpg|jpeg|png|gif))', 'i');
            if (imageTest.test(piece)) {
                piece = bttv.chat.imagePreview(piece);
                tokenizedString[i] = piece;
                continue;
            }
        }

        var test = piece.replace(/(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g, '');
        var emote = null;

        if (store.bttvEmotes.hasOwnProperty(piece)) {
            emote = store.bttvEmotes[piece];
        } else if (store.bttvEmotes.hasOwnProperty(test)) {
            emote = store.bttvEmotes[test];
        }

        if (
            emote &&
            emote.urlTemplate &&
            bttv.settings.get('bttvEmotes') === true &&
            (emote.imageType === 'png' || (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') === true))
        ) {
            piece = bttvEmoticonize(sender, piece, emote);
        } else {
            piece = escape(piece);
            piece = linkify(piece);
        }

        tokenizedString[i] = piece;
    }

    return tokenizedString.join(' ');
};

exports.moderationCard = function(user, top, left) {
    var moderationCardTemplate = require('../templates/moderation-card');
    return moderationCardTemplate({user: user, top: top, left: left});
};

exports.suggestions = function(suggestions, index) {
    var suggestionsTemplate = require('../templates/chat-suggestions');
    return suggestionsTemplate({suggestions: suggestions, index: index});
};

var message = exports.message = function(sender, msg, emotes, colored) {
    colored = colored || false;
    var rawMessage = encodeURIComponent(msg);

    if (sender !== 'jtv') {
        var tokenizedMessage = emoticonize(msg, emotes);

        for (var i = 0; i < tokenizedMessage.length; i++) {
            if (typeof tokenizedMessage[i] === 'string') {
                tokenizedMessage[i] = bttvMessageTokenize(sender, tokenizedMessage[i]);
            } else {
                tokenizedMessage[i] = tokenizedMessage[i][0];
            }
        }

        msg = tokenizedMessage.join(' ');
    }

    return '<span class="message" ' + (colored ? 'style="color: ' + colored + '" ' : '') + 'data-raw="' + rawMessage + '" data-emotes="' + (emotes ? encodeURIComponent(JSON.stringify(emotes)) : 'false') + '">' + msg + '</span>';
};

exports.privmsg = function(highlight, action, server, isMod, data) {
    return '<div class="chat-line' + (highlight ? ' highlight' : '') + (action ? ' action' : '') + (server ? ' admin' : '') + '" data-sender="' + data.sender + '">' + timestamp(data.time) + ' ' + (isMod ? modicons() : '') + ' ' + badges(data.badges) + from(data.nickname, data.color) + message(data.sender, data.message, data.emotes, (action && !highlight) ? data.color : false) + '</div>';
};

var whisperName = exports.whisperName = function(sender, receiver, fromNick, to, fromColor, toColor) {
    return '<span style="color: ' + fromColor + ';" class="from" data-sender="' + sender + '">' + escape(fromNick) + '</span><svg class="svg-whisper-arrow" height="10px" version="1.1" width="16px"><polyline points="6 2, 10 6, 6 10, 6 2"></polyline></svg><span style="color: ' + toColor + ';" class="from" data-sender="' + receiver + '">' + escape(to) + '</span><span class="colon">:</span>&nbsp;<wbr></wbr>';
};

exports.whisper = function(data) {
    return '<div class="chat-line whisper" data-sender="' + data.sender + '">' + timestamp(data.time) + ' ' + whisperName(data.sender, data.receiver, data.from, data.to, data.fromColor, data.toColor) + message(data.sender, data.message, data.emotes, false) + '</div>';
};

},{"../templates/chat-suggestions":58,"../templates/moderation-card":60,"./helpers":5,"./store":8,"./tmi":11}],11:[function(require,module,exports){
module.exports = function() {
    return bttv.getChatController() ? bttv.getChatController().currentRoom : false;
};

},{}],12:[function(require,module,exports){
/* global BTTVLOADED:true PP:true*/
// Declare public and private variables
var debug = require('./helpers/debug'),
    vars = require('./vars'),
    TwitchAPI = require('./twitch-api'),
    Io = require('./socketio'),
    Storage = require('./storage'),
    Settings = require('./settings');

bttv.info = {
    version: '6.8',
    release: 41,
    versionString: function() {
        return bttv.info.version + 'R' + bttv.info.release;
    }
};

bttv.TwitchAPI = TwitchAPI;
bttv.vars = vars;
bttv.storage = new Storage();
bttv.settings = new Settings();

bttv.getChannel = function() {
    if (window.Ember && window.App && App.__container__.lookup('controller:application').get('currentRouteName') === 'channel.index') {
        return App.__container__.lookup('controller:channel').get('id');
    } else if (bttv.getChatController() && bttv.getChatController().currentRoom) {
        return bttv.getChatController().currentRoom.id;
    } else if (window.PP && PP.channel) {
        return PP.channel;
    }

    return '';
};

bttv.getChatController = function() {
    if (window.Ember && window.App && App.__container__.lookup('controller:chat')) {
        return App.__container__.lookup('controller:chat');
    }

    return false;
};

bttv.notify = function(message, title, url, image, tag, permanent) {
    title = title || 'Notice';
    url = url || '';
    image = image || 'https://cdn.betterttv.net/style/logos/bttv_logo.png';
    message = message || '';
    tag = tag || 'bttv_' + message;
    tag = 'bttv_' + tag.toLowerCase().replace(/[^\w_]/g, '');
    permanent = permanent || false;

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
        bttv.storage.pushObject('bttvNotifications', tag, { expire: Date.now() + 60000 });
        setTimeout(function() { bttv.storage.spliceObject('bttvNotifications', tag); }, 60000);
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
        $.gritter.add({
            title: title,
            image: image,
            text: message,
            sticky: permanent
        });
    }
};

bttv.chat = require('./chat');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

var clearClutter = require('./features/clear-clutter'),
    channelReformat = require('./features/channel-reformat'),
    brand = require('./features/brand'),
    betaChat = require('./features/beta-chat'),
    checkMessages = require('./features/check-messages'),
    directoryFunctions = require('./features/directory-functions'),
    checkFollowing = require('./features/check-following'),
    checkBroadcastInfo = require('./features/check-broadcast-info'),
    handleBackground = require('./features/handle-background'),
    darkenPage = require('./features/darken-page'),
    splitChat = require('./features/split-chat'),
    flipDashboard = require('./features/flip-dashboard'),
    formatDashboard = require('./features/format-dashboard'),
    dashboardChannelInfo = require('./features/dashboard-channelinfo'),
    giveawayCompatibility = require('./features/giveaway-compatibility'),
    handleTwitchChatEmotesScript = require('./features/handle-twitchchat-emotes'),
    emoticonTextInClipboard = require('./features/emoticon-text-in-clipboard'),
    createSettings = require('./features/create-settings'),
    enableImagePreview = require('./features/image-preview').enablePreview,
    enableTheatreMode = require('./features/auto-theatre-mode'),
    hostButtonBelowVideo = require('./features/host-btn-below-video');

var chatFunctions = function() {
    debug.log('Modifying Chat Functionality');

    if (bttv.getChatController() && bttv.getChannel()) {
        bttv.chat.takeover();
    }
};

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

        Ember.subscribe('render', {
            before: function() {
                renderingCounter++;
            },
            after: function(name, ts, payload) {
                renderingCounter--;

                if (!payload.template) return;
                // debug.log(payload.template);

                if (App.__container__.lookup('controller:application').get('currentRouteName') !== 'channel.index') {
                    $('#main_col').removeAttr('style');
                }
                /* eslint-disable indent */
                // bug in eslint doesn't like switch formatting
                switch (payload.template) {
                    case 'shared/right-column':
                        waitForLoad(function(ready) {
                            if (ready) {
                                bttv.chat.store.isLoaded = false;
                                betaChat();
                                chatFunctions();
                            }
                        });
                        break;
                    case 'channel/index':
                        waitForLoad(function(ready) {
                            if (ready) {
                                handleBackground();
                                clearClutter();
                                channelReformat();
                                hostButtonBelowVideo();
                                if (
                                    App.__container__.lookup('controller:channel').get('theatreMode') === false &&
                                    bttv.settings.get('autoTheatreMode') === true
                                ) {
                                    enableTheatreMode();
                                }
                                $(window).trigger('resize');
                                setTimeout(function() {
                                    $(window).trigger('resize');
                                }, 3000);
                            }
                        });
                        break;
                    case 'channel/profile':
                        waitForLoad(function(ready) {
                            if (ready) {
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
                            if (ready) {
                                directoryFunctions();
                            }
                        });
                        break;
                }
                /* eslint-enable indent */
            }
        });
    }

    $(document).ready(function() {
        createSettings();
        bttv.settings.load();

        debug.log('BTTV v' + bttv.info.versionString());
        debug.log('CALL init ' + document.URL);

        bttv.io = new Io();

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
        emoticonTextInClipboard();
        hostButtonBelowVideo();

        if (bttv.settings.get('chatImagePreview') === true) {
            enableImagePreview();
        }
        if (bttv.settings.get('autoTheatreMode') === true) {
            enableTheatreMode();
        }

        $(window).trigger('resize');
        setTimeout(function() {
            channelReformat();
            vars.userData.isLoggedIn = Twitch.user.isLoggedIn();
            vars.userData.login = Twitch.user.login();
            $(window).trigger('resize');
        }, 3000);
        setTimeout(chatFunctions, 3000);
        setTimeout(directoryFunctions, 3000);

        /*eslint-disable */
        // NOPE.avi
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','__bttvga');

        __bttvga('create', 'UA-39733925-4', { cookieName: '__bttvga' });
        __bttvga('send', 'pageview');

        (function(b){b.gritter={};b.gritter.options={position:"top-left",class_name:"",fade_in_speed:"medium",fade_out_speed:1000,time:6000};b.gritter.add=function(f){try{return a.add(f||{})}catch(d){var c="Gritter Error: "+d;(typeof(console)!="undefined"&&console.error)?console.error(c,f):alert(c)}};b.gritter.remove=function(d,c){a.removeSpecific(d,c||{})};b.gritter.removeAll=function(c){a.stop(c||{})};var a={position:"",fade_in_speed:"",fade_out_speed:"",time:"",_custom_timer:0,_item_count:0,_is_setup:0,_tpl_close:'<div class="gritter-close"></div>',_tpl_title:'<span class="gritter-title">[[title]]</span>',_tpl_item:'<div id="gritter-item-[[number]]" class="gritter-item-wrapper [[item_class]]" style="display:none"><div class="gritter-top"></div><div class="gritter-item">[[close]][[image]]<div class="[[class_name]]">[[title]]<p>[[text]]</p></div><div style="clear:both"></div></div><div class="gritter-bottom"></div></div>',_tpl_wrap:'<div id="gritter-notice-wrapper"></div>',add:function(g){if(typeof(g)=="string"){g={text:g}}if(!g.text){throw'You must supply "text" parameter.'}if(!this._is_setup){this._runSetup()}var k=g.title,n=g.text,e=g.image||"",l=g.sticky||false,m=g.class_name||b.gritter.options.class_name,j=b.gritter.options.position,d=g.time||"";this._verifyWrapper();this._item_count++;var f=this._item_count,i=this._tpl_item;b(["before_open","after_open","before_close","after_close"]).each(function(p,q){a["_"+q+"_"+f]=(b.isFunction(g[q]))?g[q]:function(){}});this._custom_timer=0;if(d){this._custom_timer=d}var c=(e!="")?'<img src="'+e+'" class="gritter-image" />':"",h=(e!="")?"gritter-with-image":"gritter-without-image";if(k){k=this._str_replace("[[title]]",k,this._tpl_title)}else{k=""}i=this._str_replace(["[[title]]","[[text]]","[[close]]","[[image]]","[[number]]","[[class_name]]","[[item_class]]"],[k,n,this._tpl_close,c,this._item_count,h,m],i);if(this["_before_open_"+f]()===false){return false}b("#gritter-notice-wrapper").addClass(j).append(i);var o=b("#gritter-item-"+this._item_count);o.fadeIn(this.fade_in_speed,function(){a["_after_open_"+f](b(this))});if(!l){this._setFadeTimer(o,f)}b(o).bind("mouseenter mouseleave",function(p){if(p.type=="mouseenter"){if(!l){a._restoreItemIfFading(b(this),f)}}else{if(!l){a._setFadeTimer(b(this),f)}}a._hoverState(b(this),p.type)});b(o).find(".gritter-close").click(function(){a.removeSpecific(f,{},null,true)});return f},_countRemoveWrapper:function(c,d,f){d.remove();this["_after_close_"+c](d,f);if(b(".gritter-item-wrapper").length==0){b("#gritter-notice-wrapper").remove()}},_fade:function(g,d,j,f){var j=j||{},i=(typeof(j.fade)!="undefined")?j.fade:true,c=j.speed||this.fade_out_speed,h=f;this["_before_close_"+d](g,h);if(f){g.unbind("mouseenter mouseleave")}if(i){g.animate({opacity:0},c,function(){g.animate({height:0},300,function(){a._countRemoveWrapper(d,g,h)})})}else{this._countRemoveWrapper(d,g)}},_hoverState:function(d,c){if(c=="mouseenter"){d.addClass("hover");d.find(".gritter-close").show()}else{d.removeClass("hover");d.find(".gritter-close").hide()}},removeSpecific:function(c,g,f,d){if(!f){var f=b("#gritter-item-"+c)}this._fade(f,c,g||{},d)},_restoreItemIfFading:function(d,c){clearTimeout(this["_int_id_"+c]);d.stop().css({opacity:"",height:""})},_runSetup:function(){for(opt in b.gritter.options){this[opt]=b.gritter.options[opt]}this._is_setup=1},_setFadeTimer:function(f,d){var c=(this._custom_timer)?this._custom_timer:this.time;this["_int_id_"+d]=setTimeout(function(){a._fade(f,d)},c)},stop:function(e){var c=(b.isFunction(e.before_close))?e.before_close:function(){};var f=(b.isFunction(e.after_close))?e.after_close:function(){};var d=b("#gritter-notice-wrapper");c(d);d.fadeOut(function(){b(this).remove();f()})},_str_replace:function(v,e,o,n){var k=0,h=0,t="",m="",g=0,q=0,l=[].concat(v),c=[].concat(e),u=o,d=c instanceof Array,p=u instanceof Array;u=[].concat(u);if(n){this.window[n]=0}for(k=0,g=u.length;k<g;k++){if(u[k]===""){continue}for(h=0,q=l.length;h<q;h++){t=u[k]+"";m=d?(c[h]!==undefined?c[h]:""):c[0];u[k]=(t).split(l[h]).join(m);if(n&&u[k]!==t){this.window[n]+=(t.length-u[k].length)/l[h].length}}}return p?u:u[0]},_verifyWrapper:function(){if(b("#gritter-notice-wrapper").length==0){b("body").append(this._tpl_wrap)}}}})($);
        (function(e){e.fn.drags=function(t){t=e.extend({handle:"",cursor:"move",el:""},t);if(t.handle===""){var n=this}else{var n=this.find(t.handle)}return n.css("cursor",t.cursor).on("mousedown",function(n){if(t.handle===""){var r=e(this).addClass("bttv-draggable")}else{if(t.el===""){var r=e(this).addClass("active-handle").parent().addClass("bttv-draggable")}else{e(this).addClass("active-handle");var r=e(t.el).addClass("bttv-draggable")}}var i=r.css("z-index"),s=r.outerHeight(),o=r.outerWidth(),u=r.offset().top+s-n.pageY,a=r.offset().left+o-n.pageX;r.css("z-index",1e3).parents().on("mousemove",function(t){e(".bttv-draggable").offset({top:t.pageY+u-s,left:t.pageX+a-o}).on("mouseup",function(){e(this).removeClass("bttv-draggable").css("z-index",i)})});n.preventDefault()}).on("mouseup",function(){if(t.handle===""){e(this).removeClass("bttv-draggable")}else{e(this).removeClass("active-handle");e(t.el).removeClass("bttv-draggable")}})}})(jQuery);            (function(e){e.fn.konami=function(t){var n=[];var r={left:37,up:38,right:39,down:40,a:65,b:66};var i=e.extend({code:["up","up","down","down","left","right","left","right","b","a"],callback:function(){}},t);var s=i.code;var o=[];$.each(s,function(e){if(s[e]!==undefined&&r[s[e]]!==undefined){o.push(r[s[e]])}else if(s[e]!==undefined&&typeof s[e]=="number"){o.push(s[e])}});$(document).keyup(function(e){var t=e.keyCode?e.keyCode:e.charCode;n.push(t);if(n.toString().indexOf(o)>=0){n=[];i.callback($(this))}})}})($);
        $(window).konami({callback:function(){
            $("#bttvSettingsPanel .konami").each(function(){$(this).show()});
        }});
        /*eslint-enable */
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

if (!window.Twitch || !window.Twitch.video || !window.Twitch.api || !window.Twitch.user) {
    debug.log('window.Twitch not detected.');
    return;
}

if (window.BTTVLOADED === true) return;
debug.log('BTTV LOADED ' + document.URL);
BTTVLOADED = true;
checkJquery();

},{"./chat":2,"./features/auto-theatre-mode":15,"./features/beta-chat":16,"./features/brand":17,"./features/channel-reformat":19,"./features/check-broadcast-info":23,"./features/check-following":24,"./features/check-messages":25,"./features/clear-clutter":26,"./features/create-settings":27,"./features/darken-page":29,"./features/dashboard-channelinfo":30,"./features/directory-functions":31,"./features/emoticon-text-in-clipboard":33,"./features/flip-dashboard":34,"./features/format-dashboard":35,"./features/giveaway-compatibility":36,"./features/handle-background":37,"./features/handle-twitchchat-emotes":38,"./features/host-btn-below-video":39,"./features/image-preview":40,"./features/split-chat":44,"./helpers/debug":46,"./settings":53,"./socketio":54,"./storage":55,"./twitch-api":63,"./vars":64}],13:[function(require,module,exports){
var vars = require('../vars');

var forcedURL = window.location.search && window.location.search.indexOf('bttvAnonChat=true') > -1;

module.exports = function(force) {
    if (!vars.userData.isLoggedIn) return;

    var enabled = false;
    if (forcedURL) {
        enabled = true;
    } else if (typeof force === 'boolean') {
        enabled = force;
    } else {
        enabled = bttv.settings.get('anonChat');
    }

    var tmi = bttv.chat.tmi();
    if (!tmi) return;

    var session = tmi.tmiSession;
    if (!session) return;

    var room = tmi.tmiRoom;
    if (!room) return;

    try {
        var prodConn = session._connections.prod;
        if (!prodConn) return;

        var prodConnOpts = prodConn._opts;

        if (enabled) {
            if (prodConnOpts.nickname === vars.userData.login) {
                prodConnOpts.nickname = 'justinfan12345';
                room._showAdminMessage('BetterTTV: [Anon Chat] Logging you out of chat..');
                bttv.chat.store.ignoreDC = true;
                prodConn._send('QUIT');
            }
        } else {
            if (prodConnOpts.nickname !== vars.userData.login) {
                prodConnOpts.nickname = vars.userData.login;
                room._showAdminMessage('BetterTTV: [Anon Chat] Logging you back into chat..');
                bttv.chat.store.ignoreDC = true;
                prodConn._send('QUIT');
            }
        }
    } catch(e) {
        room._showAdminMessage('BetterTTV: [Anon Chat] We encountered an error anonymizing your chat. You won\'t be hidden in this channel.');
    }
};

},{"../vars":64}],14:[function(require,module,exports){
var debug = require('../helpers/debug');

var tsTink;

module.exports = function() {
    if (bttv.settings.get('highlightFeedback') === true) {
        if (!tsTink) {
            debug.log('loading audio feedback sound');

            tsTink = new Audio('https://cdn.betterttv.net/style/sounds/ts-tink.ogg'); // btw ogg does not work in ie
        }

        tsTink.load(); // needed to play sound more then once
        tsTink.play();
    }
};

},{"../helpers/debug":46}],15:[function(require,module,exports){
module.exports = function() {
    if (!window.Ember || !window.App ||
        App.__container__.lookup('controller:application').get('currentRouteName') !== 'channel.index') {
        return;
    }

    // Call 'toggleTheatre' action on the channel controller in Ember
    App.__container__.lookup('controller:channel').send('toggleTheatre');
};

},{}],16:[function(require,module,exports){
var debug = require('../helpers/debug'),
    vars = require('../vars');

module.exports = function() {
    if (bttv.settings.get('bttvChat') === true && vars.userData.isLoggedIn) {
        if ($('body#chat').length || $('body[data-page="ember#chat"]').length) return;

        debug.log('Running Beta Chat');

        if (!vars.betaChatLoaded) {
            vars.betaChatLoaded = true;
            $.getJSON('https://chat.betterttv.net/login.php?onsite=true&verify=true&callback=?', function(d) {
                if (d.status === true) {
                    debug.log('Logged into BTTV Chat');
                } else {
                    $.getJSON('https://chat.betterttv.net/login.php?onsite=true&user=' + vars.userData.login + '&callback=?');
                    debug.log('Not logged into BTTV Chat');
                }

                setTimeout(function() {
                    var chatDJSInject = document.createElement('script');
                    chatDJSInject.setAttribute('src', 'https://chat.betterttv.net/chat/cometchatjs.php');
                    chatDJSInject.setAttribute('type', 'text/javascript');
                    $('body').append(chatDJSInject);
                }, 5000);
            });

            var chatCSSInject = document.createElement('link');
            chatCSSInject.setAttribute('href', 'https://chat.betterttv.net/chat/cometchatcss.php');
            chatCSSInject.setAttribute('type', 'text/css');
            chatCSSInject.setAttribute('id', 'arrowchat_css');
            chatCSSInject.setAttribute('rel', 'stylesheet');
            $('head').append(chatCSSInject);
        }

        if (!bttv.getChannel()) return;
        $('body').append('<style>.ember-chat .chat-interface { height: 140px !important; } .ember-chat .chat-messages { bottom: 140px; } .ember-chat .chat-settings { bottom: 80px; } .ember-chat .emoticon-selector { bottom: 142px !important; }</style>');
    }
};

},{"../helpers/debug":46,"../vars":64}],17:[function(require,module,exports){
var debug = require('../helpers/debug');
var betaChat = require('./beta-chat');

module.exports = function() {
    debug.log('Branding Site with Better & Importing Styles');

    var $watermark = $('<img />');
    // Old Site Header Logo Branding
    if ($('#header_logo').length) {
        $('#header_logo').html('<img alt="TwitchTV" src="https://cdn.betterttv.net/style/logos/black_twitch_logo.png">');
        $watermark.attr('src', 'https://cdn.betterttv.net/style/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'margin-left': '-82px',
            'margin-top': '-10px',
            'float': 'left',
            'height': 18,
            'position': 'absolute'
        });
        $('#header_logo').append($watermark);
    }

    // New Site Logo Branding
    if ($('#large_nav #logo').length) {
        $watermark.attr('src', 'https://cdn.betterttv.net/style/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'margin-left': '-76px',
            'margin-top': '-16px',
            'float': 'left',
            'position': 'absolute'

        });
        $('#large_nav #logo').append($watermark);
    }

    // Adds BTTV Settings Icon to Left Sidebar
    $('.column .content #you').append('<a class="bttvSettingsIcon" href="#""></a>');
    $('.bttvSettingsIcon').click(function(e) {
        e.preventDefault();
        $('#chat_settings_dropmenu').hide();
        $('#bttvSettingsPanel').show('slow');
    });

    // Import Global BTTV CSS Changes
    var globalCSSInject = document.createElement('link');
    globalCSSInject.setAttribute('href', 'https://cdn.betterttv.net/style/stylesheets/betterttv.css?' + bttv.info.versionString());
    globalCSSInject.setAttribute('type', 'text/css');
    globalCSSInject.setAttribute('rel', 'stylesheet');
    $('body').append(globalCSSInject);

    if (bttv.settings.get('showChatIndentation') !== false) {
        var $addCSS = $('<style></style>');
        $addCSS.attr('id', 'bttvChatIndentation');
        $addCSS.html('#chat_line_list .line p { padding-left: 16px;text-indent: -16px; }');
        $('body').append($addCSS);
    }

    // Small Popout/Embed Chat Fixes
    $('body#chat').css('overflow-y', 'hidden');
    $('#chat_loading_spinner').attr('src', 'data:image/gif;base64,R0lGODlhFgAWAPMGANfX1wAAADc3N1tbW6Ojo39/f2tra8fHx9nZ2RsbG+np6SwsLEtLS4eHh7q6ugAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hoiQ3JlYXRlZCB3aXRoIENoaW1wbHkuY29tIgAh+QQJCgAGACwAAAAAFgAWAAAEbNCESY29OEvBRdDgFXReGI7dZ2oop65YWypIjSgGbSOW/CGAIICnEAIOPdLPSDQiNykDUNgUPn1SZs6ZjE6D1eBVmaVurV1XGXwWp0vfYfv4XpqLaKg6HqbrZzs4OjZ1MBlYhiJkiYWMfy+GEQAh+QQJCgAGACwAAAAAFgAWAAAEctDIKYO9NKe9lwlCKAQZlQzo4IEiWUpnuorjC6fqR7tvjM4tgwJBJN5kuqACwGQef8kQadkEPHMsqbBqNfiwu231CtRSm+Ro7ez04sprbjobH7uR9Kn8Ds2L0XxgSkVGgXA8JV+HNoZqiBocCYuMJX4vEQAh+QQJCgAAACwAAAAAFgAWAAAEcxDISWu4uNLEOwhCKASSGA5AMqxD8pkkIBR0gaqsC4rxXN+s1otXqtlSQR2s+EPmhqGeEfjcRZk06kpJlE2dW+gIe8SFrWNv0yxES9dJ8TsLbi/VdDb3ii/H3WRadl0+eX93hX5ViCaCe2kaKR0ccpGWlREAIfkECQoAAQAsAAAAABYAFgAABHUwyEmrvTisxHlmQigw2mAOiWSsaxMwRVyQy4mqRE64sEzbqYBBt3vJZqVTcKjjHX9KXNPoS5qWRGe1FhVmqTHoVZrThq0377R35o7VZTDSnWbG2XMguYgX1799aFhrT4J7ZnldLC1yfkEXICKOGRcbHY+UlBEAIfkECQoAAQAsAAAAABYAFgAABHIwyEmrvThrOoQXTFYYpFEEQ6EWgkS8rxMUMHGmaxsQR3/INNhtxXL5frPaMGf0AZUooo7nTAqjzN3xecWpplvra/lt9rhjbFlbDaa9RfZZbFPHqXN3HQ5uQ/lmSHpkdzVoe1IiJSZ2OhsTHR8hj5SVFREAIfkECQoAAQAsAAAAABYAFgAABGowyEmrvTjrzWczIJg5REk4QWMShoQAMKAExGEfRLq2QQzPtVtOZeL5ZLQbTleUHIHK4c7pgwqZJWM1eSVmqTGrTdrsbYNjLAv846a9a3PYvYRr5+j6NPDCR9U8FyQmKHYdHiEih4uMjRQRACH5BAkKAAEALAAAAAAWABYAAARkMMhJq7046807d0QYSkhZKoFiIqhzvAchATSNIjWABC4sBznALbfrvX7BYa0Ii81yShrT96xFdbwmEhrALbNUINcrBR+rti7R7BRb1V9jOwkvy38rVmrV0nokICI/f4SFhocSEQAh+QQJCgABACwAAAAAFgAWAAAEWjDISau9OOvNu7dIGCqBIiKkeUoH4AIk8gJIOR/sHM+1cuev3av3C7SCAdnQ9sIZdUke0+U8uoQuYhN4jS592ydSmZ0CqlAyzYweS8FUyQlVOqXmn7x+z+9bIgA7');

    // Run Beta Chat After BTTV CSS
    betaChat();
};

},{"../helpers/debug":46,"./beta-chat":16}],18:[function(require,module,exports){
var debug = require('../../helpers/debug'),
    vars = require('../../vars');

var playerContainers = [
    '.dynamic-player',
    '.dynamic-target-player',
];

var players = [
    '.dynamic-player object',
    '.dynamic-player video',
    '.dynamic-player iframe',
    '.dynamic-target-player object',
    '.dynamic-target-player video',
    '.dynamic-target-player iframe'
];

var generateCSS = function(height) {
    return playerContainers.join(', ') + ', ' + players.join(', ') + ' { width: 100% !important; height: ' + height + 'px !important; }';
};

var getPlayerHeight = function() {
    for (var i = 0; i < players.length; i++) {
        var player = players[i];

        if (!$(player).length) continue;

        return ($(player).width() * 0.5625) + 30;
    }

    return -1;
};

module.exports = function() {
    if ($('#main_col #channel').length === 0 || $('#right_col').length === 0) return;

    debug.log('Page resized');

    var hostModeEnabled = $('#hostmode').length;

    var $playerStyle = $('#bttvPlayerStyle');

    if (!$playerStyle.length) {
        $playerStyle = $('<style></style>');
        $playerStyle.attr('id', 'bttvPlayerStyle');
        $('body').append($playerStyle);
    }

    // If chat sidebar is closed, element width != 0
    if (vars.chatWidth === 0) {
        $('#main_col').css({
            marginRight: '0px'
        });
    } else {
        $('#main_col').css({
            marginRight: $('#right_col').width() + 'px'
        });
    }

    var fullPageHeight = $(window).height();
    var fullPlayerHeight = getPlayerHeight();
    if (fullPlayerHeight === -1) return;
    var metaAndStatsHeight;

    var meta,
        stats;
    if (hostModeEnabled) {
        var title = $('.hostmode-title-container').outerHeight(true);
        meta = $('.target-meta').outerHeight(true);
        stats = $('#hostmode .channel-actions').outerHeight(true);
        var close = $('.close-hostmode').outerHeight(true);
        metaAndStatsHeight = title + meta + stats + close + 33;

        // Fixes host frame height on resize (the close button repositions)
        $('.target-frame').css('height', $(window).height());
    } else {
        meta = $('#broadcast-meta').outerHeight(true);
        stats = $('.stats-and-actions').outerHeight();
        metaAndStatsHeight = meta + stats;
    }

    var desiredPageHeight = metaAndStatsHeight + fullPlayerHeight;

    // If the window height is larger than the height needed to display
    // the title (meta) and stats below video, the video player can be its'
    // 16:9 normal height
    if ($(window).height() > desiredPageHeight) {
        $playerStyle.html(generateCSS(fullPlayerHeight));
    } else {
        // Otherwise we need to create black bars on the video
        // to accomodate room for title (meta) and stats
        $playerStyle.html(generateCSS(fullPageHeight - metaAndStatsHeight));
    }

    // Channel panels below the stream auto arrange based on width
    if (!hostModeEnabled) {
        $('#channel_panels').masonry('reload');
    }
};

},{"../../helpers/debug":46,"../../vars":64}],19:[function(require,module,exports){
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

},{"../../helpers/debug":46,"../../keycodes":50,"../../vars":64,"./handle-resize":18,"./twitchcast":20}],20:[function(require,module,exports){
module.exports = function() {
    if ($('.archive_info').length) return;

    var template = '<iframe id="twitchcast" src="https://nightdev.com/twitchcast/?ontwitch={{hostname}}&channel={{channel}}" width="100%" height="100%" style="position: absolute;top: 0px;left: 0px;border: none;"></iframe>';

    var openTwitchCast = function() {
        // For some reason Twitch's built-in Twitch.player.ready *doesn't work* with their new player.
        if ($('#player object').length) {
            try {
                $('#player object')[0].pauseVideo();
            } catch(e) {
                // Twitch's player doesn't support pauseVideo anymore.
            }
        }

        $('#player').append(template.replace('{{hostname}}', encodeURIComponent(window.location.protocol + '//' + window.location.host)).replace('{{channel}}', bttv.getChannel()));

        var close = function() {
            $('#twitchcast').remove();
            window.removeEventListener('message', close, false);
        };
        window.addEventListener('message', close, false);
    };

    var placeButton = function() {
        if ($('#twitchcast_button').length) return;

        var $button = $('<div/>');
        $button.attr('id', 'twitchcast_button');
        $button.click(openTwitchCast);
        $('#player').append($button);
    };

    var castAvailable = function(callback) {
        if (!window.chrome) return callback(true);

        if (window.chrome.cast && window.chrome.cast.isAvailable) {
            return callback(false);
        }

        setTimeout(function() {
            castAvailable(callback);
        }, 1000);
    };

    if (bttv.settings.get('twitchCast')) {
        if (!$('#chromecast_sender').length) {
            var $senderjs = $('<script/>');
            $senderjs.attr('id', 'chromecast_sender');
            $senderjs.attr('src', 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js');
            $('head').append($senderjs);
        }
        castAvailable(function(error) {
            if (!error) placeButton();
        });
    } else {
        $('#chromecast_sender').remove();
        $('#twitchcast_button').remove();
    }
};

},{}],21:[function(require,module,exports){
var vars = require('../vars');
var template = require('../templates/channel-state');


var stateContainer = '#bttv-channel-state-contain';
var chatHeader = '.chat-container .chat-header:first';
var chatButton = '.chat-interface .chat-buttons-container .send-chat-button';

var displaySeconds = function(s) {
    var date = new Date(0);
    date.setSeconds(s);
    date = date.toISOString().substr(11, 8);
    date = date.split(':');

    while (date[0] === '00') {
        date.shift();
    }

    if (date.length === 1 && date[0].charAt(0) === '0') {
        date[0] = parseInt(date[0], 10);
    }

    return date.join(':');
};

var resetCountDown = function() {
    if (bttv.chat.store.chatCountDown) clearInterval(bttv.chat.store.chatCountDown);
    bttv.chat.store.chatCountDown = false;
    $(chatButton).find('span').text('Chat');
};

var initiateCountDown = function(length) {
    if (bttv.chat.store.chatCountDown) clearInterval(bttv.chat.store.chatCountDown);

    var timer = length;

    bttv.chat.store.chatCountDown = setInterval(function() {
        var $chatButton = $(chatButton);

        if (timer === 0) {
            resetCountDown();
            return;
        }

        $chatButton.find('span').text('Chat in ' + displaySeconds(timer));

        timer--;
    }, 1000);
};

module.exports = function(event) {
    var $stateContainer = $(stateContainer);
    if (!$stateContainer.length) {
        $(chatHeader).append(template());
        $stateContainer = $(stateContainer);
        $stateContainer.children().each(function() {
            $(this).hide();

            if ($(this).hasClass('slow')) {
                $(this).find('.slow-time').tipsy({
                    gravity: $.fn.tipsy.autoNS
                });
                $(this).find('svg').tipsy({
                    gravity: $.fn.tipsy.autoNS
                });
            } else {
                $(this).tipsy({
                    gravity: $.fn.tipsy.autoNS
                });
            }
        });
    }
    /* eslint-disable indent */
    // bug in eslint doesn't like switch formatting
    switch (event.type) {
        case 'roomstate':
            var enabled;
            if ('slow' in event.tags) {
                var length = event.tags.slow;

                bttv.chat.store.slowTime = length;

                $stateContainer
                    .find('.slow-time')
                    .attr('original-title', length + ' seconds')
                    .text(displaySeconds(length));

                if (length === 0) {
                    $stateContainer.find('.slow').hide();
                    $stateContainer.find('.slow-time').hide();
                } else {
                    $stateContainer.find('.slow').show();
                    $stateContainer.find('.slow-time').show();
                }
            }

            if ('r9k' in event.tags) {
                enabled = event.tags.r9k;

                if (enabled === true) {
                    $stateContainer.find('.r9k').show();
                } else {
                    $stateContainer.find('.r9k').hide();
                }
            }

            if ('subs-only' in event.tags) {
                enabled = event.tags['subs-only'];

                if (enabled === true) {
                    $stateContainer.find('.subs-only').show();
                } else {
                    $stateContainer.find('.subs-only').hide();
                }
            }
            break;
        case 'outgoing_message':
            if (!vars.userData.isLoggedIn || bttv.chat.helpers.isModerator(vars.userData.login)) return;

            if (bttv.chat.store.slowTime > 0) {
                initiateCountDown(bttv.chat.store.slowTime);
            } else {
                resetCountDown();
            }
            break;
        case 'notice':
            if (!('msg-id' in event.tags)) return;

            var msg = event.tags['msg-id'];

            if (msg === 'msg_slowmode' || msg === 'msg_timedout') {
                var matches = /([0-9]+)/.exec(event.message);
                if (!matches) return;

                var seconds = parseInt(matches[1], 10);
                initiateCountDown(seconds);
            } else if (msg === 'msg_banned') {
                initiateCountDown(86400);
            }
            break;
    }
    /* eslint-enable indent */
};

},{"../templates/channel-state":56,"../vars":64}],22:[function(require,module,exports){
var debug = require('../helpers/debug'),
    vars = require('../vars'),
    removeElement = require('../helpers/element').remove;
var darkenPage = require('./darken-page'),
    splitChat = require('./split-chat');

module.exports = function() {
    if (!$('.ember-chat .chat-settings').length || $('.ember-chat .chat-settings .bttvChatSettings').length) return;

    debug.log('Loading BetterTTV Chat Settings');

    $('.ember-chat .chat-settings .clear-chat').remove();

    var settings = require('../templates/chat-settings')();

    var $settings = $('<div></div>');

    $settings.attr('class', 'bttvChatSettings');
    $settings.html(settings);

    $('.ember-chat .chat-interface .chat-settings').append($settings);

    if ($('body[data-page="ember#chat"]').length) {
        $('.openSettings').click(function(e) {
            e.preventDefault();
            bttv.settings.popup();
        });
    } else {
        $('.openSettings').click(function(e) {
            e.preventDefault();
            $('.chat-option-buttons .settings').click();
            $('#bttvSettingsPanel').show('slow');
        });
    }

    $('.blackChatLink').click(function(e) {
        e.preventDefault();
        if (vars.blackChat) {
            vars.blackChat = false;
            $('#blackChat').remove();
            darkenPage();
            splitChat();
            $('.blackChatLink').text('Black Chat (Chroma Key)');
        } else {
            vars.blackChat = true;
            $('#darkTwitch').remove();
            $('#splitChat').remove();
            var darkCSS = document.createElement('link');
            darkCSS.setAttribute('href', 'https://cdn.betterttv.net/style/stylesheets/betterttv-blackchat.css');
            darkCSS.setAttribute('type', 'text/css');
            darkCSS.setAttribute('rel', 'stylesheet');
            darkCSS.setAttribute('id', 'blackChat');
            darkCSS.innerHTML = '';
            $('body').append(darkCSS);
            $('.blackChatLink').text('Unblacken Chat');
        }
    });

    $('.clearChat').click(function(e) {
        e.preventDefault();
        removeElement('.chat-line');
    });

    $('.toggleDarkenTTV').change(function(e) {
        e.preventDefault();
        if (bttv.settings.get('darkenedMode') === true) {
            bttv.settings.save('darkenedMode', false);
            $(this).prop('checked', false);
        } else {
            bttv.settings.save('darkenedMode', true);
            $(this).prop('checked', true);
        }
    });

    $('.flipDashboard').click(function(e) {
        e.preventDefault();
        if (bttv.settings.get('flipDashboard') === true) {
            bttv.settings.save('flipDashboard', false);
        } else {
            bttv.settings.save('flipDashboard', true);
        }
    });

    $('.setBlacklistKeywords').click(function(e) {
        e.preventDefault();
        var keywords = prompt('Type some blacklist keywords. Messages containing keywords will be filtered from your chat. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase. Wildcards are supported.', bttv.settings.get('blacklistKeywords'));
        if (keywords != null) {
            keywords = keywords.trim().replace(/\s\s+/g, ' ');
            bttv.settings.save('blacklistKeywords', keywords);
        }
    });

    $('.setHighlightKeywords').click(function(e) {
        e.preventDefault();
        var keywords = prompt('Type some highlight keywords. Messages containing keywords will turn red to get your attention. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase, and () around a word to specify a username. Wildcards are supported.', bttv.settings.get('highlightKeywords'));
        if (keywords != null) {
            keywords = keywords.trim().replace(/\s\s+/g, ' ');
            bttv.settings.save('highlightKeywords', keywords);
        }
    });

    $('.setScrollbackAmount').click(function(e) {
        e.preventDefault();
        var lines = prompt('What is the maximum amount of lines that you want your chat to show? Twitch default is 150. Leave the field blank to disable.', bttv.settings.get('scrollbackAmount'));
        if (lines != null && lines === '') {
            bttv.settings.save('scrollbackAmount', 150);
        } else if (lines != null && isNaN(lines) !== true && lines > 0) {
            bttv.settings.save('scrollbackAmount', parseInt(lines, 10));
        }
    });
};

},{"../helpers/debug":46,"../helpers/element":47,"../templates/chat-settings":57,"../vars":64,"./darken-page":29,"./split-chat":44}],23:[function(require,module,exports){
var debug = require('../helpers/debug');

var checkBroadcastInfo = module.exports = function() {
    if (!window.App || !window.App.__container__) return;

    var channelCtrl = window.App.__container__.lookup('controller:channel');

    if (!channelCtrl) return setTimeout(checkBroadcastInfo, 60000);

    if (!channelCtrl.get('model')) return;

    var model = channelCtrl.get('model');

    if (Ember.isEmpty(model)) return setTimeout(checkBroadcastInfo, 60000);

    var hostedChannel = model.get('hostModeTarget');
    var channel = hostedChannel ? hostedChannel : model;

    debug.log('Check Channel Title/Game');

    bttv.TwitchAPI.get('channels/' + channel.id, {}, { version: 3 }).done(function(d) {
        if (d.game) {
            channel.set('game', d.game);
            channel.set('rollbackData.game', d.game);
        }

        if (d.status) {
            channel.set('status', d.status);

            if (!hostedChannel) {
                var $title = $('#broadcast-meta .title');

                if ($title.data('status') !== d.status) {
                    $title.data('status', d.status);

                    d.status = d.status.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    d.status = bttv.chat.templates.linkify(d.status);

                    $title.find('.real').html(d.status);
                    $title.find('.over').html(d.status);
                }
            }
        }

        if (d.views) {
            channel.set('views', d.views);
        }

        if (d.followers) {
            channel.set('followersTotal', d.followers);
        }

        setTimeout(checkBroadcastInfo, 60000 + Math.random() * 5000);
    });
};

},{"../helpers/debug":46}],24:[function(require,module,exports){
var debug = require('../helpers/debug'),
    vars = require('../vars');

var checkFollowing = module.exports = function() {
    debug.log('Check Following List');

    if (!$('#bttv-small-nav-count').length) {
        var $count = $('<div/>');
        $count.addClass('js-total');
        $count.attr('id', 'bttv-small-nav-count');
        $count.insertBefore('#small_nav li[data-name="following"] a[href="/directory/following"] .filter_icon:first');
    }

    if ($('body#chat').length || $('body[data-page="ember#chat"]').length || !vars.userData.isLoggedIn) return;

    var fetchFollowing = function(callback, followingList, followingNames, offset) {
        followingList = followingList || [];
        followingNames = followingNames || [];
        offset = offset || 0;

        bttv.TwitchAPI.get('streams/followed?limit=100&offset=' + offset).done(function(d) {
            if (d.streams && d.streams.length > 0) {
                d.streams.forEach(function(stream) {
                    if (followingNames.indexOf(stream.channel.name) === -1) {
                        followingNames.push(stream.channel.name);
                        followingList.push(stream);
                    }
                });
                if (d.streams.length === 100) {
                    fetchFollowing(function(fetchedFollowingList) {
                        callback(fetchedFollowingList);
                    }, followingList, followingNames, offset + 100);
                } else {
                    callback(followingList);
                }
            } else {
                callback(followingList);
            }
        });
    };

    fetchFollowing(function(streams) {
        if (vars.liveChannels.length === 0) {
            vars.liveChannels.push('loaded');
            streams.forEach(function(stream) {
                var channel = stream.channel;
                if (vars.liveChannels.indexOf(channel.name) === -1) {
                    vars.liveChannels.push(channel.name);
                }
            });
        } else if (streams.length > 0) {
            var channels = [];
            streams.forEach(function(stream) {
                var channel = stream.channel;
                channels.push(channel.name);
                if (vars.liveChannels.indexOf(channel.name) === -1) {
                    debug.log(channel.name + ' is now streaming');
                    if (channel.game == null) channel.game = 'on Twitch';
                    bttv.notify(channel.display_name + ' just started streaming ' + channel.game + '.\nClick here to head to ' + channel.display_name + '\'s channel.', channel.display_name + ' is Now Streaming', channel.url, channel.logo, 'channel_live_' + channel.name);
                }
            });
            vars.liveChannels = channels;
        }

        if (!$('#nav_personal li[data-name="following"] a[href="/directory/following"] .js-total').length) {
            $('#nav_personal li[data-name="following"] a[href="/directory/following"]').append('<span class="total_count js-total" style="display: none;"></span>');
        }
        $('#left_col li[data-name="following"] a[href="/directory/following"] .js-total').text(streams.length);
        $('#left_col li[data-name="following"] a[href="/directory/following"] .js-total').css('display', 'inline');

        setTimeout(checkFollowing, 60000 + Math.random() * 5000);
    });
};

},{"../helpers/debug":46,"../vars":64}],25:[function(require,module,exports){
var debug = require('../helpers/debug');

module.exports = function() {
    debug.log('Check for New Messages');

    if ($('body#chat').length) return;

    /* if (vars.userData.isLoggedIn && window.Firebase) {
        var newMessages = function(id, namespaced) {
            var notificationsLoaded = false;
            var notifications = 0;
            namespaced.child("users/" + id + "/messages").on("value", function (f) {
                var f = f.val() || {}, j = f.unreadMessagesCount;
                $(".js-unread_message_count").text(j || "");
                j ? $(".js-unread_message_count").show() : $(".js-unread_message_count").hide();
                if (notificationsLoaded === true && notifications < j) {
                    $.get('/messages/inbox', function (data) {
                        var $message = $(data).find("#message-list .unread:first");

                        if ($message) {
                            var $senderData = $message.children("div.from_to_user"),
                                $messageData = $message.children("div.message_data"),
                                url = location.protocol+'//'+location.host+$messageData.children(".message_subject").attr("href"),
                                avatar = $senderData.children(".prof").children("img").attr("src"),
                                sender = $senderData.children(".capital").text().capitalize();
                        } else {
                            var url = "http://www.twitch.tv/inbox",
                                avatar = "https://www-cdn.jtvnw.net/images/xarth/404_user_50x50.png",
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
                        messagesnum.innerHTML = "<span id='messagescount' style='padding-left:28px;background-image:url(https://cdn.betterttv.net/style/icons/messages.png);background-position: 8px 4px;padding-top:-1px;background-repeat: no-repeat;color:black;'>" + notifications + "</span>";
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
    }*/

    // Twitch doesn't tell us when messages from /messages/other show up.
    var seenMessages = [];
    var recentMessageTimes = ['less than a minute ago', '1 minute ago'];

    var checkOther = function() {
        if (bttv.settings.get('alertOtherMessages') === false) return;
        $.get('/messages/other', function(data) {
            var $messages = $(data).find('#message-list .unread');

            $messages.each(function() {
                var $message = $(this),
                    $senderData = $message.children('div.from_to_user'),
                    $messageData = $message.children('div.message_data'),
                    url = location.protocol + '//' + location.host + $message.data('url'),
                    messageId = $message.data('url').match(/\/message\/show\/([a-z0-9]+)/)[1],
                    avatar = $senderData.children('.prof').children('img').attr('src'),
                    sender = $senderData.children('.capital').text().trim().capitalize(),
                    time = $messageData.children('.time_ago').text().trim();

                if (seenMessages.indexOf(url) !== -1 || recentMessageTimes.indexOf(time) === -1) return;
                seenMessages.push(url);
                bttv.notify(sender + ' just sent you a Message!\nClick here to view it.', 'Twitch Message Received', url, avatar, 'new_message_' + messageId);
            });
        });
    };

    setInterval(checkOther, 30000 + Math.random() * 5000);
    checkOther();
};

},{"../helpers/debug":46}],26:[function(require,module,exports){
var debug = require('../helpers/debug'),
    removeElement = require('../helpers/element').remove;

module.exports = function() {
    debug.log('Clearing Clutter');

    // Sidebar is so cluttered
    $('li[data-name="kabam"]').attr('style', 'display: none !important');
    removeElement('#nav_advertisement');
    if (bttv.settings.get('showFeaturedChannels') !== true) {
        removeElement('#nav_games');
        removeElement('#nav_streams');
        removeElement('#nav_related_streams');
        $('body').append('<style>#nav_games, #nav_streams, #nav_related_streams { display: none; }</style>');
    }
};

},{"../helpers/debug":46,"../helpers/element":47}],27:[function(require,module,exports){
var settingsPanelTemplate = require('../templates/settings-panel');

module.exports = function() {
    var settingsPanel = document.createElement('div');
    settingsPanel.setAttribute('id', 'bttvSettingsPanel');
    settingsPanel.style.display = 'none';
    settingsPanel.innerHTML = settingsPanelTemplate();
    $('body').append(settingsPanel);

    if (/\?bttvSettings=true/.test(window.location)) {
        $('#left_col').remove();
        $('#main_col').remove();
        setTimeout(function() {
            $('#bttvSettingsPanel').hide(function() {
                $('#bttvSettingsPanel').show();
            });
        }, 1000);
    }

    $.get('https://cdn.betterttv.net/privacy.html', function(data) {
        if (data) {
            $('#bttvPrivacy .tse-content').html(data);
        }
    });

    $.get('https://cdn.betterttv.net/changelog.html?' + bttv.info.versionString(), function(data) {
        if (data) {
            $('#bttvChangelog .tse-content').html(data);
        }
    });

    $('#bttvBackupButton').click(function() {
        bttv.settings.backup();
    });

    $('#bttvImportInput').change(function() {
        bttv.settings.import(this);
    });

    /*eslint-disable */
    // ヽ༼ಢ_ಢ༽ﾉ
    $('#bttvSettingsPanel .scroll').TrackpadScrollEmulator({
        scrollbarHideStrategy: 'rightAndBottom'
    });
    /*eslint-enable */

    $('#bttvSettingsPanel #close').click(function() {
        $('#bttvSettingsPanel').hide('slow');
    });

    $('#bttvSettingsPanel .nav a').click(function(e) {
        e.preventDefault();
        var tab = $(this).attr('href');

        $('#bttvSettingsPanel .nav a').each(function() {
            var currentTab = $(this).attr('href');
            $(currentTab).hide();
            $(this).parent('li').removeClass('active');
        });

        if (tab === '#bttvChannel') {
            $(tab).children('iframe').attr('src', 'https://manage.betterttv.net/');
        }

        $(tab).fadeIn();
        $(this).parent('li').addClass('active');
    });
};

},{"../templates/settings-panel":62}],28:[function(require,module,exports){
function load(file, key) {
    if (!bttv.settings.get(key)) return;

    var css = document.createElement('link');
    css.setAttribute('href', 'https://cdn.betterttv.net/style/stylesheets/betterttv-' + file + '.css?' + bttv.info.versionString());
    css.setAttribute('type', 'text/css');
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('id', key);
    $('body').append(css);
}
function unload(key) {
    $('#' + key).remove();
}

module.exports.load = load;
module.exports.unload = unload;

},{}],29:[function(require,module,exports){
var debug = require('../helpers/debug'),
    handleBackground = require('./handle-background');

module.exports = function() {
    var $body = $('body');

    /* Twitch broke BGs */
    setTimeout(handleBackground, 1000);

    if (bttv.settings.get('darkenedMode') !== true || !$body.attr('data-page')) return;

    debug.log('Darkening Page');

    var pageKind = $('body').data('page').split('#')[0],
        pageType = $('body').data('page').split('#')[1] || 'none',
        allowedPages = ['ember', 'message', 'dashboards', 'chat', 'chapter', 'archive', 'channel', 'user', 'bookmark'];

    if (allowedPages.indexOf(pageKind) !== -1) {
        if (pageKind === 'dashboards' && pageType !== 'show' || pageType === 'legal') return;

        var darkCSS = document.createElement('link');
        darkCSS.setAttribute('href', 'https://cdn.betterttv.net/style/stylesheets/betterttv-dark.css?' + bttv.info.versionString());
        darkCSS.setAttribute('type', 'text/css');
        darkCSS.setAttribute('rel', 'stylesheet');
        darkCSS.setAttribute('id', 'darkTwitch');
        $('body').append(darkCSS);

        $('#main_col .content #stats_and_actions #channel_stats #channel_viewer_count').css('display', 'none');
        // setTimeout(handleBackground, 1000);

        // Messages Delete Icon Fix
        $('#main_col .messages img[src="http://www-cdn.jtvnw.net/images/xarth/g/g18_trash-00000080.png"]').attr('src', 'https://cdn.betterttv.net/style/icons/delete.png');
        $('#main_col .messages img[src="http://www-cdn.jtvnw.net/images/xarth/g/g16_trash-00000020.png"]').attr('src', 'https://cdn.betterttv.net/style/icons/delete.png').attr('width', '16').attr('height', '16');
    }
};

},{"../helpers/debug":46,"./handle-background":37}],30:[function(require,module,exports){
var debug = require('../helpers/debug'),
    vars = require('../vars');

module.exports = function dashboardChannelInfo() {
    if ($('#dash_main').length) {
        debug.log('Updating Dashboard Channel Info');

        bttv.TwitchAPI.get('streams/' + bttv.getChannel()).done(function(a) {
            if (a.stream) {
                $('#channel_viewer_count').text(Twitch.display.commatize(a.stream.viewers));
                if (a.stream.channel.views) $('#views_count span').text(Twitch.display.commatize(a.stream.channel.views));
                if (a.stream.channel.followers) $('#followers_count span').text(Twitch.display.commatize(a.stream.channel.followers));
            } else {
                $('#channel_viewer_count').text('Offline');
            }
        });
        bttv.TwitchAPI.get('channels/' + bttv.getChannel() + '/follows?limit=1').done(function(a) {
            if (a._total) {
                $('#followers_count span').text(Twitch.display.commatize(a._total));
            }
        });
        if (!$('#chatters_count').length) {
            var $chattersContainer = $('<div/>');
            var $chatters = $('<span/>');

            $chattersContainer.attr('class', 'stat');
            $chattersContainer.attr('id', 'chatters_count');

            $chatters.text('0');
            $chatters.attr('tooltipdata', 'Chatters');

            $chattersContainer.append($chatters);
            $('#followers_count').after($chattersContainer);
        }

        $.getJSON('https://tmi.twitch.tv/group/user/' + bttv.getChannel() + '/chatters?callback=?', function(data) {
            if (data.data && data.data.chatter_count) $('#chatters_count span').text(Twitch.display.commatize(data.data.chatter_count));
        });

        if (vars.dontCheckSubs !== true) {
            $.get('/broadcast/dashboard/partnership', function(data) {
                var $subsContainer = $(data).find('div.wrapper'),
                    subsRegex = /Your channel currently has ([0-9,]+) paying subscribers and ([0-9,]+) total active subscribers/;

                if ($subsContainer) {
                    var containerText = $subsContainer.text();

                    if (containerText.match(subsRegex)) {
                        var subAmounts = subsRegex.exec(containerText),
                            activeSubs = subAmounts[2];

                        if (!$('#subs_count').length) {
                            $subsContainer = $('<div/>');
                            var $subs = $('<span/>');

                            $subsContainer.attr('class', 'stat');
                            $subsContainer.attr('id', 'subs_count');

                            $subs.text('0');
                            $subs.attr('tooltipdata', 'Active Subscribers');

                            $subsContainer.append($subs);
                            $('#chatters_count').after($subsContainer);

                            bttv.TwitchAPI.get('chat/' + bttv.getChannel() + '/badges').done(function(a) {
                                if (a.subscriber) {
                                    $('#subs_count').css('background-image', 'url(' + a.subscriber.image + ')');
                                }
                            });
                        }

                        $('#subs_count span').text(Twitch.display.commatize(activeSubs));
                    } else {
                        vars.dontCheckSubs = true;
                        debug.log('Dashboard Info -> Channel doesn\'t have subscribers.');
                    }
                } else {
                    debug.warn('Dashboard Info -> Error loading partnership page.');
                }
            });
        }

        setTimeout(dashboardChannelInfo, 60000 + Math.random() * 5000);
    }
};

},{"../helpers/debug":46,"../vars":64}],31:[function(require,module,exports){
var debug = require('../helpers/debug'),
    vars = require('../vars');

module.exports = function() {
    if (bttv.settings.get('showDirectoryLiveTab') === true && $('h2.title:contains("Following")').length && $('a.active:contains("Overview")').length) {
        debug.log('Changing Directory View');

        $('a[href="/directory/following/live"]').click();
    }

    if (vars.watchScroll) return;
    vars.watchScroll = $('#main_col .tse-scroll-content').scroll(function() {
        var scrollHeight = $('#main_col .tse-scroll-content')[0].scrollHeight - $('#main_col .tse-scroll-content').height(),
            scrollTop = $('#main_col .tse-scroll-content').scrollTop(),
            distanceFromBottom = scrollHeight - scrollTop;

        if (distanceFromBottom < 251) {
            if ($('#directory-list a.list_more .spinner').length) return;
            $('#directory-list a.list_more').click();
        }
    });
};

},{"../helpers/debug":46,"../vars":64}],32:[function(require,module,exports){
var pollTemplate = require('../templates/embedded-poll');
var chatHelpers = require('../chat/helpers');

var frameTimeout = null;
var lastPollId = null;

module.exports = function(message) {
    var strawpoll = /strawpoll\.me\/([0-9]+)/g.exec(message.message);

    if (!bttv.settings.get('embeddedPolling') ||
        !strawpoll ||
        !chatHelpers.isModerator(message.from)) {
        return;
    }

    var pollId = strawpoll[1];

    var $poll = $('#bttv-poll-contain');

    // Dont replace the poll with the same one
    if ($poll.length && pollId === lastPollId) return;

    // If poll exists and there's an iframe open, don't do anything.
    if ($poll.length && $poll.children('.frame').is(':visible')) return;

    // Otherwise, if the poll exists delete the poll
    if ($poll.length) $poll.remove();

    // Push new poll to DOM
    $('.ember-chat .chat-room').append(pollTemplate({ pollId: pollId }));

    // Reset $poll to newly created poll
    $poll = $('#bttv-poll-contain');

    // If timeout exists already, clear it
    if (frameTimeout !== null) {
        clearTimeout(frameTimeout);
    }

    // After 30 seconds, remove poll if user doesn't open it
    frameTimeout = setTimeout(function() {
        if ($poll && !$poll.children('.frame').is(':visible')) $poll.remove();
    }, 30000);

    // User manually closes the poll
    $poll.children('.close').on('click', function() {
        $poll.remove();
    });

    // User opens the poll
    $poll.children('.title').on('click', function() {
        $poll.children('.frame').show();
        $poll.children('.title').text('Thanks!');
        $poll.css('height', '450px');
    });

    $poll.slideDown(200);

    lastPollId = pollId;
};

},{"../chat/helpers":5,"../templates/embedded-poll":59}],33:[function(require,module,exports){
// Add an event listener to the "copy" event that fires when text is copied to
// the clipboard to convert any emoticons within the text selection to the
// corresponding text that will create the emoticon. This allows copy/pasted
// text to preserve emoticons within the Twitch chat (issue #234).
module.exports = function() {
    if (!('oncopy' in document)) {
        // Copy event is not supported.
        return;
    }

    var onCopy = function(e) {
        if (!e.clipboardData || !e.clipboardData.setData) {
            // Setting clipboard data is not possible. This is not currently
            // possible to detect without actually firing a real copy event.
            document.removeEventListener('copy', onCopy);
            return;
        }

        var emoticonSelector = 'img.emoticon';

        // Iterator to replace an element matching an emoticon image with its text.
        var replaceEmoticon = function(i, el) {
            var regex = decodeURIComponent($(el).data('regex'));
            $(el).after(regex).remove();
        };

        var selection = $(window.getSelection().getRangeAt(0).cloneContents());

        // The selection is a html fragment, so some of the jquery functions will
        // not work, so we work with the children.
        if (selection.children().is(emoticonSelector) || selection.children().find(emoticonSelector).length) {
            // The text contains an emoticon, so replace them with text that will
            // create the emoticon if possible.
            selection.children().filter(emoticonSelector).each(replaceEmoticon);
            selection.children().find(emoticonSelector).each(replaceEmoticon);
            // Get replaced selection text, and cleanup extra spacing
            selection = selection.text().replace(/\s+/g, ' ').trim();
            e.clipboardData.setData('text/plain', selection);
            // We want our data, not data from any selection, to be written to the clipboard
            e.preventDefault();
        }
    };

    document.addEventListener('copy', onCopy);
};


},{}],34:[function(require,module,exports){
var debug = require('../helpers/debug');

module.exports = function() {
    if (!$('#dash_main').length) return;

    if (bttv.settings.get('flipDashboard') === true) {
        debug.log('Flipping Dashboard');

        // We want to move the chat to the left, and the dashboard controls to the right.
        $('#dash_main .dash-chat-column').css({
            float: 'left',
            right: 'initial'
        });
        $('#dash_main #controls_column').css({
            float: 'right',
            left: '20px'
        });
    } else {
        $('#dash_main .dash-chat-column').css({
            float: 'none',
            right: '0px'
        });
        $('#dash_main #controls_column').css({
            float: 'left',
            left: '0px'
        });
    }
};

},{"../helpers/debug":46}],35:[function(require,module,exports){
var debug = require('../helpers/debug');

module.exports = function() {
    if ($('#dash_main').length) {
        debug.log('Formatting Dashboard');

        // reorder left column
        $('#dash_main #controls_column .dash-hostmode-contain').appendTo('#dash_main #controls_column');
        $('#dash_main #controls_column .dash-player-contain').appendTo('#dash_main #controls_column');

        // We move the commercial button inside the box with other dash control.
        $('#dash_main #commercial_buttons').appendTo('#dash_main .dash-broadcast-contain');

        // Small Dashboard Fixes
        $('#commercial_options .dropmenu_action[data-length=150]').text('2m 30s');
        $('#controls_column #form_submit button').attr('class', 'primary_button');
    }
};

},{"../helpers/debug":46}],36:[function(require,module,exports){
var debug = require('../helpers/debug');

module.exports = function() {
    if ($('#dash_main').length) {
        debug.log('Giveaway Plugin Dashboard Compatibility');

        $('.tga_modal').appendTo('#bttvDashboard');
        $('.tga_button').click(function() {
            if (bttv.settings.get('flipDashboard') === true) {
                $('#chat').width('330px');
                $('.tga_modal').css('right', '0px');
            } else {
                $('#chat').width('330px');
                $('.tga_modal').css('right', 'inherit');
            }
        });
        $('button[data-action="close"]').click(function() {
            $('#chat').width('500px');
        });
    }
};

},{"../helpers/debug":46}],37:[function(require,module,exports){
module.exports = function handleBackground(tiled) {
    tiled = tiled || false;

    var canvasID = 'custom-bg';

    if ($('#' + canvasID).length === 0) {
        var $bg = $('<canvas />');
        $bg.attr('id', canvasID);
        $('#channel').prepend($bg);
    }

    if (!window.App || !App.__container__.lookup('controller:Channel') || !App.__container__.lookup('controller:Channel').get('content.panels')) return;
    App.__container__.lookup('controller:Channel').get('content.panels.content').forEach(function(panel) {
        var url = panel.get('data').link;
        var safeRegex = /^https?:\/\/cdn.betterttv.net\//;
        if (url && url.indexOf('#BTTV#') !== -1) {
            var options = {};
            var queryString = url.split('#BTTV#')[1];
            var list = queryString.split('=');

            for (var i = 0; i < list.length; i += 2) {
                if (list[i + 1] && safeRegex.test(list[i + 1])) {
                    options[list[i]] = list[i + 1];
                }
            }

            if (options.bg) {
                $('#' + canvasID).attr('image', options.bg);
            }
        }
    });

    if (tiled) {
        $('#' + canvasID).addClass('tiled');
    } else {
        if ($('#' + canvasID).attr('image')) {
            var img = new Image();
            img.onload = function() {
                if (img.naturalWidth < $('#main_col').width()) {
                    setTimeout(function() {
                        handleBackground(true);
                    }, 2000);
                }
            };
            img.src = $('#' + canvasID).attr('image');
        }
    }

    /*eslint-disable */
    var g = $('#' + canvasID),
        d = g[0];
    if (d && d.getContext) {
        var c = d.getContext('2d'),
            h = $('#' + canvasID).attr('image');
        if (!h) {
            $(d).css('background-image', '');
            c.clearRect(0, 0, d.width, d.height);
        } else if (g.css({
            width: '100%',
            'background-position': 'center top'
        }), g.hasClass('tiled')) {
            g.css({
                'background-image': 'url(' + h + ')'
            }).attr('width', 200).attr('height', 200);
            d = c.createLinearGradient(0, 0, 0, 200);
            if (bttv.settings.get('darkenedMode') === true) {
                d.addColorStop(0, 'rgba(20,20,20,0.4)');
                d.addColorStop(1, 'rgba(20,20,20,1)');
            } else {
                d.addColorStop(0, 'rgba(245,245,245,0.65)');
                d.addColorStop(1, 'rgba(245,245,245,1)');
            }
            c.fillStyle = d;
            c.fillRect(0, 0, 200, 200);
        } else {
            var i = document.createElement('IMG');
            i.onload = function() {
                var a = this.width;
                d = this.height;
                g.attr('width', a).attr('height', d);
                c.drawImage(i, 0, 0);
                if (bttv.settings.get('darkenedMode') === true) {
                    d > a ? (h = c.createLinearGradient(0, 0, 0, a), h.addColorStop(0, 'rgba(20,20,20,0.4)'), h.addColorStop(1, 'rgba(20,20,20,1)'), c.fillStyle = h, c.fillRect(0, 0, a, a), c.fillStyle = 'rgb(20,20,20)', c.fillRect(0, a, a, d - a)) : (h = c.createLinearGradient(0, 0, 0, d), h.addColorStop(0, 'rgba(20,20,20,0.4)'), h.addColorStop(1, 'rgba(20,20,20,1)'), c.fillStyle = h, c.fillRect(0, 0, a, d));
                } else {
                    d > a ? (h = c.createLinearGradient(0, 0, 0, a), h.addColorStop(0, 'rgba(245,245,245,0.65)'), h.addColorStop(1, 'rgba(245,245,245,1)'), c.fillStyle = h, c.fillRect(0, 0, a, a), c.fillStyle = 'rgb(245,245,245)', c.fillRect(0, a, a, d - a)) : (h = c.createLinearGradient(0, 0, 0, d), h.addColorStop(0, 'rgba(245,245,245,0.65)'), h.addColorStop(1, 'rgba(245,245,245,1)'), c.fillStyle = h, c.fillRect(0, 0, a, d));
                }
            };
            i.src = h;
        }
    }
    /*eslint-enable */
};

},{}],38:[function(require,module,exports){
var debug = require('../helpers/debug');

module.exports = function() {
    // Inject the emote menu if option is enabled.
    if (bttv.settings.get('clickTwitchEmotes') === true) {
        debug.log('Injecting Twitch Chat Emotes Script');

        var emotesJSInject = document.createElement('script');
        emotesJSInject.setAttribute('src', 'https://cdn.betterttv.net/js/twitchemotes.js?' + bttv.info.versionString());
        emotesJSInject.setAttribute('type', 'text/javascript');
        emotesJSInject.setAttribute('id', 'clickTwitchEmotes');
        $('body').append(emotesJSInject);
    }

    // Try hooking into the emote menu, regardless of whether we injected or not.
    var counter = 0;
    var getterInterval = setInterval(function() {
        counter++;

        if (counter > 29) {
            clearInterval(getterInterval);
            return;
        }

        if (window.emoteMenu) {
            clearInterval(getterInterval);
            debug.log('Hooking into Twitch Chat Emotes Script');
            window.emoteMenu.registerEmoteGetter('BetterTTV', bttv.chat.emotes);
        }
    }, 1000);
};

},{"../helpers/debug":46}],39:[function(require,module,exports){
var vars = require('../vars');

module.exports = function() {
    if (bttv.settings.get('hostButton') !== true || !vars.userData.isLoggedIn) return;

    var chat = bttv.chat;
    var tmi = chat.tmi();

    if (!tmi) return;

    var helpers = chat.helpers;
    var userId = tmi.tmiSession ? tmi.tmiSession.userId : 0;
    var ownerId = tmi.tmiRoom ? tmi.tmiRoom.ownerId : 0;

    if (!tmi.tmiSession || !tmi.tmiSession._tmiApi) return;

    var $hostButton = $('#bttv-host-button');

    if (!$hostButton.length) {
        $hostButton = $('<span><span></span></span>');
        $hostButton.addClass('button').addClass('action');
        $hostButton.attr('id', 'bttv-host-button');
        $hostButton.insertBefore('#channel .channel-actions .theatre-button');
        $hostButton.click(function() {
            var action = $hostButton.text();

            if (action === 'Unhost') {
                try {
                    tmi.tmiSession._connections.prod._send('PRIVMSG #' + vars.userData.login + ' :/unhost');
                    helpers.serverMessage('BetterTTV: We sent a /unhost to your channel.');
                    $hostButton.children('span').text('Host');
                } catch(e) {
                    helpers.serverMessage('BetterTTV: There was an error unhosting the channel. You may need to unhost it from your channel.');
                }
            } else {
                try {
                    tmi.tmiSession._connections.prod._send('PRIVMSG #' + vars.userData.login + ' :/host ' + bttv.getChannel());
                    helpers.serverMessage('BetterTTV: We sent a /host to your channel. Please note you can only host 3 times per 30 minutes.');
                    $hostButton.children('span').text('Unhost');
                } catch(e) {
                    helpers.serverMessage('BetterTTV: There was an error hosting the channel. You may need to host it from your channel.');
                }
            }
        });
    }

    tmi.tmiSession._tmiApi.get('/hosts', {
        host: userId
    }).then(function(data) {
        if (!data.hosts || !data.hosts.length) return;

        if (data.hosts[0].target_id === ownerId) {
            $hostButton.children('span').text('Unhost');
        } else {
            $hostButton.children('span').text('Host');
        }
    });
};

},{"../vars":64}],40:[function(require,module,exports){
exports.enablePreview = function() {
    $(document).on({
        mouseenter: function() {
            var url = this.href;

            $(this).tipsy({
                trigger: 'manual',
                gravity: $.fn.tipsy.autoNS,
                html: true,
                title: function() { return '<iframe id="chat_preview" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" width="200px" scrolling="no" src="https://api.betterttv.net/2/image_embed/' + encodeURIComponent(url) + '"></iframe>'; }
            });
            $(this).tipsy('show');
        }, mouseleave: function() {
            $(this).tipsy('hide');
            $('div.tipsy').remove();
        }
    }, 'a.chat-preview');
};

exports.disablePreview = function() {
    $(document).off('mouseenter mouseleave mousemove', 'a.chat-preview');
};

},{}],41:[function(require,module,exports){
var vars = require('../vars');
var escapeRegExp = require('../helpers/regex').escapeRegExp;

exports.blacklistFilter = function(data) {
    var blacklistKeywords = [];
    var blacklistUsers = [];

    var keywords = bttv.settings.get('blacklistKeywords');
    var phraseRegex = /\{.+?\}/g;
    var testCases = keywords.match(phraseRegex);
    var i;
    if (testCases) {
        for (i = 0; i < testCases.length; i++) {
            var testCase = testCases[i];
            keywords = keywords.replace(testCase, '').replace(/\s\s+/g, ' ').trim();
            blacklistKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
        }
    }
    if (keywords !== '') {
        keywords = keywords.split(' ');
        keywords.forEach(function(keyword) {
            if (/^\([a-z0-9_\-\*]+\)$/i.test(keyword)) {
                blacklistUsers.push(keyword.replace(/(\(|\))/g, ''));
            } else {
                blacklistKeywords.push(keyword);
            }
        });
    }

    for (i = 0; i < blacklistKeywords.length; i++) {
        var keyword = escapeRegExp(blacklistKeywords[i]).replace(/\*/g, '[^ ]*');
        var blacklistRegex = new RegExp(keyword, 'i');
        if (blacklistRegex.test(data.message) && vars.userData.login !== data.from) {
            return true;
        }
    }

    for (i = 0; i < blacklistUsers.length; i++) {
        var user = escapeRegExp(blacklistUsers[i]).replace(/\*/g, '[^ ]*');
        var nickRegex = new RegExp('^' + user + '$', 'i');
        if (nickRegex.test(data.from)) {
            return true;
        }
    }

    return false;
};

exports.highlighting = function(data) {
    var audibleFeedback = require('../features/audible-feedback');

    var highlightKeywords = [];
    var highlightUsers = [];

    var extraKeywords = bttv.settings.get('highlightKeywords');
    var phraseRegex = /\{.+?\}/g;
    var testCases = extraKeywords.match(phraseRegex);
    var i;
    if (testCases) {
        for (i = 0; i < testCases.length; i++) {
            var testCase = testCases[i];
            extraKeywords = extraKeywords.replace(testCase, '').replace(/\s\s+/g, ' ').trim();
            highlightKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
        }
    }
    if (extraKeywords !== '') {
        extraKeywords = extraKeywords.split(' ');
        extraKeywords.forEach(function(keyword) {
            if (/^\([a-z0-9_\-\*]+\)$/i.test(keyword)) {
                highlightUsers.push(keyword.replace(/(\(|\))/g, ''));
            } else {
                highlightKeywords.push(keyword);
            }
        });
    }

    for (i = 0; i < highlightKeywords.length; i++) {
        var hlKeyword = escapeRegExp(highlightKeywords[i]).replace(/\*/g, '[^ ]*');
        var wordRegex = new RegExp('(\\s|^|@)' + hlKeyword + '([!.,:\';?/]|\\s|$)', 'i');
        if (vars.userData.isLoggedIn && vars.userData.login !== data.from && wordRegex.test(data.message)) {
            if (bttv.settings.get('desktopNotifications') === true && bttv.chat.store.activeView === false) {
                bttv.notify('You were mentioned in ' + bttv.chat.helpers.lookupDisplayName(bttv.getChannel()) + '\'s channel.');
                audibleFeedback();
            }
            return true;
        }
    }

    for (i = 0; i < highlightUsers.length; i++) {
        var user = escapeRegExp(highlightUsers[i]).replace(/\*/g, '[^ ]*');
        var nickRegex = new RegExp('^' + user + '$', 'i');
        if (nickRegex.test(data.from)) {
            return true;
        }
    }

    return false;
};

},{"../features/audible-feedback":14,"../helpers/regex":49,"../vars":64}],42:[function(require,module,exports){
module.exports = function(user, $event) {
    // adds in user messages from chat
    user.messages = $.makeArray($('.chat-room .chat-messages .chat-line[data-sender="' + user.name + '"]')).reverse();

    var template = bttv.chat.templates.moderationCard(user, $event.offset().top, $('.chat-lines').offset().left);
    $('.ember-chat .moderation-card').remove();
    $('.ember-chat').append(template);

    var $modCard = $('.ember-chat .moderation-card[data-user="' + user.name + '"]');

    $modCard.find('.close-button').click(function() {
        $modCard.remove();
    });
    $modCard.find('.user-messages .label').click(function() {
        $modCard.find('.user-messages .chat-messages').toggle('fast');

        var triangle = $(this).find('.triangle');
        if (triangle.hasClass('open')) {
            triangle.removeClass('open').addClass('closed');
        } else {
            triangle.removeClass('closed').addClass('open');
        }
    });
    $modCard.find('.permit').click(function() {
        bttv.chat.helpers.sendMessage('!permit ' + user.name);
        $modCard.remove();
        $('div.tipsy').remove();
    });
    $modCard.find('.timeout').click(function() {
        bttv.chat.helpers.timeout(user.name, $(this).data('time'));
        $modCard.remove();
        $('div.tipsy').remove();
    });
    $modCard.find('.ban').click(function() {
        bttv.chat.helpers.ban(user.name);
        $modCard.remove();
        $('div.tipsy').remove();
    });
    $modCard.find('.mod-card-profile').click(function() {
        window.open(Twitch.url.profile(user.name), '_blank');
    });
    $modCard.find('.mod-card-message').click(function() {
        window.open(Twitch.url.compose(user.name), '_blank');
    });
    $modCard.find('.mod-card-edit').click(function() {
        var nickname = prompt('Enter the new nickname for ' + user.display_name + '. (Leave blank to reset...)');
        if (nickname.length) {
            nickname = nickname.trim();
            if (!nickname.length) return;

            bttv.storage.pushObject('nicknames', user.name, nickname);
            $modCard.find('h3.name a').text(nickname);
            $('.chat-line[data-sender="' + user.name + '"] .from').text(nickname);
        } else {
            bttv.storage.spliceObject('nicknames', user.name);
            $modCard.find('h3.name a').text(user.display_name);
            $('.chat-line[data-sender="' + user.name + '"] .from').text(user.display_name);
        }
    });

    if (bttv.chat.helpers.isIgnored(user.name)) {
        $modCard.find('.mod-card-ignore .svg-ignore').hide();
        $modCard.find('.mod-card-ignore .svg-unignore').show();
    }
    $modCard.find('.mod-card-ignore').click(function() {
        if ($modCard.find('.mod-card-ignore .svg-unignore').css('display') !== 'none') {
            bttv.chat.helpers.sendMessage('/unignore ' + user.name);
            $modCard.find('.mod-card-ignore .svg-ignore').show();
            $modCard.find('.mod-card-ignore .svg-unignore').hide();
        } else {
            bttv.chat.helpers.sendMessage('/ignore ' + user.name);
            $modCard.find('.mod-card-ignore .svg-ignore').hide();
            $modCard.find('.mod-card-ignore .svg-unignore').show();
        }
    });

    if (bttv.chat.helpers.isModerator(user.name)) {
        $modCard.find('.mod-card-mod .svg-add-mod').hide();
        $modCard.find('.mod-card-mod .svg-remove-mod').show();
    }
    $modCard.find('.mod-card-mod').click(function() {
        if ($modCard.find('.mod-card-mod .svg-remove-mod').css('display') !== 'none') {
            bttv.chat.helpers.sendMessage('/unmod ' + user.name);
            $modCard.find('.mod-card-mod .svg-add-mod').show();
            $modCard.find('.mod-card-mod .svg-remove-mod').hide();
        } else {
            bttv.chat.helpers.sendMessage('/mod ' + user.name);
            $modCard.find('.mod-card-mod .svg-add-mod').hide();
            $modCard.find('.mod-card-mod .svg-remove-mod').show();
        }
    });

    bttv.TwitchAPI.get('users/:login/follows/channels/' + user.name).done(function() {
        $modCard.find('.mod-card-follow').text('Unfollow');
    }).fail(function() {
        $modCard.find('.mod-card-follow').text('Follow');
    });
    $modCard.find('.mod-card-follow').text('Unfollow').click(function() {
        if ($modCard.find('.mod-card-follow').text() === 'Unfollow') {
            bttv.TwitchAPI.del('users/:login/follows/channels/' + user.name).done(function() {
                bttv.chat.helpers.serverMessage('User was unfollowed successfully.', true);
            }).fail(function() {
                bttv.chat.helpers.serverMessage('There was an error following this user.', true);
            });
            $modCard.find('.mod-card-follow').text('Follow');
        } else {
            bttv.TwitchAPI.put('users/:login/follows/channels/' + user.name).done(function() {
                bttv.chat.helpers.serverMessage('User was followed successfully.', true);
            }).fail(function() {
                bttv.chat.helpers.serverMessage('There was an error following this user.', true);
            });
            $modCard.find('.mod-card-follow').text('Unfollow');
        }
    });

    $modCard.drags({ handle: '.drag-handle', el: $modCard });

    $('.chat-line[data-sender="' + user.name + '"]').addClass('bttv-user-locate');
    $modCard.on('remove', function() {
        $('.chat-line[data-sender="' + user.name + '"]').removeClass('bttv-user-locate');
    });
};

},{}],43:[function(require,module,exports){
var debug = require('../helpers/debug'),
    vars = require('../vars');

module.exports = function() {
    if (vars.emotesLoaded) return;

    debug.log('Loading BetterTTV Emoticons');

    var generate = function(data) {
        vars.emotesLoaded = true;

        data.emotes.forEach(function(emote) {
            emote.urlTemplate = data.urlTemplate.replace('{{id}}', emote.id);
            emote.url = emote.urlTemplate.replace('{{image}}', '1x');

            bttv.chat.store.bttvEmotes[emote.code] = emote;
        });

        $('body').on('mouseover', '.chat-line .emoticon', function() {
            vars.hoveringEmote = $(this);
            $(this).tipsy({
                trigger: 'manual',
                gravity: 'se',
                live: false,
                html: true,
                fallback: function() {
                    var $emote = vars.hoveringEmote;
                    if ($emote && $emote.data('regex')) {
                        var raw = decodeURIComponent($emote.data('regex'));
                        if (bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                            return 'Emote: ' + raw + '<br />Channel: ' + bttv.TwitchEmoteIDToChannel[$emote.data('id')];
                        } else if ($emote.data('channel') && $emote.data('channel') === 'BetterTTV Emotes') {
                            return 'Emote: ' + raw + '<br />BetterTTV Emoticon';
                        } else if ($emote.data('channel')) {
                            return 'Emote: ' + raw + '<br />Channel: ' + $emote.data('channel');
                        } else {
                            return raw;
                        }
                    } else {
                        return 'Kappab';
                    }
                }
            });
            $(this).tipsy('show');
            var $emote = $(this);
            if (bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                $(this).css('cursor', 'pointer');
            } else if ($emote.data('channel')) {
                $(this).css('cursor', 'pointer');
            }
        }).on('mouseout', '.chat-line .emoticon', function() {
            $(this).tipsy('hide');
            var $emote = $(this);
            if (bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                $(this).css('cursor', 'normal');
            } else if ($emote.data('channel')) {
                $(this).css('cursor', 'normal');
            }
            $('div.tipsy').remove();
        }).on('click', '.chat-line .emoticon', function() {
            var $emote = $(this);
            if ($emote.data('channel') && $emote.data('channel') === 'BetterTTV Emotes') return;

            if (bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                window.open('http://www.twitch.tv/' + bttv.TwitchEmoteIDToChannel[$emote.data('id')], '_blank');
            } else if ($emote.data('channel')) {
                window.open('http://www.twitch.tv/' + $(this).data('channel'), '_blank');
            }
        });
    };

    $.getJSON('https://api.betterttv.net/2/emotes/ids').done(function(data) {
        bttv.TwitchEmoteIDToChannel = data.ids;
    });

    $.getJSON('https://api.betterttv.net/2/emotes/sets').done(function(data) {
        bttv.TwitchEmoteSets = data.sets;
    });

    $.getJSON('https://api.betterttv.net/2/emotes').done(function(data) {
        generate(data);
    });
};

},{"../helpers/debug":46,"../vars":64}],44:[function(require,module,exports){
var debug = require('../helpers/debug');

module.exports = function() {
    if (bttv.settings.get('splitChat') !== false) {
        debug.log('Splitting Chat');

        var splitCSS = document.createElement('link');
        bttv.settings.get('darkenedMode') === true ? splitCSS.setAttribute('href', 'https://cdn.betterttv.net/style/stylesheets/betterttv-split-chat-dark.css') : splitCSS.setAttribute('href', 'https://cdn.betterttv.net/style/stylesheets/betterttv-split-chat.css');
        splitCSS.setAttribute('type', 'text/css');
        splitCSS.setAttribute('rel', 'stylesheet');
        splitCSS.setAttribute('id', 'splitChat');
        $('body').append(splitCSS);
    }
};

},{"../helpers/debug":46}],45:[function(require,module,exports){
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
var rgbToHsl = exports.rgbToHsl = function(r, g, b) {
    // Convert RGB to HSL, not ideal but it's faster than HCL or full YIQ conversion
    // based on http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s,
        l = Math.min(Math.max(0, (max + min) / 2), 1),
        d = Math.min(Math.max(0, max - min), 1);

    if (d === 0) {
        h = s = d; // achromatic
    } else {
        s = l > 0.5 ? d / (2 * (1 - l)) : d / (2 * l);
        s = Math.min(Math.max(0, s), 1);
        /* eslint-disable indent */
        // bug in eslint doesn't like switch formatting
        switch (max) {
            case r: h = Math.min(Math.max(0, (g - b) / d + (g < b ? 6 : 0)), 6); break;
            case g: h = Math.min(Math.max(0, (b - r) / d + 2), 6); break;
            case b: h = Math.min(Math.max(0, (r - g) / d + 4), 6); break;
        }
        /* eslint-enable indent */
        h /= 6;
    }
    return [h, s, l];
};

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
var hslToRgb = exports.hslToRgb = function(h, s, l) {
    // Convert HSL to RGB, again based on http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
    var r, g, b, hueToRgb, q, p;

    if (s === 0) {
        r = g = b = Math.round(Math.min(Math.max(0, 255 * l), 255)); // achromatic
    } else {
        hueToRgb = function(pp, qq, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return pp + (qq - pp) * 6 * t;
            if (t < 1 / 2) return qq;
            if (t < 2 / 3) return pp + (qq - pp) * (2 / 3 - t) * 6;
            return pp;
        };
        q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        p = 2 * l - q;
        r = Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h + 1 / 3)), 255));
        g = Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h)), 255));
        b = Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h - 1 / 3)), 255));
    }
    return [r, g, b];
};

exports.calculateColorBackground = function(color) {
    // Converts HEX to YIQ to judge what color background the color would look best on
    color = String(color).replace(/[^0-9a-f]/gi, '');
    if (color.length < 6) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }

    var r = parseInt(color.substr(0, 2), 16);
    var g = parseInt(color.substr(2, 2), 16);
    var b = parseInt(color.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'dark' : 'light';
};

exports.calculateColorReplacement = function(color, background) {
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
};

exports.getRgb = function(color) {
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
};

exports.getHex = function(color) {
    // Convert RGB object to HEX String
    var convert = function(c) {
        return ('0' + parseInt(c, 10).toString(16)).slice(-2);
    };
    return '#' + convert(color.r) + convert(color.g) + convert(color.b);
};

},{}],46:[function(require,module,exports){
module.exports = {
    log: function() {
        if (!window.console || !console.log || !bttv.settings.get('consoleLog') === true) return;
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console.log, ['BTTV:'].concat(args));
    }
};

},{}],47:[function(require,module,exports){
exports.remove = function(e) {
    // Removes all of an element
    $(e).each(function() {
        $(this).hide();
    });
};
exports.display = function(e) {
    // Displays all of an element
    $(e).each(function() {
        $(this).show();
    });
};

},{}],48:[function(require,module,exports){
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2015-05-07.2
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/* global self */
/* global safari */
/* jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/* ! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
    'use strict';
    // IE <10 is explicitly unsupported
    if (typeof navigator !== 'undefined' && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return;
    }
    var
        doc = view.document,
        // only get URL when necessary in case Blob.js hasn't overridden it yet
        getURL = function() {
            return view.URL || view.webkitURL || view;
        },
        saveLink = doc.createElementNS('http://www.w3.org/1999/xhtml', 'a'),
        canUseSaveLink = 'download' in saveLink,
        click = function(node) {
            var event = doc.createEvent('MouseEvents');
            event.initMouseEvent(
                'click', true, false, view, 0, 0, 0, 0, 0
                , false, false, false, false, 0, null
            );
            node.dispatchEvent(event);
        },
        webkitReqFS = view.webkitRequestFileSystem,
        reqFS = view.requestFileSystem || webkitReqFS || view.mozRequestFileSystem,
        throwOutside = function(ex) {
            (view.setImmediate || view.setTimeout)(function() {
                throw ex;
            }, 0);
        },
        forceSavableType = 'application/octet-stream',
        fsMinSize = 0,
        // See https://code.google.com/p/chromium/issues/detail?id=375297#c7 and
        // https://github.com/eligrey/FileSaver.js/commit/485930a#commitcomment-8768047
        // for the reasoning behind the timeout and revocation flow
        arbitraryRevokeTimeout = 500, // in ms
        revoke = function(file) {
            var revoker = function() {
                if (typeof file === 'string') { // file is an object URL
                    getURL().revokeObjectURL(file);
                } else { // file is a File
                    file.remove();
                }
            };
            if (view.chrome) {
                revoker();
            } else {
                setTimeout(revoker, arbitraryRevokeTimeout);
            }
        },
        dispatch = function(filesaver, eventTypes, event) {
            eventTypes = [].concat(eventTypes);
            var i = eventTypes.length;
            while (i--) {
                var listener = filesaver['on' + eventTypes[i]];
                if (typeof listener === 'function') {
                    try {
                        listener.call(filesaver, event || filesaver);
                    } catch (ex) {
                        throwOutside(ex);
                    }
                }
            }
        },
        autoBom = function(blob) {
            // prepend BOM for UTF-8 XML and text/* types (including HTML)
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                return new Blob(['\ufeff', blob], {type: blob.type});
            }
            return blob;
        },
        FileSaver = function(blob, name) {
            blob = autoBom(blob);
            // First try a.download, then web filesystem, then object URLs
            var
                filesaver = this,
                type = blob.type,
                blobChanged = false,
                objectUrl,
                targetView,
                dispatchAll = function() {
                    dispatch(filesaver, 'writestart progress write writeend'.split(' '));
                },
                // on any filesys errors revert to saving with object URLs
                fsError = function() {
                    // don't create more object URLs than needed
                    if (blobChanged || !objectUrl) {
                        objectUrl = getURL().createObjectURL(blob);
                    }
                    if (targetView) {
                        targetView.location.href = objectUrl;
                    } else {
                        var newTab = view.open(objectUrl, '_blank');
                        if (newTab === undefined && typeof safari !== 'undefined') {
                            // Apple do not allow window.open, see http://bit.ly/1kZffRI
                            view.location.href = objectUrl;
                        }
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatchAll();
                    revoke(objectUrl);
                },
                abortable = function(func) {
                    return function() {
                        if (filesaver.readyState !== filesaver.DONE) {
                            return func.apply(this, arguments);
                        }
                    };
                },
                createIfNotFound = {create: true, exclusive: false},
                slice
            ;
            filesaver.readyState = filesaver.INIT;
            if (!name) {
                name = 'download';
            }
            if (canUseSaveLink) {
                objectUrl = getURL().createObjectURL(blob);
                saveLink.href = objectUrl;
                saveLink.download = name;
                click(saveLink);
                filesaver.readyState = filesaver.DONE;
                dispatchAll();
                revoke(objectUrl);
                return;
            }
            // Object and web filesystem URLs have a problem saving in Google Chrome when
            // viewed in a tab, so I force save with application/octet-stream
            // http://code.google.com/p/chromium/issues/detail?id=91158
            // Update: Google errantly closed 91158, I submitted it again:
            // https://code.google.com/p/chromium/issues/detail?id=389642
            if (view.chrome && type && type !== forceSavableType) {
                slice = blob.slice || blob.webkitSlice;
                blob = slice.call(blob, 0, blob.size, forceSavableType);
                blobChanged = true;
            }
            // Since I can't be sure that the guessed media type will trigger a download
            // in WebKit, I append .download to the filename.
            // https://bugs.webkit.org/show_bug.cgi?id=65440
            if (webkitReqFS && name !== 'download') {
                name += '.download';
            }
            if (type === forceSavableType || webkitReqFS) {
                targetView = view;
            }
            if (!reqFS) {
                fsError();
                return;
            }
            fsMinSize += blob.size;
            reqFS(view.TEMPORARY, fsMinSize, abortable(function(fs) {
                fs.root.getDirectory('saved', createIfNotFound, abortable(function(dir) {
                    var save = function() {
                        dir.getFile(name, createIfNotFound, abortable(function(file) {
                            file.createWriter(abortable(function(writer) {
                                writer.onwriteend = function(event) {
                                    targetView.location.href = file.toURL();
                                    filesaver.readyState = filesaver.DONE;
                                    dispatch(filesaver, 'writeend', event);
                                    revoke(file);
                                };
                                writer.onerror = function() {
                                    var error = writer.error;
                                    if (error.code !== error.ABORT_ERR) {
                                        fsError();
                                    }
                                };
                                'writestart progress write abort'.split(' ').forEach(function(event) {
                                    writer['on' + event] = filesaver['on' + event];
                                });
                                writer.write(blob);
                                filesaver.abort = function() {
                                    writer.abort();
                                    filesaver.readyState = filesaver.DONE;
                                };
                                filesaver.readyState = filesaver.WRITING;
                            }), fsError);
                        }), fsError);
                    };
                    dir.getFile(name, {create: false}, abortable(function(file) {
                        // delete file if it already exists
                        file.remove();
                        save();
                    }), abortable(function(ex) {
                        if (ex.code === ex.NOT_FOUND_ERR) {
                            save();
                        } else {
                            fsError();
                        }
                    }));
                }), fsError);
            }), fsError);
        },
        FSProto = FileSaver.prototype,
        saveAs = function(blob, name) {
            return new FileSaver(blob, name);
        };
    // IE 10+ (native saveAs)
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        return function(blob, name) {
            return navigator.msSaveOrOpenBlob(autoBom(blob), name);
        };
    }

    FSProto.abort = function() {
        var filesaver = this;
        filesaver.readyState = filesaver.DONE;
        dispatch(filesaver, "abort");
    };
    FSProto.readyState = FSProto.INIT = 0;
    FSProto.WRITING = 1;
    FSProto.DONE = 2;

    FSProto.error =
    FSProto.onwritestart =
    FSProto.onprogress =
    FSProto.onwrite =
    FSProto.onabort =
    FSProto.onerror =
    FSProto.onwriteend =
        null;

    return saveAs;
}(
       typeof self !== "undefined" && self
    || typeof window !== "undefined" && window
    || this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() {
    return saveAs;
  });
}
},{}],49:[function(require,module,exports){
exports.escapeRegExp = function(text) {
    // Escapes an input to make it usable for regexes
    return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
};


/**
 * Function from Ryan Chatham's Twitch Chat Emotes
 * Gets the usable emote text from a regex.
 * @attribute http://userscripts.org/scripts/show/160183 (adaption)
 */
exports.getEmoteFromRegEx = function(regex) {
    return decodeURI(regex.source)
        .replace('&gt\\;', '>') // right angle bracket
        .replace('&lt\\;', '<') // left angle bracket
        .replace(/\(\?![^)]*\)/g, '') // remove negative group
        .replace(/\(([^|])*\|?[^)]*\)/g, '$1') // pick first option from a group
        .replace(/\[([^|])*\|?[^\]]*\]/g, '$1') // pick first character from a character group
        .replace(/[^\\]\?/g, '') // remove optional chars
        .replace(/^\\b|\\b$/g, '') // remove boundaries
        .replace(/\\/g, ''); // unescape
};

},{}],50:[function(require,module,exports){
module.exports = {
    'LeftClick': 1,
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
};

},{}],51:[function(require,module,exports){
module.exports = function(data) {
    return {
        // Developers and Supporters
        'night': { mod: true, tagType: 'broadcaster', tagName: '<span style="color:#FFD700;">Creator</span>', color: '#000;text-shadow: 0 0 10px #FFD700' },
        // Donations
        'gspwar': { mod: false, tagType: 'admin', tagName: 'EH?' },
        'nightmare': { mod: false, tagType: 'broadcaster', tagName: 'MLG' },
        'sour': { mod: false, tagType: 'brown', tagName: '<span style="color:#FFE600;">Saucy</span>', color: data.color + ';text-shadow: 0 0 10px #FFD700' },
        'yorkyyork': { mod: false, tagType: 'broadcaster', tagName: 'Nerd' },
        'striker035': { mod: true, tagType: 'admin', tagName: 'MotherLover' },
        'dog': { mod: true, tagType: 'bot', tagName: 'Smelly' },
        'jruxdev': { mod: true, tagType: 'bot', tagName: 'MuttonChops' },
        'totally_cereal': { mod: true, tagType: 'staff', tagName: 'Fruity' },
        'virtz': { mod: true, tagType: 'staff', tagName: 'Perv' },
        'unleashedbeast': { mod: true, tagType: 'admin', tagName: '<span style="color:black;">Surface</span>' },
        'kona': { mod: true, tagType: 'broadcaster', tagName: 'KK' },
        'norfolk': { mod: true, tagType: 'broadcaster', tagName: 'Creamy' },
        'leftyben': { mod: true, tagType: 'lefty', tagName: '&nbsp;' },
        'nokz': { mod: true, tagType: 'staff', tagName: 'N47' },
        'blindfolded': { mod: true, tagType: 'broadcaster', tagName: 'iLag' },
        'jagrawr': { mod: true, tagType: 'admin', tagName: 'Jag' },
        'snorlaxitive': { mod: true, tagType: 'purple', tagName: 'King' },
        'excalibur': { mod: true, tagType: 'staff', tagName: 'Boss' },
        'chez_plastic': { mod: true, tagType: 'staff', tagName: 'Frenchy' },
        'frontiersman72': { mod: true, tagType: 'admin', tagName: 'TMC' },
        'dckay14': { mod: true, tagType: 'admin', tagName: 'Ginger' },
        'harksa': { mod: true, tagType: 'orange', tagName: 'Feet' },
        'lltherocksaysll': { mod: true, tagType: 'broadcaster', tagName: 'BossKey' },
        'melissa_loves_everyone': { mod: true, tagType: 'purple', tagName: 'Chubby', nickname: 'Bunny' },
        'redvaloroso': { mod: true, tagType: 'broadcaster', tagName: 'Dio' },
        'slapage': { mod: true, tagType: 'bot', tagName: 'I aM' },
        'eternal_nightmare': { mod: true, tagType: 'broadcaster', tagName: 'Spencer', nickname: 'Nickiforek' },
        'iivii_beauty': { mod: true, tagType: 'purple', tagName: 'Crave' },
        'theefrenzy': { mod: true, tagType: 'staff', tagName: 'Handsome' },
        'gennousuke69': { mod: true, tagType: 'admin', tagName: 'Evil' },
        'zebbazombies': { mod: true, tagType: 'moderator', tagName: 'Hugs' },
        'nobama12345': { mod: true, tagType: 'broadcaster', tagName: 'Señor' },
        'uleet': { mod: true, tagType: 'moderator', tagName: 'Taco' },
        'mrimjustaminorthreat': { mod: true, tagType: 'staff', tagName: '<span style="color:pink;">Major</span>', nickname: 'mrimjustamajorthreat' },
        'sournothardcore': { mod: true, tagType: 'brown', tagName: '<span style="color:#FFE600 !important;">Saucy</span>', color: data.color + ';text-shadow: 0 0 10px #FFD700' },
        // People
        'mac027': { mod: true, tagType: 'admin', tagName: 'Hacks' },
        'vaughnwhiskey': { mod: true, tagType: 'admin', tagName: 'Bacon' },
        'socaldesigner': { mod: true, tagType: 'broadcaster', tagName: 'Legend' },
        'perfectorzy': { mod: true, tagType: 'moderator', tagName: 'Jabroni Ave' },
        'pantallideth1': { mod: true, tagType: 'staff', tagName: 'Windmill' },
        'mmjc': { mod: true, tagType: 'admin', tagName: 'm&m' },
        'hawkeyye': { mod: true, tagType: 'broadcaster', tagName: 'EnVy', nickname: 'Hawkeye' },
        'the_chopsticks': { mod: true, tagType: 'admin', tagName: 'oZn' },
        'bacon_donut': { mod: true, tagType: 'bacon', tagName: '&#8203;', nickname: 'Donut' },
        'tacos': { mod: true, tagType: 'taco', tagName: '&#8203;' },
        'sauce': { mod: true, tagType: 'purple', tagName: 'Drippin" Dat' },
        'thejokko': { mod: true, tagType: 'purple', tagName: 'Swede' },
        'missmiarose': { mod: true, tagType: 'admin', tagName: 'Lovely' },
        // Xmas
        'r3lapse': { mod: true, tagType: 'staff', tagName: 'Kershaw' },
        'im_tony_': { mod: true, tagType: 'admin', tagName: 'oZn' },
        'tips_': { mod: true, tagType: 'staff', tagName: '241' },
        '1danny1032': { mod: true, tagType: 'admin', tagName: '1Bar' },
        'cvagts': { mod: true, tagType: 'staff', tagName: 'SRL' },
        'thesabe': { mod: true, tagType: 'orange', tagName: '<span style="color:blue;">Sabey</span>' },
        'kerviel_': { mod: true, tagType: 'staff', tagName: 'Almighty' },
        'ackleyman': { mod: true, tagType: 'orange', tagName: 'Ack' }
    };
};

},{}],52:[function(require,module,exports){
var chat = bttv.chat, vars = bttv.vars;
var betaChat = require('./features/beta-chat'),
    channelReformat = require('./features/channel-reformat'),
    splitChat = require('./features/split-chat'),
    darkenPage = require('./features/darken-page'),
    handleBackground = require('./features/handle-background'),
    flipDashboard = require('./features/flip-dashboard'),
    cssLoader = require('./features/css-loader'),
    hostButton = require('./features/host-btn-below-video'),
    anonChat = require('./features/anon-chat'),
    handleTwitchChatEmotesScript = require('./features/handle-twitchchat-emotes');
var displayElement = require('./helpers/element').display,
    removeElement = require('./helpers/element').remove,
    imagePreview = require('./features/image-preview');

module.exports = [
    /* {
        name: 'Admin/Staff Alert',
        description: 'Get alerted in chat when admins or staff join',
        default: false,
        hidden: true,
        storageKey: 'adminStaffAlert'
    },*/
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
        name: 'BetterTTV Chat',
        description: 'A tiny chat bar for personal messaging friends (reloads page when turning off)',
        default: false,
        storageKey: 'bttvChat',
        toggle: function(value) {
            if (value === true) {
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
            var currentDarkStatus = false;

            if (!window.App || !App.__container__.lookup('controller:Layout')) return;
            App.__container__.lookup('controller:Layout').addObserver('isTheatreMode', function() {
                if (this.get('isTheatreMode') === true) {
                    currentDarkStatus = bttv.settings.get('darkenedMode');
                    if (currentDarkStatus === false) {
                        bttv.settings.save('darkenedMode', true);

                        // Toggles setting back without removing the darkened css
                        bttv.storage.put('bttv_darkenedMode', false);
                    }
                } else {
                    if (currentDarkStatus === false) bttv.settings.save('darkenedMode', false);
                }
            });
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
        default: true,
        storageKey: 'dblclickTranslation',
        toggle: function(value) {
            if (value === true) {
                $('body').on('dblclick', '.chat-line', function() {
                    chat.helpers.translate($(this).find('.message'), $(this).data('sender'), $(this).find('.message').data('raw'));
                    $(this).find('.message').text('Translating..');
                    $('div.tipsy').remove();
                });
            } else {
                $('body').unbind('dblclick');
            }
        }
    },
    {
        name: 'Disable Host Mode',
        description: 'Disables hosted channels on Twitch',
        default: false,
        storageKey: 'disableHostMode',
        toggle: function(value) {
            try {
                window.App.set('enableHostMode', !value);
            } catch(e) {}
        },
        load: function() {
            try {
                window.App.set('enableHostMode', !bttv.settings.get('disableHostMode'));
            } catch(e) {}
        }
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
        toggle: function(value) {
            if (value === true) {
                handleTwitchChatEmotesScript();
            } else {
                $('#emote-menu-button').remove();
                $('#clickTwitchEmotes').remove();
            }
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
        name: 'Mod Card Keybinds',
        description: 'Enable keybinds when you click on a username: P(urge), T(imeout), B(an), W(whisper)',
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
        name: 'Play Sound on Highlight/Whisper',
        description: 'Get audio feedback for messages directed at you (BETA)',
        default: false,
        storageKey: 'highlightFeedback'
    },
    {
        name: 'Remove Deleted Messages',
        description: 'Completely removes timed out messages from view',
        default: false,
        storageKey: 'hideDeletedMessages'
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
        name: 'Tab Completion Tooltip',
        description: 'Shows a tooltip with suggested names when using tab completion',
        default: false,
        storageKey: 'tabCompletionTooltip'
    },
    {
        name: 'TwitchCast',
        description: 'Watch a Twitch stream via Chromecast (Google Chrome only)',
        default: false,
        storageKey: 'twitchCast',
        toggle: function() {
            channelReformat();
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
        default: (vars.userData.isLoggedIn ? vars.userData.login : ''),
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
    }
];

},{"./features/anon-chat":13,"./features/beta-chat":16,"./features/channel-reformat":19,"./features/css-loader":28,"./features/darken-page":29,"./features/flip-dashboard":34,"./features/handle-background":37,"./features/handle-twitchchat-emotes":38,"./features/host-btn-below-video":39,"./features/image-preview":40,"./features/split-chat":44,"./helpers/element":47}],53:[function(require,module,exports){
var debug = require('./helpers/debug');
var saveAs = require('./helpers/filesaver').saveAs;

function Settings() {
    this._settings = {};
    this.prefix = 'bttv_';
}

Settings.prototype._parseSetting = function(value) {
    if (value == null) {
        return null;
    } else if (value === 'true') {
        return true;
    } else if (value === 'false') {
        return false;
    } else if (value === '') {
        return '';
    } else if (isNaN(value) === false) {
        return parseInt(value, 10);
    }

    return value;
};

Settings.prototype.load = function() {
    var _self = this;
    var settingsList = require('./settings-list');

    var settingTemplate = require('./templates/setting-switch');

    /*eslint-disable */
    var featureRequests = ' \
        <div class="option"> \
            Think something is missing here? Send in a <a href="https://github.com/night/BetterTTV/issues/new?labels=enhancement" target="_blank">feature request</a>! \
        </div> \
    ';
    /*eslint-enable */
    settingsList.forEach(function(setting) {
        _self._settings[setting.storageKey] = setting;
        _self._settings[setting.storageKey].value = bttv.storage.get(_self.prefix + setting.storageKey) !== null ? _self._parseSetting(bttv.storage.get(_self.prefix + setting.storageKey)) : setting.default;

        if (setting.name) {
            var settingHTML = settingTemplate(setting);
            $('#bttvSettings .options-list').append(settingHTML);
            _self._settings[setting.storageKey].value === true ? $('#' + setting.storageKey + 'True').prop('checked', true) : $('#' + setting.storageKey + 'False').prop('checked', true);
        }

        if (setting.hidden) {
            $('#bttvSettingsPanel .bttvOption-' + setting.storageKey).css('display', 'none');
            $('#bttvSettingsPanel .bttvOption-' + setting.storageKey).addClass('konami');
        }

        if (setting.load) {
            setting.load();
        }
    });

    $('#bttvSettings .options-list').append(featureRequests);

    $('.option input:radio').change(function(e) {
        _self.save(e.target.name, _self._parseSetting(e.target.value));
    });

    var notifications = bttv.storage.getObject('bttvNotifications');
    for (var notification in notifications) {
        if (notifications.hasOwnProperty(notification)) {
            var expireObj = notifications[notification];
            if (expireObj.expire < Date.now()) {
                bttv.storage.spliceObject('bttvNotifications', notification);
            }
        }
    }

    var receiveMessage = function(e) {
        if (e.origin !== window.location.protocol + '//' + window.location.host) return;
        if (e.data) {
            if (typeof e.data !== 'string') return;

            var data = e.data.split(' ');
            if (data[0] === 'bttv_setting') {
                var key = data[1],
                    value = _self._parseSetting(data[2]);

                _self.set(key, value);
            }
        }
    };
    window.addEventListener('message', receiveMessage, false);
};

Settings.prototype.backup = function() {
    var download = {};
    var _self = this;

    Object.keys(this._settings).forEach(function(setting) {
        var val = _self._settings[setting].value;
        download[setting] = val;
    });

    download = new Blob([JSON.stringify(download)], {
        type: 'text/plain;charset=utf-8;'
    });

    saveAs(download, 'bttv_settings.backup');
};

Settings.prototype.import = function(input) {
    var _self = this;

    var getDataUrlFromUpload = function(urlInput, callback) {
        var reader = new FileReader();

        reader.onload = function(e) {
            callback(e.target.result);
        };

        reader.readAsText(urlInput.files[0]);
    };

    var isJson = function(string) {
        try {
            JSON.parse(string);
        } catch (e) {
            return false;
        }
        return true;
    };

    getDataUrlFromUpload(input, function(data) {
        if (isJson(data)) {
            var settings = JSON.parse(data),
                count = 0;

            Object.keys(settings).forEach(function(setting) {
                try {
                    _self.set(setting, settings[setting]);
                    count++;
                } catch(e) {
                    debug.log('Import Error: ' + setting + ' does not exist in settings list. Ignoring...');
                }
            });

            bttv.notify('BetterTTV imported ' + count + ' settings, and will now refresh in a few seconds.');

            setTimeout(function() {
                window.location.reload();
            }, 3000);
        } else {
            bttv.notify('You uploaded an invalid file.');
        }
    });
};

Settings.prototype.get = function(setting) {
    return (setting in this._settings) ? this._settings[setting].value : null;
};

Settings.prototype.set = function(setting, value) {
    this._settings[setting].value = value;

    bttv.storage.put(this.prefix + setting, value);
};

Settings.prototype.save = function(setting, value) {
    if (/\?bttvSettings=true/.test(window.location)) {
        window.opener.postMessage('bttv_setting ' + setting + ' ' + value, window.location.protocol + '//' + window.location.host);
    } else {
        try {
            if (window.__bttvga) __bttvga('send', 'event', 'BTTV', 'Change Setting: ' + setting + '=' + value);

            if (window !== window.top) window.parent.postMessage('bttv_setting ' + setting + ' ' + value, window.location.protocol + '//' + window.location.host);

            this.set(setting, value);

            if (this._settings[setting].toggle) this._settings[setting].toggle(value);
        } catch(e) {
            debug.log(e);
        }
    }
};

Settings.prototype.popup = function() {
    var settingsUrl = window.location.protocol + '//' + window.location.host + '/settings?bttvSettings=true';
    window.open(settingsUrl, 'BetterTTV Settings', 'width=800,height=500,top=500,left=800,scrollbars=no,location=no,directories=no,status=no,menubar=no,toolbar=no,resizable=no');
};

module.exports = Settings;

},{"./helpers/debug":46,"./helpers/filesaver":48,"./settings-list":52,"./templates/setting-switch":61}],54:[function(require,module,exports){
var io = require('socket.io-client');
var debug = require('./helpers/debug');
var vars = require('./vars');
var BetaSocket = require('./ws');

function SocketClient() {
    this.beta = new BetaSocket();
    this.socket = io('https://sockets.betterttv.net/', {
        reconnection: true,
        reconnectionDelay: 30000,
        reconnectionDelayMax: 300000
    });
    this._lookedUpUsers = [];
    this._connected = false;

    var _self = this;
    this.socket.on('connect', function() {
        debug.log('SocketClient: Connected to BetterTTV Socket Server');

        _self._connected = true;
    });

    this.socket.on('disconnect', function() {
        debug.log('SocketClient: Disconnected from BetterTTV Socket Server');

        _self._connected = false;
    });

    // The rare occasion we need to global message to people
    this.socket.on('alert', function(data) {
        if (data.type === 'chat') {
            bttv.chat.helpers.serverMessage(data.message);
        } else if (data.type === 'growl') {
            bttv.notify(data.message.text, data.message.title, data.message.url, data.message.image, data.message.tag, data.message.permanent);
        }
    });

    // Night's legacy subs
    this.socket.on('new_subscriber', function(data) {
        if (data.channel !== bttv.getChannel()) return;

        bttv.chat.helpers.notifyMessage('subscriber', bttv.chat.helpers.lookupDisplayName(data.user) + ' just subscribed!');
        bttv.chat.store.__subscriptions[data.user] = ['night'];
        bttv.chat.helpers.reparseMessages(data.user);
    });

    // Nightbot emits commercial warnings to mods
    this.socket.on('commercial', function(data) {
        if (data.channel !== bttv.getChannel()) return;
        if (!vars.userData.isLoggedIn || !bttv.chat.helpers.isModerator(vars.userData.login)) return;

        bttv.chat.helpers.notifyMessage('bot', data.message);
    });
}

// Night's legacy subs
SocketClient.prototype.lookupUser = function(name) {
    this.beta.lookupUser(name);

    if (!this._connected || !this.socket.connected) return;
    if (this._lookedUpUsers.indexOf(name) > -1) return;
    this._lookedUpUsers.push(name);

    this.socket.emit('lookup_user', name, function(subscription) {
        if (!subscription) return;

        bttv.chat.store.__subscriptions[name] = ['night'];
        if (subscription.glow) bttv.chat.store.__subscriptions[name].push('_glow');
        bttv.chat.helpers.reparseMessages(name);
    });
};

SocketClient.prototype.joinChannel = function() {
    if (!this._connected || !this.socket.connected) return;
    if (!bttv.getChannel().length) return;

    this.socket.emit('join_channel', bttv.getChannel());

    // Night's legacy subs
    if (bttv.getChannel() !== 'night') return;
    var element = document.createElement('style');
    element.type = 'text/css';
    element.innerHTML = '.badge.subscriber { background-image: url("https://cdn.betterttv.net/tags/supporter.png") !important; }';
    bttv.jQuery('.ember-chat .chat-room').append(element);
};

module.exports = SocketClient;

},{"./helpers/debug":46,"./vars":64,"./ws":65,"socket.io-client":68}],55:[function(require,module,exports){
var cookies = require('cookies-js');
var debug = require('./helpers/debug');

function Storage() {
    this._localStorageSupport = true;

    if (!window.localStorage) {
        debug.log('window.localStorage not detected. Defaulting to cookies.');
        this._localStorageSupport = false;
    } else {
        try {
            window.localStorage.setItem('bttv_test', 'it works!');
            window.localStorage.removeItem('bttv_test');
        } catch(e) {
            debug.log('window.localStorage detected, but unable to save. Defaulting to cookies.');
            this._localStorageSupport = false;
        }
    }
}

Storage.prototype.exists = function(item) {
    return (this.get(item) ? true : false);
};

Storage.prototype.get = function(item) {
    return this._localStorageSupport ? window.localStorage.getItem(item) : cookies.get(item);
};

Storage.prototype.getArray = function(item) {
    if (!this.exists(item)) this.putArray(item, []);
    return JSON.parse(this.get(item));
};

Storage.prototype.getObject = function(item) {
    if (!this.exists(item)) this.putObject(item, {});
    return JSON.parse(this.get(item));
};

Storage.prototype.put = function(item, value) {
    this._localStorageSupport ? window.localStorage.setItem(item, value) : cookies.set(item, value, { expires: Infinity });
};

Storage.prototype.pushArray = function(item, value) {
    var i = this.getArray(item);
    i.push(value);
    this.putArray(item, i);
};

Storage.prototype.pushObject = function(item, key, value) {
    var i = this.getObject(item);
    i[key] = value;
    this.putObject(item, i);
};

Storage.prototype.putArray = function(item, value) {
    this.put(item, JSON.stringify(value));
};

Storage.prototype.putObject = function(item, value) {
    this.put(item, JSON.stringify(value));
};

Storage.prototype.spliceArray = function(item, value) {
    var i = this.getArray(item);
    if (i.indexOf(value) !== -1) i.splice(i.indexOf(value), 1);
    this.putArray(item, i);
};

Storage.prototype.spliceObject = function(item, key) {
    var i = this.getObject(item);
    delete i[key];
    this.putObject(item, i);
};

module.exports = Storage;

},{"./helpers/debug":46,"cookies-js":66}],56:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"bttv-channel-state-contain\"><div title=\"Robot9000 Enabled\" class=\"r9k\"><svg width=\"26px\" height=\"22px\" version=\"1.1\" viewBox=\"0 0 26 22\" x=\"0px\" y=\"0px\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" fill=\"#d3d3d3\" stroke=\"none\" d=\"M2.98763607,10.2134233 C2.98763607,9.87789913 2.97951867,9.53696837 2.96328363,9.19062081 C2.94704859,8.84427325 2.93351959,8.3951105 2.92269623,7.84311909 L3.97796866,7.84311909 L3.97796866,9.25556065 L4.01043858,9.25556065 C4.08620211,9.04991679 4.1944341,8.85239341 4.33513779,8.66298459 C4.47584149,8.47357577 4.64630687,8.30311039 4.84653905,8.15158334 C5.04677123,8.00005628 5.27947001,7.87829529 5.54464235,7.78629672 C5.8098147,7.69429815 6.11015847,7.64829956 6.44568266,7.64829956 C6.74873677,7.64829956 7.01390514,7.68076916 7.24119573,7.74570932 L7.03014124,8.80098176 C6.88943755,8.74686495 6.68379677,8.71980695 6.41321274,8.71980695 C6.00192502,8.71980695 5.65017106,8.79827515 5.35794031,8.95521388 C5.06570956,9.11215262 4.82218758,9.3123818 4.62736708,9.55590742 C4.43254658,9.79943305 4.2891392,10.0618956 4.19714063,10.343303 C4.10514206,10.6247104 4.05914347,10.8952904 4.05914347,11.155051 L4.05914347,15.4410806 L2.98763607,15.4410806 L2.98763607,10.2134233 Z M14.1735239,7.30736539 C14.1735239,6.93937111 14.1112905,6.60385195 13.9868218,6.30079784 C13.8623532,5.99774372 13.6864762,5.73798695 13.4591856,5.52151973 C13.231895,5.30505251 12.9613151,5.13458713 12.6474376,5.01011847 C12.3335601,4.88564982 11.9872178,4.82341643 11.6084001,4.82341643 C11.2295825,4.82341643 10.8832401,4.88564982 10.5693626,5.01011847 C10.2554852,5.13458713 9.98490519,5.30505251 9.75761461,5.52151973 C9.53032403,5.73798695 9.35444705,5.99774372 9.22997839,6.30079784 C9.10550974,6.60385195 9.04327635,6.93937111 9.04327635,7.30736539 C9.04327635,7.67535967 9.10550974,8.01087883 9.22997839,8.31393294 C9.35444705,8.61698705 9.53032403,8.87944962 9.75761461,9.10132853 C9.98490519,9.32320743 10.2554852,9.49367281 10.5693626,9.61272978 C10.8832401,9.73178676 11.2295825,9.79131435 11.6084001,9.79131435 C11.9872178,9.79131435 12.3335601,9.73178676 12.6474376,9.61272978 C12.9613151,9.49367281 13.231895,9.32320743 13.4591856,9.10132853 C13.6864762,8.87944962 13.8623532,8.61698705 13.9868218,8.31393294 C14.1112905,8.01087883 14.1735239,7.67535967 14.1735239,7.30736539 L14.1735239,7.30736539 Z M13.0046067,10.5056526 L12.9721368,10.4731827 C12.7881397,10.603063 12.5419119,10.7004718 12.2334461,10.765412 C11.9249803,10.8303521 11.6408713,10.8628217 11.3811107,10.8628217 C10.8832361,10.8628217 10.4205443,10.7735304 9.99302154,10.5949449 C9.56549877,10.4163594 9.19480422,10.1701317 8.88092674,9.85625419 C8.56704927,9.54237672 8.3208215,9.16897636 8.14223604,8.73604192 C7.96365058,8.30310747 7.87435919,7.82688672 7.87435919,7.30736539 C7.87435919,6.77702069 7.96635638,6.29538835 8.15035352,5.8624539 C8.33435066,5.42951946 8.59410743,5.0561191 8.92963162,4.74224162 C9.26515582,4.42836415 9.66020257,4.18484218 10.1147837,4.0116684 C10.5693649,3.83849462 11.0672321,3.75190903 11.6084001,3.75190903 C12.1495682,3.75190903 12.6474353,3.83849462 13.1020165,4.0116684 C13.5565976,4.18484218 13.9516444,4.42836415 14.2871686,4.74224162 C14.6226928,5.0561191 14.8824496,5.42951946 15.0664467,5.8624539 C15.2504438,6.29538835 15.342441,6.77702069 15.342441,7.30736539 C15.342441,7.9459437 15.247738,8.50333843 15.0583292,8.97956632 C14.8689204,9.45579421 14.6335158,9.92660336 14.3521084,10.3920079 L11.251231,15.4410806 L9.87125933,15.4410806 L13.0046067,10.5056526 Z M18.3621437,11.2686958 L21.95007,7.84311909 L23.5573311,7.84311909 L19.7745853,11.3174006 L23.9632051,15.4410806 L22.3072391,15.4410806 L18.3621437,11.4472803 L18.3621437,15.4410806 L17.2906363,15.4410806 L17.2906363,3.16745045 L18.3621437,3.16745045 L18.3621437,11.2686958 Z\"></path></svg></div><div title=\"Subscribers-Only Mode Enabled\" class=\"subs-only\"><svg width=\"26px\" height=\"22px\" version=\"1.1\" viewBox=\"0 0 26 22\" x=\"0px\" y=\"0px\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" fill=\"#d3d3d3\" stroke=\"none\" d=\"M9.27481618,13.6268381 C9.27481619,15.0585936 21.1132816,15.0078128 21.1132816,13.6268381 C21.1132816,12.2458633 16.9215274,13.7446739 16.6289064,11.3913143 C16.3362854,9.03795478 17.8113514,9.06502765 17.8113514,7.74195776 C17.8113514,6.41888788 16.1631438,5.44732696 15.194049,5.3492647 C14.2249543,5.25120244 12.5834099,6.17624082 12.5834099,7.74195772 C12.5834099,9.30767461 13.8025847,9.44785699 13.6895682,11.3913143 C13.5765516,13.3347717 9.27481616,12.1950825 9.27481618,13.6268381 Z\"></path><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" fill=\"#d3d3d3\" stroke=\"none\" d=\"M9.05269623,4.02031837 C9.41269803,4.02031837 9.78602763,4.06698457 10.1726962,4.16031837 C10.5593648,4.25365217 10.8993614,4.41698387 11.1926962,4.65031837 L10.2326962,5.82031837 C10.0726954,5.68031767 9.88936393,5.57865202 9.68269623,5.51531837 C9.47602853,5.45198472 9.26603063,5.41365177 9.05269623,5.40031837 L9.05269623,6.99031837 L10.0126962,7.27031837 C10.4526984,7.40365237 10.8043616,7.62198352 11.0676962,7.92531837 C11.3310309,8.22865322 11.4626962,8.61364937 11.4626962,9.08031837 C11.4626962,9.43365347 11.3993635,9.74365037 11.2726962,10.0103184 C11.1460289,10.2769864 10.9726973,10.5036508 10.7526962,10.6903184 C10.5326951,10.876986 10.276031,11.0236512 9.98269623,11.1303184 C9.68936143,11.2369856 9.37936453,11.3069849 9.05269623,11.3403184 L9.05269623,12.0403184 L8.39269623,12.0403184 L8.39269623,11.3403184 C7.95269403,11.3403184 7.51436508,11.280319 7.07769623,11.1603184 C6.64102738,11.0403178 6.25603123,10.8303199 5.92269623,10.5303184 L6.98269623,9.34031837 C7.15603043,9.55365277 7.36602833,9.70531792 7.61269623,9.79531837 C7.85936413,9.88531882 8.11936153,9.94031827 8.39269623,9.96031837 L8.39269623,8.27031837 L7.66269623,8.05031837 C7.15602703,7.89031757 6.77103088,7.66531982 6.50769623,7.37531837 C6.24436158,7.08531692 6.11269623,6.68698757 6.11269623,6.18031837 C6.11269623,5.86698347 6.17602893,5.58365297 6.30269623,5.33031837 C6.42936353,5.07698377 6.59769518,4.86031927 6.80769623,4.68031837 C7.01769728,4.50031747 7.26102818,4.35365227 7.53769623,4.24031837 C7.81436428,4.12698447 8.09936143,4.05365187 8.39269623,4.02031837 L8.39269623,3.32031837 L9.05269623,3.32031837 L9.05269623,4.02031837 Z M8.39269623,5.43031837 C8.20602863,5.47031857 8.03936363,5.54031787 7.89269623,5.64031837 C7.74602883,5.74031887 7.67269623,5.89698397 7.67269623,6.11031837 C7.67269623,6.26365247 7.70269593,6.38365127 7.76269623,6.47031837 C7.82269653,6.55698547 7.89269583,6.62531812 7.97269623,6.67531837 C8.05269663,6.72531862 8.13269583,6.76031827 8.21269623,6.78031837 C8.29269663,6.80031847 8.35269603,6.81698497 8.39269623,6.83031837 L8.39269623,5.43031837 Z M9.05269623,9.94031837 C9.15269673,9.92031827 9.25436238,9.89198522 9.35769623,9.85531837 C9.46103008,9.81865152 9.55269583,9.77031867 9.63269623,9.71031837 C9.71269663,9.65031807 9.77769598,9.57865212 9.82769623,9.49531837 C9.87769648,9.41198462 9.90269623,9.31365227 9.90269623,9.20031837 C9.90269623,9.09365117 9.88436308,9.00365207 9.84769623,8.93031837 C9.81102938,8.85698467 9.76269653,8.79531862 9.70269623,8.74531837 C9.64269593,8.69531812 9.57269663,8.65198522 9.49269623,8.61531837 C9.41269583,8.57865152 9.32936333,8.54365187 9.24269623,8.51031837 L9.05269623,8.44031837 L9.05269623,9.94031837 Z\"></path></svg></div><div class=\"slow\"><div title=\"0 seconds\" class=\"slow-time\">0:00</div><svg width=\"26px\" height=\"22px\" version=\"1.1\" viewBox=\"0 0 26 22\" x=\"0px\" y=\"0px\" title=\"Slow Mode Enabled\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" fill=\"#d3d3d3\" stroke=\"none\" d=\"M17.1477712,15.2881724 C18.1841482,15.2990242 18.3714659,13.1141401 18.984666,13.0696235 C20.7929233,12.9383492 21.27411,12.5312339 22.0061575,11.9392359 C23.1373692,11.0244387 19.9060764,12.1089751 19.4762501,10.2570139 C19.0464238,8.40505269 20.0193482,10.024402 20.0193482,10.024402 C20.0193482,10.024402 21.8187185,4.26759557 15.5617966,4.00868857 C9.30487476,3.74978158 10.4161868,9.36314385 10.4161868,9.36314385 C10.4161868,9.36314385 11.2540951,8.34295601 11.2540951,9.63941257 C11.2540951,10.1964047 9.76901904,10.6570445 8.53287358,9.63941257 C7.29672813,8.62178061 8.11686902,7.37127839 7.67827778,6.69569265 C7.23968654,6.02010691 3.76038497,5.06926224 3.24213373,5.95824564 C2.72388249,6.84722904 5.76831809,8.74663617 5.96217543,9.63941257 C6.15603277,10.532189 7.03943787,12.1288651 7.49294803,12.5678492 C7.94645819,13.0068332 5.92939735,14.4797566 6.69153143,14.5326896 C7.45366552,14.5856225 9.47706304,12.9278239 10.0844223,12.7478364 C10.6917815,12.5678489 13.1392341,12.9471552 14.5871877,13.023578 C15.3550569,13.064106 16.1113943,15.2773206 17.1477712,15.2881724 Z M4.84344721,6.76429629 C5.04601701,6.76429629 5.21023228,6.60974074 5.21023228,6.41908681 C5.21023228,6.22843288 5.04601701,6.07387733 4.84344721,6.07387733 C4.6408774,6.07387733 4.47666213,6.22843288 4.47666213,6.41908681 C4.47666213,6.60974074 4.6408774,6.76429629 4.84344721,6.76429629 Z M11.7028228,7.36314163 C11.7326095,6.35178988 13.3449525,4.92929352 15.0963754,4.98088076 C16.8477983,5.032468 18.7948736,6.68625403 18.7749376,7.36314154 C18.7550016,8.04002904 16.952545,5.71526454 15.0963754,5.66059204 C13.2402058,5.60591954 11.673036,8.37449337 11.7028228,7.36314163 Z\"></path></svg></div></div>");;return buf.join("");
};module.exports=template;
},{}],57:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function ($, window, bttv) {
buf.push("<div class=\"list-header\">BetterTTV</div><div class=\"chat-menu-content\">");
if ( $("body[data-page=\"ember#chat\"]").length)
{
buf.push("<p><a href=\"#\" class=\"g18_gear-00000080 blackChatLink\">Black Chat (Chroma Key)</a></p>");
}
if ( $("#dash_main").length || window !== window.top)
{
buf.push("<p><a href=\"#\" class=\"g18_gear-00000080 flipDashboard\">");
if ( bttv.settings.get("flipDashboard"))
{
buf.push("Unflip Dashboard");
}
else
{
buf.push("Flip Dashboard");
}
buf.push("</a></p>");
}
buf.push("<p><input type=\"checkbox\"" + (jade.attr("checked", bttv.settings.get("darkenedMode"), true, false)) + " class=\"toggleDarkenTTV\"/>Dark Mode</p><p><a href=\"#\" class=\"g18_gear-00000080 setBlacklistKeywords\">Set Blacklist Keywords</a></p><p><a href=\"#\" class=\"g18_gear-00000080 setHighlightKeywords\">Set Highlight Keywords</a></p><p><a href=\"#\" class=\"g18_gear-00000080 setScrollbackAmount\">Set Scrollback Amount</a></p><p><a href=\"#\" class=\"g18_trash-00000080 clearChat\">Clear My Chat</a></p><p><a href=\"#\" style=\"display: block;margin-top: 8px;text-align: center;\" class=\"button-simple dark openSettings\">BetterTTV Settings</a></p></div>");}.call(this,"$" in locals_for_with?locals_for_with.$:typeof $!=="undefined"?$:undefined,"window" in locals_for_with?locals_for_with.window:typeof window!=="undefined"?window:undefined,"bttv" in locals_for_with?locals_for_with.bttv:typeof bttv!=="undefined"?bttv:undefined));;return buf.join("");
};module.exports=template;
},{}],58:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (suggestions, index) {
buf.push("<div class=\"suggestions\">");
// iterate suggestions
;(function(){
  var $$obj = suggestions;
  if ('number' == typeof $$obj.length) {

    for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
      var suggestion = $$obj[i];

var highlighted = (i === index) ? ["highlighted"] : []
buf.push("<div" + (jade.cls([highlighted], [true])) + "><div class=\"suggestion\"><span>" + (jade.escape(null == (jade_interp = suggestion) ? "" : jade_interp)) + "</span></div></div>");
    }

  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;      var suggestion = $$obj[i];

var highlighted = (i === index) ? ["highlighted"] : []
buf.push("<div" + (jade.cls([highlighted], [true])) + "><div class=\"suggestion\"><span>" + (jade.escape(null == (jade_interp = suggestion) ? "" : jade_interp)) + "</span></div></div>");
    }

  }
}).call(this);

buf.push("</div>");}.call(this,"suggestions" in locals_for_with?locals_for_with.suggestions:typeof suggestions!=="undefined"?suggestions:undefined,"index" in locals_for_with?locals_for_with.index:typeof index!=="undefined"?index:undefined));;return buf.join("");
};module.exports=template;
},{}],59:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (pollId) {
buf.push("<div id=\"bttv-poll-contain\"><div class=\"title\">New poll available! <span style=\"text-decoration: underline;\">Vote now!</span></div><div class=\"close\"><svg height=\"16px\" version=\"1.1\" viewbox=\"0 0 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-close\"><path clip-rule=\"evenodd\" d=\"M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z\" fill-rule=\"evenodd\"></path></svg></div><iframe" + (jade.attr("src", 'https://strawpoll.me/embed_2/' + (pollId) + '', true, false)) + " class=\"frame\"></iframe></div>");}.call(this,"pollId" in locals_for_with?locals_for_with.pollId:typeof pollId!=="undefined"?pollId:undefined));;return buf.join("");
};module.exports=template;
},{}],60:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (require, user, top, left, Twitch, bttv, Date) {
var vars = require('../vars')
buf.push("<div" + (jade.attr("data-user", user.name, true, false)) + (jade.attr("style", "top: " + (top) + "px;left: " + (left) + "px;", true, false)) + " class=\"bttv-mod-card ember-view moderation-card\"><div class=\"close-button\"><svg height=\"16px\" version=\"1.1\" viewbox=\"0 0 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-close\"><path clip-rule=\"evenodd\" d=\"M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z\" fill-rule=\"evenodd\"></path></svg></div><div" + (jade.attr("style", "background-color: " + (user.profile_banner_background_color?user.profile_banner_background_color:'#000') + "", true, false)) + " class=\"card-header\"><img" + (jade.attr("src", user.logo?user.logo:'https://www-cdn.jtvnw.net/images/xarth/404_user_300x300.png', true, false)) + " class=\"channel_logo\"/><div class=\"drag-handle\"></div><h3 class=\"name\"><a" + (jade.attr("href", Twitch.url.profile(user.name), true, false)) + " target=\"_blank\">" + (jade.escape(null == (jade_interp = bttv.storage.getObject("nicknames")[user.name.toLowerCase()] || user.display_name) ? "" : jade_interp)) + "</a><svg style=\"margin-left: 5px;\" height=\"10px\" width=\"10px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-edit mod-card-edit\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M6.414,12.414L3.586,9.586l8-8l2.828,2.828L6.414,12.414z M4.829,14H2l0,0v-2.828l0.586-0.586l2.828,2.828L4.829,14z\"></path></svg></h3>");
if ( bttv.storage.getObject("nicknames")[user.name.toLowerCase()])
{
buf.push("<h4 class=\"real-name\">" + (jade.escape(null == (jade_interp = user.display_name) ? "" : jade_interp)) + "</h4>");
}
buf.push("<h4 class=\"created-at\">" + (jade.escape(null == (jade_interp = "Created " + Date.parse(user.created_at).toString("MMM d, yyyy")) ? "" : jade_interp)) + "</h4><div class=\"channel_background_cover\"></div>");
if ( user.profile_banner)
{
buf.push("<img" + (jade.attr("src", user.profile_banner, true, false)) + " class=\"channel_background\"/>");
}
buf.push("<div class=\"channel-stats\"><span class=\"stat\">" + (jade.escape(null == (jade_interp = Twitch.display.commatize(user.views)) ? "" : jade_interp)) + "<svg height=\"16px\" version=\"1.1\" viewbox=\"1 1 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-glyph_views\"><path clip-rule=\"evenodd\" d=\"M11,13H5L1,9V8V7l4-4h6l4,4v1v1L11,13z M8,5C6.344,5,5,6.343,5,8c0,1.656,1.344,3,3,3c1.657,0,3-1.344,3-3C11,6.343,9.657,5,8,5z M8,9C7.447,9,7,8.552,7,8s0.447-1,1-1s1,0.448,1,1S8.553,9,8,9z\" fill-rule=\"evenodd\"></path></svg></span><span class=\"stat\">" + (jade.escape(null == (jade_interp = Twitch.display.commatize(user.followers)) ? "" : jade_interp)) + "<svg height=\"16px\" version=\"1.1\" viewbox=\"0 0 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-glyph_followers\"><path clip-rule=\"evenodd\" d=\"M8,13.5L1.5,7V4l2-2h3L8,3.5L9.5,2h3l2,2v3L8,13.5z\" fill-rule=\"evenodd\"></path></svg></span></div></div>");
if ( user.name != vars.userData.login)
{
buf.push("<div class=\"interface\"><div class=\"btn-wrapper\"><button class=\"button-simple primary mod-card-follow\">Follow</button><button style=\"height: 30px;vertical-align: top;\" title=\"View user's profile\" class=\"button-simple dark mod-card-profile\"><img src=\"https://www-cdn.jtvnw.net/images/xarth/g/g18_person-00000080.png\" style=\"margin-top: 6px;\"/></button><button style=\"height: 30px;vertical-align: top;\" title=\"Send user a message\" class=\"button-simple dark mod-card-message\"><img src=\"https://www-cdn.jtvnw.net/images/xarth/g/g18_mail-00000080.png\" style=\"margin-top: 6px;\"/></button><button title=\"Add/Remove user from ignores\" class=\"button-simple dark mod-card-ignore\"><svg height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-ignore\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M13,11.341V16l-3.722-3.102C8.863,12.959,8.438,13,8,13c-3.866,0-7-2.462-7-5.5C1,4.462,4.134,2,8,2s7,2.462,7,5.5C15,8.996,14.234,10.35,13,11.341z M11,7H5v1h6V7z\"></path></svg><svg style=\"display: none;\" height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-unignore\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M13,11.341V16l-3.722-3.102C8.863,12.959,8.438,13,8,13c-3.866,0-7-2.462-7-5.5C1,4.462,4.134,2,8,2s7,2.462,7,5.5C15,8.996,14.234,10.35,13,11.341z\"></path></svg></button>");
if ( vars.userData.isLoggedIn && (bttv.chat.helpers.isOwner(vars.userData.login) || bttv.chat.helpers.isStaff(vars.userData.login) || bttv.chat.helpers.isAdmin(vars.userData.login)))
{
buf.push("<button title=\"Add/Remove this user as a moderator\" class=\"button-simple dark mod-card-mod\"><svg height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-add-mod\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M15,7L1,16l4.666-7H1l14-9l-4.667,7H15z\"></path></svg><svg style=\"display: none;\" height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-remove-mod\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M 1.7692223,7.3226542 14.725057,7.3226542 14.725057,8.199533 1.7692223,8.199533 z M 15,0 5.4375,6.15625 10.90625,6.15625 15,0 z M 5.375,9.40625 1,16 11.25,9.40625 5.375,9.40625 z\"></path></svg></button>");
}
if ( vars.userData.isLoggedIn && bttv.chat.helpers.isModerator(vars.userData.login) && (!bttv.chat.helpers.isModerator(user.name) || vars.userData.login === bttv.getChannel()))
{
buf.push("<span class=\"mod-controls\"><button title=\"!permit this user\" class=\"permit button-simple light\"><svg height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-permit\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M 13.71875,3.75 A 0.750075,0.750075 0 0 0 13.28125,4 L 5.71875,11.90625 3.59375,9.71875 A 0.750075,0.750075 0 1 0 2.53125,10.75 L 5.21875,13.53125 A 0.750075,0.750075 0 0 0 6.28125,13.5 L 14.34375,5.03125 A 0.750075,0.750075 0 0 0 13.71875,3.75 z M 4.15625,5.15625 C 2.1392444,5.1709094 0.53125,6.2956115 0.53125,7.6875 0.53125,8.1957367 0.75176764,8.6679042 1.125,9.0625 A 1.60016,1.60016 0 0 1 2.15625,8.25 C 2.0893446,8.0866555 2.0625,7.9078494 2.0625,7.71875 2.0625,6.9200694 2.7013192,6.25 3.5,6.25 L 7.15625,6.25 C 7.1438569,5.1585201 6.6779611,5.1379224 4.15625,5.15625 z M 9.625,5.15625 C 8.4334232,5.1999706 8.165545,5.4313901 8.15625,6.25 L 9.96875,6.25 11.03125,5.15625 C 10.471525,5.1447549 9.9897684,5.1428661 9.625,5.15625 z M 14.28125,6.40625 13.3125,7.40625 C 13.336036,7.5094042 13.34375,7.6089314 13.34375,7.71875 13.34375,8.5174307 12.67368,9.125 11.875,9.125 L 11.65625,9.125 10.65625,10.1875 C 10.841425,10.189327 10.941084,10.186143 11.15625,10.1875 13.17327,10.200222 14.78125,9.0793881 14.78125,7.6875 14.78125,7.2160918 14.606145,6.7775069 14.28125,6.40625 z M 4.40625,7.1875 C 4.0977434,7.1875 3.84375,7.4414933 3.84375,7.75 3.84375,8.0585065 4.0977434,8.3125 4.40625,8.3125 L 8,8.3125 9.0625,7.1875 4.40625,7.1875 z M 4.125,9.125 5.15625,10.1875 C 5.5748133,10.180859 5.9978157,10.155426 6.25,10.125 L 7.15625,9.1875 C 7.1572971,9.1653754 7.1553832,9.1481254 7.15625,9.125 L 4.125,9.125 z\"></path></svg></button></span><br/><span class=\"mod-controls\"><button style=\"width:44px;\" data-time=\"1\" title=\"Clear this user's chat\" class=\"timeout button-simple light\">Purge</button><button data-time=\"600\" title=\"Temporary 10 minute ban\" class=\"timeout button-simple light\"><img src=\"/images/xarth/g/g18_timeout-00000080.png\"/></button><button style=\"width:30px;\" data-time=\"3600\" title=\"Temporary 1 hour ban\" class=\"timeout button-simple light\">1hr</button><button style=\"width:30px;\" data-time=\"28800\" title=\"Temporary 8 hour ban\" class=\"timeout button-simple light\">8hr</button><button style=\"width:38px;\" data-time=\"86400\" title=\"Temporary 24 hour ban\" class=\"timeout button-simple light\">24hr</button><button title=\"Permanent Ban\" class=\"ban button-simple light\"><img src=\"/images/xarth/g/g18_ban-00000080.png\"/></button></span>");
}
buf.push("</div><br/><div class=\"user-messages\"><div class=\"label\"><span>Chat Messages</span><div class=\"triangle closed\"></div></div><div class=\"message-list chat-messages\">");
// iterate user.messages
;(function(){
  var $$obj = user.messages;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var message = $$obj[$index];

buf.push("<div>" + (null == (jade_interp = message.outerHTML) ? "" : jade_interp) + "</div>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var message = $$obj[$index];

buf.push("<div>" + (null == (jade_interp = message.outerHTML) ? "" : jade_interp) + "</div>");
    }

  }
}).call(this);

buf.push("</div></div></div>");
}
buf.push("</div>");}.call(this,"require" in locals_for_with?locals_for_with.require:typeof require!=="undefined"?require:undefined,"user" in locals_for_with?locals_for_with.user:typeof user!=="undefined"?user:undefined,"top" in locals_for_with?locals_for_with.top:typeof top!=="undefined"?top:undefined,"left" in locals_for_with?locals_for_with.left:typeof left!=="undefined"?left:undefined,"Twitch" in locals_for_with?locals_for_with.Twitch:typeof Twitch!=="undefined"?Twitch:undefined,"bttv" in locals_for_with?locals_for_with.bttv:typeof bttv!=="undefined"?bttv:undefined,"Date" in locals_for_with?locals_for_with.Date:typeof Date!=="undefined"?Date:undefined));;return buf.join("");
};module.exports=template;
},{"../vars":64}],61:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (storageKey, name, description) {
buf.push("<div" + (jade.cls(['option',"bttvOption-" + (storageKey) + ""], [null,true])) + "><span style=\"font-weight:bold;font-size:14px;color:#D3D3D3;\">" + (jade.escape(null == (jade_interp = name) ? "" : jade_interp)) + "</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;" + (jade.escape(null == (jade_interp = description) ? "" : jade_interp)) + "<div class=\"bttv-switch\"><input type=\"radio\"" + (jade.attr("name", storageKey, true, false)) + " value=\"false\"" + (jade.attr("id", "" + (storageKey) + "False", true, false)) + " class=\"bttv-switch-input bttv-switch-off\"/><label" + (jade.attr("for", "" + (storageKey) + "False", true, false)) + " class=\"bttv-switch-label bttv-switch-label-off\">Off</label><input type=\"radio\"" + (jade.attr("name", storageKey, true, false)) + " value=\"true\"" + (jade.attr("id", "" + (storageKey) + "True", true, false)) + " class=\"bttv-switch-input\"/><label" + (jade.attr("for", "" + (storageKey) + "True", true, false)) + " class=\"bttv-switch-label bttv-switch-label-on\">On</label><span class=\"bttv-switch-selection\"></span></div></div>");}.call(this,"storageKey" in locals_for_with?locals_for_with.storageKey:typeof storageKey!=="undefined"?storageKey:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"description" in locals_for_with?locals_for_with.description:typeof description!=="undefined"?description:undefined));;return buf.join("");
};module.exports=template;
},{}],62:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (bttv) {
buf.push("<div id=\"header\"><span id=\"logo\"><img height=\"45px\" src=\"https://cdn.betterttv.net/style/logos/settings_logo.png\"/></span><ul class=\"nav\"><li><a href=\"#bttvAbout\">About</a></li><li class=\"active\"><a href=\"#bttvSettings\">Settings</a></li><li><a href=\"#bttvChannel\" target=\"_blank\">Channel</a></li><li><a href=\"#bttvChangelog\">Changelog</a></li><li><a href=\"#bttvPrivacy\">Privacy Policy</a></li><li><a href=\"#bttvBackup\">Backup/Import</a></li></ul><span id=\"close\">&times;</span></div><div id=\"bttvSettings\" style=\"height:425px;\" class=\"scroll scroll-dark\"><div class=\"tse-content options-list\"><h2 class=\"option\">Here you can manage the various BetterTTV options. Click On or Off to toggle settings.</h2></div></div><div id=\"bttvAbout\" style=\"display:none;\"><div class=\"aboutHalf\"><img src=\"https://cdn.betterttv.net/style/logos/mascot.png\" class=\"bttvAboutIcon\"/><h1>BetterTTV v " + (jade.escape((jade_interp = bttv.info.versionString()) == null ? '' : jade_interp)) + "</h1><h2>from your friends at <a href=\"https://www.nightdev.com\" target=\"_blank\">NightDev</a></h2><br/></div><div class=\"aboutHalf\"><h1 style=\"margin-top: 100px;\">Think this addon is awesome?</h1><br/><br/><h2><a target=\"_blank\" href=\"https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped\">Drop a Review on the Chrome Webstore</a></h2><br/><h2>or maybe</h2><br/><h2><a target=\"_blank\" href=\"https://streamtip.com/t/night\">Support the Developer</a></h2><br/></div></div><div id=\"bttvChannel\" style=\"display:none;\"><iframe frameborder=\"0\" width=\"100%\" height=\"425\"></iframe></div><div id=\"bttvPrivacy\" style=\"display:none;height:425px;\" class=\"scroll scroll-dark\"><div class=\"tse-content\"></div></div><div id=\"bttvChangelog\" style=\"display:none;height:425px;\" class=\"scroll scroll-dark\"><div class=\"tse-content\"></div></div><div id=\"bttvBackup\" style=\"display:none;height:425px;padding:25px;\"><h1 style=\"padding-bottom:15px;\">Backup Settings</h1><button id=\"bttvBackupButton\" class=\"primary_button\"><span>Download</span></button><h1 style=\"padding-top:25px;padding-bottom:15px;\">Import Settings</h1><input id=\"bttvImportInput\" type=\"file\" style=\"height: 25px;width: 250px;\"/></div><div id=\"footer\"><span>BetterTTV &copy; <a href=\"https://www.nightdev.com\" target=\"_blank\">NightDev, LLC</a> 2015</span><span style=\"float:right;\"><a href=\"https://community.nightdev.com/c/betterttv\" target=\"_blank\">Get Support</a> | <a href=\"https://github.com/night/BetterTTV/issues/new?labels=bug\" target=\"_blank\">Report a Bug</a> | <a href=\"https://streamtip.com/t/night\" target=\"_blank\">Support the Developer</a></span></div>");}.call(this,"bttv" in locals_for_with?locals_for_with.bttv:typeof bttv!=="undefined"?bttv:undefined));;return buf.join("");
};module.exports=template;
},{}],63:[function(require,module,exports){
module.exports = {
    _ref: null,
    _headers: function(e, t) {
        e.setRequestHeader('Client-ID', '6x8avioex0zt85ht6py4sq55z6avsea');

        bttv.TwitchAPI._ref.call(Twitch.api, e, t);
    },
    _call: function(method, url, data, options) {
        // Replace Twitch's beforeSend with ours (to add Client ID)
        this._takeover();

        var callTwitchAPI = window.Twitch.api[method].call(this, url, data, options);

        // Replace Twitch's beforeSend back with theirs
        this._untakeover();

        return callTwitchAPI;
    },
    _takeover: function() {
        if (!window.Twitch.api._beforeSend) return;

        this._ref = window.Twitch.api._beforeSend;

        window.Twitch.api._beforeSend = this._headers;
    },
    _untakeover: function() {
        if (!this._ref) return;

        window.Twitch.api._beforeSend = this._ref;
        this._ref = null;
    },
    get: function(url, data, options) {
        return this._call('get', url, data, options);
    },
    post: function(url, data, options) {
        return this._call('post', url, data, options);
    },
    put: function(url, data, options) {
        return this._call('put', url, data, options);
    },
    del: function(url, data, options) {
        return this._call('del', url, data, options);
    }
};

},{}],64:[function(require,module,exports){
module.exports = {
    userData: {
        isLoggedIn: window.Twitch && Twitch.user ? Twitch.user.isLoggedIn() : false,
        login: window.Twitch && Twitch.user ? Twitch.user.login() : ''
    },
    settings: {},
    liveChannels: [],
    blackChat: false
};

},{}],65:[function(require,module,exports){
var debug = require('./helpers/debug');
var vars = require('./vars');

var events = {};

// The rare occasion we need to global message to people
events.alert = function(data) {
    if (data.type === 'chat') {
        bttv.chat.helpers.serverMessage(data.message);
    } else if (data.type === 'growl') {
        bttv.notify(data.message.text, data.message.title, data.message.url, data.message.image, data.message.tag, data.message.permanent);
    }
};

// Night's legacy subs
events.new_subscriber = function(data) {
    if (data.channel !== bttv.getChannel()) return;

    bttv.chat.helpers.notifyMessage('subscriber', bttv.chat.helpers.lookupDisplayName(data.user) + ' just subscribed!');
    bttv.chat.store.__subscriptions[data.user] = ['night'];
    bttv.chat.helpers.reparseMessages(data.user);
};

// Nightbot emits commercial warnings to mods
events.commercial = function(data) {
    if (data.channel !== bttv.getChannel()) return;
    if (!vars.userData.isLoggedIn || !bttv.chat.helpers.isModerator(vars.userData.login)) return;

    bttv.chat.helpers.notifyMessage('bot', data.message);
};

// Night's legacy subs
events.lookup_user = function(subscription) {
    if (!subscription.subscribed) return;

    bttv.chat.store.__subscriptions[subscription.name] = ['night'];
    if (subscription.glow) bttv.chat.store.__subscriptions[subscription.name].push('_glow');
    bttv.chat.helpers.reparseMessages(subscription.name);
};

function SocketClient() {
    this.socket = false;
    this._lookedUpUsers = [];
    this._connected = false;
    this._connectAttempts = 0;
    this._events = events;

    this.connect();
}

SocketClient.prototype.connect = function() {
    if (this._connected) return;

    debug.log('SocketClient: Connecting to Beta BetterTTV Socket Server');

    var _self = this;
    this.socket = new WebSocket('wss://sockets-beta.betterttv.net/ws');

    this.socket.onopen = function() {
        debug.log('SocketClient: Connected to Beta BetterTTV Socket Server');

        _self._connected = true;
        _self._connectAttempts = 0;
    };

    this.socket.onerror = function() {
        debug.log('SocketClient: Error from Beta BetterTTV Socket Server');

        _self._connectAttempts++;
        _self.reconnect();
    };

    this.socket.onclose = function() {
        if (!_self._connected || !_self.socket) return;

        debug.log('SocketClient: Disconnected from Beta BetterTTV Socket Server');

        _self._connectAttempts++;
        _self.reconnect();
    };

    this.socket.onmessage = function(message) {
        var evt;

        try {
            evt = JSON.parse(message.data);
        } catch(e) {
            debug.log('SocketClient: Error Parsing Message', e);
        }

        if (!evt || !(evt.name in _self._events)) return;

        debug.log('SocketClient: Received Event', evt);

        _self._events[evt.name](evt.data);
    };
};

SocketClient.prototype.reconnect = function() {
    var _self = this;

    if (this.socket) {
        try {
            this.socket.close();
        } catch(e) {}
    }

    delete this.socket;

    this._connected = false;

    setTimeout(function() {
        _self.connect();
    }, Math.random() * (Math.pow(2, this._connectAttempts) - 1) * 1000);
};

SocketClient.prototype.emit = function(evt, data) {
    if (!this._connected || !this.socket) return;

    this.socket.send(JSON.stringify({
        name: evt,
        data: data
    }));
};

// Night's legacy subs
SocketClient.prototype.lookupUser = function(name) {
    if (!this._connected) return;

    if (this._lookedUpUsers.indexOf(name) > -1) return;
    this._lookedUpUsers.push(name);

    this.emit('lookup_user', { name: name });
};

SocketClient.prototype.joinChannel = function() {
    if (!this._connected) return;

    if (!bttv.getChannel().length) return;

    this.emit('join_channel', { name: bttv.getChannel() });

    // Night's legacy subs
    if (bttv.getChannel() !== 'night') return;
    var element = document.createElement('style');
    element.type = 'text/css';
    element.innerHTML = '.badge.subscriber { background-image: url("https://cdn.betterttv.net/tags/supporter.png") !important; }';
    bttv.jQuery('.ember-chat .chat-room').append(element);
};

module.exports = SocketClient;

},{"./helpers/debug":46,"./vars":64}],66:[function(require,module,exports){
/*
 * Cookies.js - 1.2.1
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
(function (global, undefined) {
    'use strict';

    var factory = function (window) {
        if (typeof window.document !== 'object') {
            throw new Error('Cookies.js requires a `window` with a `document` object');
        }

        var Cookies = function (key, value, options) {
            return arguments.length === 1 ?
                Cookies.get(key) : Cookies.set(key, value, options);
        };

        // Allows for setter injection in unit tests
        Cookies._document = window.document;

        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)
        
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

        Cookies.defaults = {
            path: '/',
            secure: false
        };

        Cookies.get = function (key) {
            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                Cookies._renewCache();
            }

            return Cookies._cache[Cookies._cacheKeyPrefix + key];
        };

        Cookies.set = function (key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

            return Cookies;
        };

        Cookies.expire = function (key, options) {
            return Cookies.set(key, undefined, options);
        };

        Cookies._getExtendedOptions = function (options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
            };
        };

        Cookies._isValidDate = function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        };

        Cookies._getExpiresDate = function (expires, now) {
            now = now || new Date();

            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }

            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        };

        Cookies._generateCookieString = function (key, value, options) {
            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
            key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};

            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';

            return cookieString;
        };

        Cookies._getCacheFromString = function (documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieCache;
        };

        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            return {
                key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
                value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
            };
        };

        Cookies._renewCache = function () {
            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
            Cookies._cachedDocumentCookie = Cookies._document.cookie;
        };

        Cookies._areEnabled = function () {
            var testKey = 'cookies.js';
            var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
            Cookies.expire(testKey);
            return areEnabled;
        };

        Cookies.enabled = Cookies._areEnabled();

        return Cookies;
    };

    var cookiesExport = typeof global.document === 'object' ? factory(global) : factory;

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return cookiesExport; });
    // CommonJS/Node.js support
    } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
            exports = module.exports = cookiesExport;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport;
    } else {
        global.Cookies = cookiesExport;
    }
})(typeof window === 'undefined' ? this : window);
},{}],67:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],68:[function(require,module,exports){

module.exports = require('./lib/');

},{"./lib/":69}],69:[function(require,module,exports){

/**
 * Module dependencies.
 */

var url = require('./url');
var parser = require('socket.io-parser');
var Manager = require('./manager');
var debug = require('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup(uri, opts) {
  if (typeof uri == 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var io;

  if (opts.forceNew || opts['force new connection'] || false === opts.multiplex) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }

  return io.socket(parsed.path);
}

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = require('./manager');
exports.Socket = require('./socket');

},{"./manager":70,"./socket":72,"./url":73,"debug":77,"socket.io-parser":113}],70:[function(require,module,exports){

/**
 * Module dependencies.
 */

var url = require('./url');
var eio = require('engine.io-client');
var Socket = require('./socket');
var Emitter = require('component-emitter');
var parser = require('socket.io-parser');
var on = require('./on');
var bind = require('component-bind');
var object = require('object-component');
var debug = require('debug')('socket.io-client:manager');
var indexOf = require('indexof');
var Backoff = require('backo2');

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager(uri, opts){
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' == typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connected = [];
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function() {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function(){
  for (var nsp in this.nsps) {
    this.nsps[nsp].id = this.engine.id;
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function(v){
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function(v){
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function(v){
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function(v){
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function(v){
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function(v){
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function() {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};


/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function(fn){
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function() {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function(data){
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function(){
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function(){
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function(data){
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function(packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function(err){
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function(nsp){
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connect', function(){
      socket.id = self.engine.id;
      if (!~indexOf(self.connected, socket)) {
        self.connected.push(socket);
      }
    });
  }
  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function(socket){
  var index = indexOf(this.connected, socket);
  if (~index) this.connected.splice(index, 1);
  if (this.connected.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function(packet){
  debug('writing packet %j', packet);
  var self = this;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function(encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i]);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function() {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function(){
  var sub;
  while (sub = this.subs.shift()) sub.destroy();

  this.packetBuffer = [];
  this.encoding = false;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function(){
  this.skipReconnect = true;
  this.backoff.reset();
  this.readyState = 'closed';
  this.engine && this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function(reason){
  debug('close');
  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);
  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function(){
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function(){
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function(err){
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function(){
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

},{"./on":71,"./socket":72,"./url":73,"backo2":74,"component-bind":75,"component-emitter":76,"debug":77,"engine.io-client":78,"indexof":109,"object-component":110,"socket.io-parser":113}],71:[function(require,module,exports){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on(obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function(){
      obj.removeListener(ev, fn);
    }
  };
}

},{}],72:[function(require,module,exports){

/**
 * Module dependencies.
 */

var parser = require('socket.io-parser');
var Emitter = require('component-emitter');
var toArray = require('to-array');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:socket');
var hasBin = require('has-binary');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket(io, nsp){
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  if (this.io.autoConnect) this.open();
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function() {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function(){
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' == this.io.readyState) this.onopen();
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function(){
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function(ev){
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  // event ack callback
  if ('function' == typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function(packet){
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function(){
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' != this.nsp) {
    this.packet({ type: parser.CONNECT });
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function(reason){
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function(packet){
  if (packet.nsp != this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function(packet){
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function(id){
  var self = this;
  var sent = false;
  return function(){
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function(packet){
  debug('calling ack %s with %j', packet.id, packet.data);
  var fn = this.acks[packet.id];
  fn.apply(this, packet.data);
  delete this.acks[packet.id];
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function(){
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function(){
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function(){
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function(){
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function(){
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

},{"./on":71,"component-bind":75,"component-emitter":76,"debug":77,"has-binary":107,"socket.io-parser":113,"to-array":117}],73:[function(require,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = require('parseuri');
var debug = require('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url(uri, loc){
  var obj = uri;

  // default to window.location
  var loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' == typeof uri) {
    if ('/' == uri.charAt(0)) {
      if ('/' == uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.hostname + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' != typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    }
    else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  // define unique id
  obj.id = obj.protocol + '://' + obj.host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + obj.host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

  return obj;
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"debug":77,"parseuri":111}],74:[function(require,module,exports){

/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};


},{}],75:[function(require,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],76:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],77:[function(require,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},{}],78:[function(require,module,exports){

module.exports =  require('./lib/');

},{"./lib/":79}],79:[function(require,module,exports){

module.exports = require('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = require('engine.io-parser');

},{"./socket":80,"engine.io-parser":92}],80:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var transports = require('./transports');
var Emitter = require('component-emitter');
var debug = require('debug')('engine.io-client:socket');
var index = require('indexof');
var parser = require('engine.io-parser');
var parseuri = require('parseuri');
var parsejson = require('parsejson');
var parseqs = require('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Noop function.
 *
 * @api private
 */

function noop(){}

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts){
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.host = uri.host;
    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  }

  this.secure = null != opts.secure ? opts.secure :
    (global.location && 'https:' == location.protocol);

  if (opts.host) {
    var pieces = opts.host.split(':');
    opts.hostname = pieces.shift();
    if (pieces.length) {
      opts.port = pieces.pop();
    } else if (!opts.port) {
      // if no port is specified manually, use the protocol default
      opts.port = this.secure ? '443' : '80';
    }
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port ?
       location.port :
       (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.callbackBuffer = [];
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized || null;

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = require('./transport');
Socket.transports = require('./transports');
Socket.parser = require('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
    transport = 'websocket';
  } else if (0 == this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function() {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  var transport;
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function(transport){
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function(){
    self.onDrain();
  })
  .on('packet', function(packet){
    self.onPacket(packet);
  })
  .on('error', function(e){
    self.onError(e);
  })
  .on('close', function(){
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 })
    , failed = false
    , self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen(){
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' == msg.type && 'probe' == msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' == transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' == self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport() {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  //Handle any error that happens while probing
  function onerror(err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose(){
    onerror("transport closed");
  }

  //When the socket is closed while we're probing
  function onclose(){
    onerror("socket closed");
  }

  //When the socket is upgraded while we're probing
  function onupgrade(to){
    if (transport && to.name != transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  //Remove all listeners on the transport and on self
  function cleanup(){
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();

};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.emit('error', err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if  ('closed' == this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' == self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api public
*/

Socket.prototype.ping = function () {
  this.sendPacket('ping');
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function() {
  for (var i = 0; i < this.prevBufferLen; i++) {
    if (this.callbackBuffer[i]) {
      this.callbackBuffer[i]();
    }
  }

  this.writeBuffer.splice(0, this.prevBufferLen);
  this.callbackBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (this.writeBuffer.length == 0) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' != this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, fn) {
  this.sendPacket('message', msg, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, fn) {
  if ('closing' == this.readyState || 'closed' == this.readyState) {
    return;
  }

  var packet = { type: type, data: data };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  this.callbackBuffer.push(fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.readyState = 'closing';

    var self = this;

    function close() {
      self.onClose('forced close');
      debug('socket closing - telling transport to close');
      self.transport.close();
    }

    function cleanupAndClose() {
      self.removeListener('upgrade', cleanupAndClose);
      self.removeListener('upgradeError', cleanupAndClose);
      close();
    }

    function waitForUpgrade() {
      // wait for upgrade to finish since we can't send packets while pausing a transport
      self.once('upgrade', cleanupAndClose);
      self.once('upgradeError', cleanupAndClose);
    }

    if (this.writeBuffer.length) {
      this.once('drain', function() {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // clean buffers in next tick, so developers can still
    // grab the buffers on `close` event
    setTimeout(function() {
      self.writeBuffer = [];
      self.callbackBuffer = [];
      self.prevBufferLen = 0;
    }, 0);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i<j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./transport":81,"./transports":82,"component-emitter":76,"debug":89,"engine.io-parser":92,"indexof":109,"parsejson":103,"parseqs":104,"parseuri":105}],81:[function(require,module,exports){
/**
 * Module dependencies.
 */

var parser = require('engine.io-parser');
var Emitter = require('component-emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * A counter used to prevent collisions in the timestamps used
 * for cache busting.
 */

Transport.timestamps = 0;

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' == this.readyState || '' == this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function(packets){
  if ('open' == this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function(data){
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

},{"component-emitter":76,"engine.io-parser":92}],82:[function(require,module,exports){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = require('xmlhttprequest');
var XHR = require('./polling-xhr');
var JSONP = require('./polling-jsonp');
var websocket = require('./websocket');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling(opts){
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname != location.hostname || port != opts.port;
    xs = opts.secure != isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling-jsonp":83,"./polling-xhr":84,"./websocket":86,"xmlhttprequest":87}],83:[function(require,module,exports){
(function (global){

/**
 * Module requirements.
 */

var Polling = require('./polling');
var inherit = require('component-inherit');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Callbacks count.
 */

var index = 0;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function(e){
    self.onError('jsonp poll error',e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  insertAt.parentNode.insertBefore(script, insertAt);
  this.script = script;

  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
  
  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch(e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function(){
      if (self.iframe.readyState == 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":85,"component-inherit":88}],84:[function(require,module,exports){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = require('xmlhttprequest');
var Polling = require('./polling');
var Emitter = require('component-emitter');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty(){}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR(opts){
  Polling.call(this, opts);

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname != global.location.hostname ||
      port != opts.port;
    this.xs = opts.secure != isSSL;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function(opts){
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function(data, fn){
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function(err){
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function(){
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function(data){
    self.onData(data);
  });
  req.on('error', function(err){
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts){
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined != opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function(){
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' == this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.hasXDR()) {
      xhr.onload = function(){
        self.onLoad();
      };
      xhr.onerror = function(){
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function(){
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function(){
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function() {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(fromError){
  if ('undefined' == typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch(e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function(){
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        data = 'ok';
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function(){
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

if (global.document) {
  Request.requestsCount = 0;
  Request.requests = {};
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler() {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":85,"component-emitter":76,"component-inherit":88,"debug":89,"xmlhttprequest":87}],85:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parseqs = require('parseqs');
var parser = require('engine.io-parser');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function() {
  var XMLHttpRequest = require('xmlhttprequest');
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function(){
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function(onPause){
  var pending = 0;
  var self = this;

  this.readyState = 'pausing';

  function pause(){
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function(){
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function(){
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function(){
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function(data){
  var self = this;
  debug('polling got data %s', data);
  var callback = function(packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' == self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' == packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' != this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' == this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function(){
  var self = this;

  function close(){
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' == this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  var callbackfn = function() {
    self.writable = true;
    self.emit('drain');
  };

  var self = this;
  parser.encodePayload(packets, this.supportsBinary, function(data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = +new Date + '-' + Transport.timestamps++;
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' == schema && this.port != 443) ||
     ('http' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

},{"../transport":81,"component-inherit":88,"debug":89,"engine.io-parser":92,"parseqs":104,"xmlhttprequest":87}],86:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parser = require('engine.io-parser');
var parseqs = require('parseqs');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:websocket');

/**
 * `ws` exposes a WebSocket-compatible interface in
 * Node, or the `WebSocket` or `MozWebSocket` globals
 * in the browser.
 */

var WebSocket = require('ws');

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function(){
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var self = this;
  var uri = this.uri();
  var protocols = void(0);
  var opts = { agent: this.agent };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  this.ws = new WebSocket(uri, protocols, opts);

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  this.ws.binaryType = 'arraybuffer';
  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function(){
  var self = this;

  this.ws.onopen = function(){
    self.onOpen();
  };
  this.ws.onclose = function(){
    self.onClose();
  };
  this.ws.onmessage = function(ev){
    self.onData(ev.data);
  };
  this.ws.onerror = function(e){
    self.onError('websocket error', e);
  };
};

/**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */

if ('undefined' != typeof navigator
  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  WS.prototype.onData = function(data){
    var self = this;
    setTimeout(function(){
      Transport.prototype.onData.call(self, data);
    }, 0);
  };
}

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  for (var i = 0, l = packets.length; i < l; i++) {
    parser.encodePacket(packets[i], this.supportsBinary, function(data) {
      //Sometimes the websocket has already been closed but the browser didn't
      //have a chance of informing us about it yet, in that case send will
      //throw an error
      try {
        self.ws.send(data);
      } catch (e){
        debug('websocket closed before onclose event');
      }
    });
  }

  function ondrain() {
    self.writable = true;
    self.emit('drain');
  }
  // fake drain
  // defer to next tick to allow Socket to clear writeBuffer
  setTimeout(ondrain, 0);
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function(){
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function(){
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' == schema && this.port != 443)
    || ('ws' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = +new Date;
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function(){
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

},{"../transport":81,"component-inherit":88,"debug":89,"engine.io-parser":92,"parseqs":104,"ws":106}],87:[function(require,module,exports){
// browser shim for xmlhttprequest module
var hasCORS = require('has-cors');

module.exports = function(opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch(e) { }
  }
}

},{"has-cors":101}],88:[function(require,module,exports){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},{}],89:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // This hackery is required for IE8,
  // where the `console.log` function doesn't have 'apply'
  return 'object' == typeof console
    && 'function' == typeof console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      localStorage.removeItem('debug');
    } else {
      localStorage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = localStorage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":90}],90:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":91}],91:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],92:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var keys = require('./keys');
var hasBinary = require('has-binary');
var sliceBuffer = require('arraybuffer.slice');
var base64encoder = require('base64-arraybuffer');
var after = require('after');
var utf8 = require('utf8');

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = navigator.userAgent.match(/Android/i);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = require('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  // String data
  if (typeof data == 'string' || data === undefined) {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      try {
        data = utf8.decode(data);
      } catch (e) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!global.ArrayBuffer) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./keys":93,"after":94,"arraybuffer.slice":95,"base64-arraybuffer":96,"blob":97,"has-binary":98,"utf8":100}],93:[function(require,module,exports){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

},{}],94:[function(require,module,exports){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

},{}],95:[function(require,module,exports){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

},{}],96:[function(require,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(chars){
  "use strict";

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = chars.indexOf(base64[i]);
      encoded2 = chars.indexOf(base64[i+1]);
      encoded3 = chars.indexOf(base64[i+2]);
      encoded4 = chars.indexOf(base64[i+3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

},{}],97:[function(require,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var b = new Blob(['hi']);
    return b.size == 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }
  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

module.exports = (function() {
  if (blobSupported) {
    return global.Blob;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],98:[function(require,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = require('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      if (obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":99}],99:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],100:[function(require,module,exports){
(function (global){
/*! http://mths.be/utf8js v2.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from http://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from http://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function utf8encode(string) {
		var codePoints = ucs2decode(string);

		// console.log(JSON.stringify(codePoints.map(function(x) {
		// 	return 'U+' + x.toString(16).toUpperCase();
		// })));

		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var utf8 = {
		'version': '2.0.0',
		'encode': utf8encode,
		'decode': utf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return utf8;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = utf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in utf8) {
				hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.utf8 = utf8;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],101:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = require('global');

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = 'XMLHttpRequest' in global &&
    'withCredentials' in new global.XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{"global":102}],102:[function(require,module,exports){

/**
 * Returns `this`. Execute this without a "context" (i.e. without it being
 * attached to an object of the left-hand side), and `this` points to the
 * "global" scope of the current JS execution.
 */

module.exports = (function () { return this; })();

},{}],103:[function(require,module,exports){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],104:[function(require,module,exports){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

},{}],105:[function(require,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

},{}],106:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}],107:[function(require,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = require('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      if (obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":108}],108:[function(require,module,exports){
module.exports=require(99)
},{}],109:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],110:[function(require,module,exports){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
},{}],111:[function(require,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host'
  , 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
  var m = re.exec(str || '')
    , uri = {}
    , i = 14;

  while (i--) {
    uri[parts[i]] = m[i] || '';
  }

  return uri;
};

},{}],112:[function(require,module,exports){
(function (global){
/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = require('isarray');
var isBuf = require('./is-buffer');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-buffer":114,"isarray":115}],113:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('socket.io-parser');
var json = require('json3');
var isArray = require('isarray');
var Emitter = require('component-emitter');
var binary = require('./binary');
var isBuf = require('./is-buffer');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'BINARY_EVENT',
  'ACK',
  'BINARY_ACK',
  'ERROR'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    var buf = '';
    while (str.charAt(++i) != '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) != '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    try {
      p.data = json.parse(str.substr(i));
    } catch(e){
      return error();
    }
  }

  debug('decoded %s as %j', str, p);
  return p;
}

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

},{"./binary":112,"./is-buffer":114,"component-emitter":76,"debug":77,"isarray":115,"json3":116}],114:[function(require,module,exports){
(function (global){

module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],115:[function(require,module,exports){
module.exports=require(99)
},{}],116:[function(require,module,exports){
/*! JSON v3.2.6 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
;(function (window) {
  // Convenience aliases.
  var getClass = {}.toString, isProperty, forEach, undef;

  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // Detect native implementations.
  var nativeJSON = typeof JSON == "object" && JSON;

  // Set up the JSON 3 namespace, preferring the CommonJS `exports` object if
  // available.
  var JSON3 = typeof exports == "object" && exports && !exports.nodeType && exports;

  if (JSON3 && nativeJSON) {
    // Explicitly delegate to the native `stringify` and `parse`
    // implementations in CommonJS environments.
    JSON3.stringify = nativeJSON.stringify;
    JSON3.parse = nativeJSON.parse;
  } else {
    // Export for web browsers, JavaScript engines, and asynchronous module
    // loaders, using the global `JSON` object if available.
    JSON3 = window.JSON = nativeJSON || {};
  }

  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var isExtended = new Date(-3509827334573292);
  try {
    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
      // Safari < 2.0.2 stores the internal millisecond time value correctly,
      // but clips the values returned by the date methods to the range of
      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
      isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
  } catch (exception) {}

  // Internal: Determines whether the native `JSON.stringify` and `parse`
  // implementations are spec-compliant. Based on work by Ken Snyder.
  function has(name) {
    if (has[name] !== undef) {
      // Return cached feature test result.
      return has[name];
    }

    var isSupported;
    if (name == "bug-string-char-index") {
      // IE <= 7 doesn't support accessing string characters using square
      // bracket notation. IE 8 only supports this for primitives.
      isSupported = "a"[0] != "a";
    } else if (name == "json") {
      // Indicates whether both `JSON.stringify` and `JSON.parse` are
      // supported.
      isSupported = has("json-stringify") && has("json-parse");
    } else {
      var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
      // Test `JSON.stringify`.
      if (name == "json-stringify") {
        var stringify = JSON3.stringify, stringifySupported = typeof stringify == "function" && isExtended;
        if (stringifySupported) {
          // A test function object with a custom `toJSON` method.
          (value = function () {
            return 1;
          }).toJSON = value;
          try {
            stringifySupported =
              // Firefox 3.1b1 and b2 serialize string, number, and boolean
              // primitives as object literals.
              stringify(0) === "0" &&
              // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
              // literals.
              stringify(new Number()) === "0" &&
              stringify(new String()) == '""' &&
              // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
              // does not define a canonical JSON representation (this applies to
              // objects with `toJSON` properties as well, *unless* they are nested
              // within an object or array).
              stringify(getClass) === undef &&
              // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
              // FF 3.1b3 pass this test.
              stringify(undef) === undef &&
              // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
              // respectively, if the value is omitted entirely.
              stringify() === undef &&
              // FF 3.1b1, 2 throw an error if the given value is not a number,
              // string, array, object, Boolean, or `null` literal. This applies to
              // objects with custom `toJSON` methods as well, unless they are nested
              // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
              // methods entirely.
              stringify(value) === "1" &&
              stringify([value]) == "[1]" &&
              // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
              // `"[null]"`.
              stringify([undef]) == "[null]" &&
              // YUI 3.0.0b1 fails to serialize `null` literals.
              stringify(null) == "null" &&
              // FF 3.1b1, 2 halts serialization if an array contains a function:
              // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
              // elides non-JSON values from objects and arrays, unless they
              // define custom `toJSON` methods.
              stringify([undef, getClass, null]) == "[null,null,null]" &&
              // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
              // where character escape codes are expected (e.g., `\b` => `\u0008`).
              stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
              // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
              stringify(null, value) === "1" &&
              stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          } catch (exception) {
            stringifySupported = false;
          }
        }
        isSupported = stringifySupported;
      }
      // Test `JSON.parse`.
      if (name == "json-parse") {
        var parse = JSON3.parse;
        if (typeof parse == "function") {
          try {
            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
            // Conforming implementations should also coerce the initial argument to
            // a string prior to parsing.
            if (parse("0") === 0 && !parse(false)) {
              // Simple parsing test.
              value = parse(serialized);
              var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
              if (parseSupported) {
                try {
                  // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                  parseSupported = !parse('"\t"');
                } catch (exception) {}
                if (parseSupported) {
                  try {
                    // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                    // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                    // certain octal literals.
                    parseSupported = parse("01") !== 1;
                  } catch (exception) {}
                }
                if (parseSupported) {
                  try {
                    // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                    // points. These environments, along with FF 3.1b1 and 2,
                    // also allow trailing commas in JSON objects and arrays.
                    parseSupported = parse("1.") !== 1;
                  } catch (exception) {}
                }
              }
            }
          } catch (exception) {
            parseSupported = false;
          }
        }
        isSupported = parseSupported;
      }
    }
    return has[name] = !!isSupported;
  }

  if (!has("json")) {
    // Common `[[Class]]` name aliases.
    var functionClass = "[object Function]";
    var dateClass = "[object Date]";
    var numberClass = "[object Number]";
    var stringClass = "[object String]";
    var arrayClass = "[object Array]";
    var booleanClass = "[object Boolean]";

    // Detect incomplete support for accessing string characters by index.
    var charIndexBuggy = has("bug-string-char-index");

    // Define additional utility methods if the `Date` methods are buggy.
    if (!isExtended) {
      var floor = Math.floor;
      // A mapping between the months of the year and the number of days between
      // January 1st and the first of the respective month.
      var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      // Internal: Calculates the number of days between the Unix epoch and the
      // first day of the given month.
      var getDay = function (year, month) {
        return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
      };
    }

    // Internal: Determines if a property is a direct property of the given
    // object. Delegates to the native `Object#hasOwnProperty` method.
    if (!(isProperty = {}.hasOwnProperty)) {
      isProperty = function (property) {
        var members = {}, constructor;
        if ((members.__proto__ = null, members.__proto__ = {
          // The *proto* property cannot be set multiple times in recent
          // versions of Firefox and SeaMonkey.
          "toString": 1
        }, members).toString != getClass) {
          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
          // supports the mutable *proto* property.
          isProperty = function (property) {
            // Capture and break the object's prototype chain (see section 8.6.2
            // of the ES 5.1 spec). The parenthesized expression prevents an
            // unsafe transformation by the Closure Compiler.
            var original = this.__proto__, result = property in (this.__proto__ = null, this);
            // Restore the original prototype chain.
            this.__proto__ = original;
            return result;
          };
        } else {
          // Capture a reference to the top-level `Object` constructor.
          constructor = members.constructor;
          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
          // other environments.
          isProperty = function (property) {
            var parent = (this.constructor || constructor).prototype;
            return property in this && !(property in parent && this[property] === parent[property]);
          };
        }
        members = null;
        return isProperty.call(this, property);
      };
    }

    // Internal: A set of primitive types used by `isHostType`.
    var PrimitiveTypes = {
      'boolean': 1,
      'number': 1,
      'string': 1,
      'undefined': 1
    };

    // Internal: Determines if the given object `property` value is a
    // non-primitive.
    var isHostType = function (object, property) {
      var type = typeof object[property];
      return type == 'object' ? !!object[property] : !PrimitiveTypes[type];
    };

    // Internal: Normalizes the `for...in` iteration algorithm across
    // environments. Each enumerated key is yielded to a `callback` function.
    forEach = function (object, callback) {
      var size = 0, Properties, members, property;

      // Tests for bugs in the current environment's `for...in` algorithm. The
      // `valueOf` property inherits the non-enumerable flag from
      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
      (Properties = function () {
        this.valueOf = 0;
      }).prototype.valueOf = 0;

      // Iterate over a new instance of the `Properties` class.
      members = new Properties();
      for (property in members) {
        // Ignore all properties inherited from `Object.prototype`.
        if (isProperty.call(members, property)) {
          size++;
        }
      }
      Properties = members = null;

      // Normalize the iteration algorithm.
      if (!size) {
        // A list of non-enumerable properties inherited from `Object.prototype`.
        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
        // properties.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, length;
          var hasProperty = !isFunction && typeof object.constructor != 'function' && isHostType(object, 'hasOwnProperty') ? object.hasOwnProperty : isProperty;
          for (property in object) {
            // Gecko <= 1.0 enumerates the `prototype` property of functions under
            // certain conditions; IE does not.
            if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
              callback(property);
            }
          }
          // Manually invoke the callback for each non-enumerable property.
          for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
        };
      } else if (size == 2) {
        // Safari <= 2.0.4 enumerates shadowed properties twice.
        forEach = function (object, callback) {
          // Create a set of iterated properties.
          var members = {}, isFunction = getClass.call(object) == functionClass, property;
          for (property in object) {
            // Store each property name to prevent double enumeration. The
            // `prototype` property of functions is not enumerated due to cross-
            // environment inconsistencies.
            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
              callback(property);
            }
          }
        };
      } else {
        // No bugs detected; use the standard `for...in` algorithm.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, isConstructor;
          for (property in object) {
            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
              callback(property);
            }
          }
          // Manually invoke the callback for the `constructor` property due to
          // cross-environment inconsistencies.
          if (isConstructor || isProperty.call(object, (property = "constructor"))) {
            callback(property);
          }
        };
      }
      return forEach(object, callback);
    };

    // Public: Serializes a JavaScript `value` as a JSON string. The optional
    // `filter` argument may specify either a function that alters how object and
    // array members are serialized, or an array of strings and numbers that
    // indicates which properties should be serialized. The optional `width`
    // argument may be either a string or number that specifies the indentation
    // level of the output.
    if (!has("json-stringify")) {
      // Internal: A map of control characters and their escaped equivalents.
      var Escapes = {
        92: "\\\\",
        34: '\\"',
        8: "\\b",
        12: "\\f",
        10: "\\n",
        13: "\\r",
        9: "\\t"
      };

      // Internal: Converts `value` into a zero-padded string such that its
      // length is at least equal to `width`. The `width` must be <= 6.
      var leadingZeroes = "000000";
      var toPaddedString = function (width, value) {
        // The `|| 0` expression is necessary to work around a bug in
        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
        return (leadingZeroes + (value || 0)).slice(-width);
      };

      // Internal: Double-quotes a string `value`, replacing all ASCII control
      // characters (characters with code unit values between 0 and 31) with
      // their escaped equivalents. This is an implementation of the
      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
      var unicodePrefix = "\\u00";
      var quote = function (value) {
        var result = '"', index = 0, length = value.length, isLarge = length > 10 && charIndexBuggy, symbols;
        if (isLarge) {
          symbols = value.split("");
        }
        for (; index < length; index++) {
          var charCode = value.charCodeAt(index);
          // If the character is a control character, append its Unicode or
          // shorthand escape sequence; otherwise, append the character as-is.
          switch (charCode) {
            case 8: case 9: case 10: case 12: case 13: case 34: case 92:
              result += Escapes[charCode];
              break;
            default:
              if (charCode < 32) {
                result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                break;
              }
              result += isLarge ? symbols[index] : charIndexBuggy ? value.charAt(index) : value[index];
          }
        }
        return result + '"';
      };

      // Internal: Recursively serializes an object. Implements the
      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
      var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
        var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
        try {
          // Necessary for host object support.
          value = object[property];
        } catch (exception) {}
        if (typeof value == "object" && value) {
          className = getClass.call(value);
          if (className == dateClass && !isProperty.call(value, "toJSON")) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              if (getDay) {
                // Manually compute the year, month, date, hours, minutes,
                // seconds, and milliseconds if the `getUTC*` methods are
                // buggy. Adapted from @Yaffle's `date-shim` project.
                date = floor(value / 864e5);
                for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                date = 1 + date - getDay(year, month);
                // The `time` value specifies the time within the day (see ES
                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                // to compute `A modulo B`, as the `%` operator does not
                // correspond to the `modulo` operation for negative numbers.
                time = (value % 864e5 + 864e5) % 864e5;
                // The hours, minutes, seconds, and milliseconds are obtained by
                // decomposing the time within the day. See section 15.9.1.10.
                hours = floor(time / 36e5) % 24;
                minutes = floor(time / 6e4) % 60;
                seconds = floor(time / 1e3) % 60;
                milliseconds = time % 1e3;
              } else {
                year = value.getUTCFullYear();
                month = value.getUTCMonth();
                date = value.getUTCDate();
                hours = value.getUTCHours();
                minutes = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                milliseconds = value.getUTCMilliseconds();
              }
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                // Months, dates, hours, minutes, and seconds should have two
                // digits; milliseconds should have three.
                "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                // Milliseconds are optional in ES 5.0, but required in 5.1.
                "." + toPaddedString(3, milliseconds) + "Z";
            } else {
              value = null;
            }
          } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
            // ignores all `toJSON` methods on these objects unless they are
            // defined directly on an instance.
            value = value.toJSON(property);
          }
        }
        if (callback) {
          // If a replacement function was provided, call it to obtain the value
          // for serialization.
          value = callback.call(object, property, value);
        }
        if (value === null) {
          return "null";
        }
        className = getClass.call(value);
        if (className == booleanClass) {
          // Booleans are represented literally.
          return "" + value;
        } else if (className == numberClass) {
          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
          // `"null"`.
          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
        } else if (className == stringClass) {
          // Strings are double-quoted and escaped.
          return quote("" + value);
        }
        // Recursively serialize objects and arrays.
        if (typeof value == "object") {
          // Check for cyclic structures. This is a linear search; performance
          // is inversely proportional to the number of unique nested objects.
          for (length = stack.length; length--;) {
            if (stack[length] === value) {
              // Cyclic structures cannot be serialized by `JSON.stringify`.
              throw TypeError();
            }
          }
          // Add the object to the stack of traversed objects.
          stack.push(value);
          results = [];
          // Save the current indentation level and indent one additional level.
          prefix = indentation;
          indentation += whitespace;
          if (className == arrayClass) {
            // Recursively serialize array elements.
            for (index = 0, length = value.length; index < length; index++) {
              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
              results.push(element === undef ? "null" : element);
            }
            result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
          } else {
            // Recursively serialize object members. Members are selected from
            // either a user-specified list of property names, or the object
            // itself.
            forEach(properties || value, function (property) {
              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
              if (element !== undef) {
                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                // is not the empty string, let `member` {quote(property) + ":"}
                // be the concatenation of `member` and the `space` character."
                // The "`space` character" refers to the literal space
                // character, not the `space` {width} argument provided to
                // `JSON.stringify`.
                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
              }
            });
            result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
          }
          // Remove the object from the traversed object stack.
          stack.pop();
          return result;
        }
      };

      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
      JSON3.stringify = function (source, filter, width) {
        var whitespace, callback, properties, className;
        if (typeof filter == "function" || typeof filter == "object" && filter) {
          if ((className = getClass.call(filter)) == functionClass) {
            callback = filter;
          } else if (className == arrayClass) {
            // Convert the property names array into a makeshift set.
            properties = {};
            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
          }
        }
        if (width) {
          if ((className = getClass.call(width)) == numberClass) {
            // Convert the `width` to an integer and create a string containing
            // `width` number of space characters.
            if ((width -= width % 1) > 0) {
              for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
            }
          } else if (className == stringClass) {
            whitespace = width.length <= 10 ? width : width.slice(0, 10);
          }
        }
        // Opera <= 7.54u2 discards the values associated with empty string keys
        // (`""`) only if they are used directly within an object member list
        // (e.g., `!("" in { "": 1})`).
        return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
      };
    }

    // Public: Parses a JSON source string.
    if (!has("json-parse")) {
      var fromCharCode = String.fromCharCode;

      // Internal: A map of escaped control characters and their unescaped
      // equivalents.
      var Unescapes = {
        92: "\\",
        34: '"',
        47: "/",
        98: "\b",
        116: "\t",
        110: "\n",
        102: "\f",
        114: "\r"
      };

      // Internal: Stores the parser state.
      var Index, Source;

      // Internal: Resets the parser state and throws a `SyntaxError`.
      var abort = function() {
        Index = Source = null;
        throw SyntaxError();
      };

      // Internal: Returns the next token, or `"$"` if the parser has reached
      // the end of the source string. A token may be a string, number, `null`
      // literal, or Boolean literal.
      var lex = function () {
        var source = Source, length = source.length, value, begin, position, isSigned, charCode;
        while (Index < length) {
          charCode = source.charCodeAt(Index);
          switch (charCode) {
            case 9: case 10: case 13: case 32:
              // Skip whitespace tokens, including tabs, carriage returns, line
              // feeds, and space characters.
              Index++;
              break;
            case 123: case 125: case 91: case 93: case 58: case 44:
              // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
              // the current position.
              value = charIndexBuggy ? source.charAt(Index) : source[Index];
              Index++;
              return value;
            case 34:
              // `"` delimits a JSON string; advance to the next character and
              // begin parsing the string. String tokens are prefixed with the
              // sentinel `@` character to distinguish them from punctuators and
              // end-of-string tokens.
              for (value = "@", Index++; Index < length;) {
                charCode = source.charCodeAt(Index);
                if (charCode < 32) {
                  // Unescaped ASCII control characters (those with a code unit
                  // less than the space character) are not permitted.
                  abort();
                } else if (charCode == 92) {
                  // A reverse solidus (`\`) marks the beginning of an escaped
                  // control character (including `"`, `\`, and `/`) or Unicode
                  // escape sequence.
                  charCode = source.charCodeAt(++Index);
                  switch (charCode) {
                    case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                      // Revive escaped control characters.
                      value += Unescapes[charCode];
                      Index++;
                      break;
                    case 117:
                      // `\u` marks the beginning of a Unicode escape sequence.
                      // Advance to the first character and validate the
                      // four-digit code point.
                      begin = ++Index;
                      for (position = Index + 4; Index < position; Index++) {
                        charCode = source.charCodeAt(Index);
                        // A valid sequence comprises four hexdigits (case-
                        // insensitive) that form a single hexadecimal value.
                        if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                          // Invalid Unicode escape sequence.
                          abort();
                        }
                      }
                      // Revive the escaped character.
                      value += fromCharCode("0x" + source.slice(begin, Index));
                      break;
                    default:
                      // Invalid escape sequence.
                      abort();
                  }
                } else {
                  if (charCode == 34) {
                    // An unescaped double-quote character marks the end of the
                    // string.
                    break;
                  }
                  charCode = source.charCodeAt(Index);
                  begin = Index;
                  // Optimize for the common case where a string is valid.
                  while (charCode >= 32 && charCode != 92 && charCode != 34) {
                    charCode = source.charCodeAt(++Index);
                  }
                  // Append the string as-is.
                  value += source.slice(begin, Index);
                }
              }
              if (source.charCodeAt(Index) == 34) {
                // Advance to the next character and return the revived string.
                Index++;
                return value;
              }
              // Unterminated string.
              abort();
            default:
              // Parse numbers and literals.
              begin = Index;
              // Advance past the negative sign, if one is specified.
              if (charCode == 45) {
                isSigned = true;
                charCode = source.charCodeAt(++Index);
              }
              // Parse an integer or floating-point value.
              if (charCode >= 48 && charCode <= 57) {
                // Leading zeroes are interpreted as octal literals.
                if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                  // Illegal octal literal.
                  abort();
                }
                isSigned = false;
                // Parse the integer component.
                for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                // Floats cannot contain a leading decimal point; however, this
                // case is already accounted for by the parser.
                if (source.charCodeAt(Index) == 46) {
                  position = ++Index;
                  // Parse the decimal component.
                  for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal trailing decimal.
                    abort();
                  }
                  Index = position;
                }
                // Parse exponents. The `e` denoting the exponent is
                // case-insensitive.
                charCode = source.charCodeAt(Index);
                if (charCode == 101 || charCode == 69) {
                  charCode = source.charCodeAt(++Index);
                  // Skip past the sign following the exponent, if one is
                  // specified.
                  if (charCode == 43 || charCode == 45) {
                    Index++;
                  }
                  // Parse the exponential component.
                  for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal empty exponent.
                    abort();
                  }
                  Index = position;
                }
                // Coerce the parsed value to a JavaScript number.
                return +source.slice(begin, Index);
              }
              // A negative sign may only precede numbers.
              if (isSigned) {
                abort();
              }
              // `true`, `false`, and `null` literals.
              if (source.slice(Index, Index + 4) == "true") {
                Index += 4;
                return true;
              } else if (source.slice(Index, Index + 5) == "false") {
                Index += 5;
                return false;
              } else if (source.slice(Index, Index + 4) == "null") {
                Index += 4;
                return null;
              }
              // Unrecognized token.
              abort();
          }
        }
        // Return the sentinel `$` character if the parser has reached the end
        // of the source string.
        return "$";
      };

      // Internal: Parses a JSON `value` token.
      var get = function (value) {
        var results, hasMembers;
        if (value == "$") {
          // Unexpected end of input.
          abort();
        }
        if (typeof value == "string") {
          if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
            // Remove the sentinel `@` character.
            return value.slice(1);
          }
          // Parse object and array literals.
          if (value == "[") {
            // Parses a JSON array, returning a new JavaScript array.
            results = [];
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing square bracket marks the end of the array literal.
              if (value == "]") {
                break;
              }
              // If the array literal contains elements, the current token
              // should be a comma separating the previous element from the
              // next.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "]") {
                    // Unexpected trailing `,` in array literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each array element.
                  abort();
                }
              }
              // Elisions and leading commas are not permitted.
              if (value == ",") {
                abort();
              }
              results.push(get(value));
            }
            return results;
          } else if (value == "{") {
            // Parses a JSON object, returning a new JavaScript object.
            results = {};
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing curly brace marks the end of the object literal.
              if (value == "}") {
                break;
              }
              // If the object literal contains members, the current token
              // should be a comma separator.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "}") {
                    // Unexpected trailing `,` in object literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each object member.
                  abort();
                }
              }
              // Leading commas are not permitted, object property names must be
              // double-quoted strings, and a `:` must separate each property
              // name and value.
              if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                abort();
              }
              results[value.slice(1)] = get(lex());
            }
            return results;
          }
          // Unexpected token encountered.
          abort();
        }
        return value;
      };

      // Internal: Updates a traversed object member.
      var update = function(source, property, callback) {
        var element = walk(source, property, callback);
        if (element === undef) {
          delete source[property];
        } else {
          source[property] = element;
        }
      };

      // Internal: Recursively traverses a parsed JSON object, invoking the
      // `callback` function for each value. This is an implementation of the
      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
      var walk = function (source, property, callback) {
        var value = source[property], length;
        if (typeof value == "object" && value) {
          // `forEach` can't be used to traverse an array in Opera <= 8.54
          // because its `Object#hasOwnProperty` implementation returns `false`
          // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
          if (getClass.call(value) == arrayClass) {
            for (length = value.length; length--;) {
              update(value, length, callback);
            }
          } else {
            forEach(value, function (property) {
              update(value, property, callback);
            });
          }
        }
        return callback.call(source, property, value);
      };

      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
      JSON3.parse = function (source, callback) {
        var result, value;
        Index = 0;
        Source = "" + source;
        result = get(lex());
        // If a JSON string contains multiple tokens, it is invalid.
        if (lex() != "$") {
          abort();
        }
        // Reset the parser state.
        Index = Source = null;
        return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
      };
    }
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}(this));

},{}],117:[function(require,module,exports){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

},{}]},{},[12])}(window.BetterTTV = window.BetterTTV || {}));