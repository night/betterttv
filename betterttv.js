/** @license
 * Copyright (c) 2016 NightDev, LLC
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
    var proEmotes = store.proEmotes[vars.userData.name];
    var emotes = $.extend({}, store.bttvEmotes, proEmotes);
    var usableEmotes = [];
    var emoteSets;

    if (vars.userData.isLoggedIn && bttv.chat.helpers.getEmotes(vars.userData.name)) {
        emoteSets = helpers.getEmotes(vars.userData.name);
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

        usableEmotes.push({
            text: emote.code,
            channel: 'BetterTTV ' + emote.type.capitalize() + ' Emotes',
            badge: 'https://cdn.betterttv.net/tags/developer.png',
            url: emote.url
        });
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
    pinnedHighlights = require('../features/pinned-highlights'),
    embeddedPolling = require('../features/embedded-polling'),
    channelState = require('../features/channel-state'),
    audibleFeedback = require('../features/audible-feedback');

// Helper Functions
var getRgb = require('../helpers/colors').getRgb;

var secondsToLength = function(s) {
    var days = Math.floor(s / 86400);
    var hours = Math.floor(s / 3600) - (days * 24);
    var minutes = Math.floor(s / 60) - (days * 1440) - (hours * 60);
    var seconds = s - (days * 86400) - (hours * 3600) - (minutes * 60);

    return (days > 0 ? days + ' day' + (days === 1 ? '' : 's') + ', ' : '') +
           (hours > 0 ? hours + ' hour' + (hours === 1 ? '' : 's') + ', ' : '') +
           (minutes > 0 ? minutes + ' minute' + (minutes === 1 ? '' : 's') + ', ' : '') +
           seconds + ' second' + (seconds === 1 ? '' : 's');
};

exports.commands = function(input) {
    var sentence = input.trim().split(' ');
    var command = sentence[0].toLowerCase();
    var oldSetting;

    if (command === '/b') {
        helpers.ban(sentence[1]);
    } else if (command === '/chatters') {
        $.getJSON('https://tmi.twitch.tv/group/user/' + bttv.getChannel() + '?callback=?').done(function(resp) {
            helpers.serverMessage('Current Chatters: ' + Twitch.display.commatize(resp.data.chatter_count), true);
        }).fail(function() {
            helpers.serverMessage('Could not fetch chatter count.', true);
        });
    } else if (command === '/followers') {
        bttv.TwitchAPI.get('channels/' + bttv.getChannel() + '/follows').done(function(channel) {
            helpers.serverMessage('Current Followers: ' + Twitch.display.commatize(channel._total), true);
        }).fail(function() {
            helpers.serverMessage('Could not fetch follower count.', true);
        });
    } else if (command === '/join') {
        oldSetting = bttv.settings.get('anonChat');
        bttv.settings.save('anonChat', false);
        bttv.settings.set('anonChat', oldSetting);
    } else if (command === '/linehistory') {
        bttv.settings.save('chatLineHistory', sentence[1] === 'off' ? false : true);
    } else if (command === '/localascii') {
        helpers.serverMessage('Local ascii-only mode enabled.', true);
        vars.localAsciiOnly = true;
    } else if (command === '/localasciioff') {
        helpers.serverMessage('Local ascii-only mode disabled.', true);
        vars.localAsciiOnly = false;
    } else if (command === '/localmod') {
        helpers.serverMessage('Local moderators-only mode enabled.', true);
        vars.localModsOnly = true;
    } else if (command === '/localmodoff') {
        helpers.serverMessage('Local moderators-only mode disabled.', true);
        vars.localModsOnly = false;
    } else if (command === '/localsub') {
        helpers.serverMessage('Local subscribers-only mode enabled.', true);
        vars.localSubsOnly = true;
    } else if (command === '/localsuboff') {
        helpers.serverMessage('Local subscribers-only mode disabled.', true);
        vars.localSubsOnly = false;
    } else if (command === '/massunban' || ((command === '/unban' || command === '/u') && sentence[1] === 'all')) {
        helpers.massUnban();
    } else if (command === '/p' || command === '/purge') {
        helpers.timeout(sentence[1], 1);
    } else if (command === '/part') {
        oldSetting = bttv.settings.get('anonChat');
        bttv.settings.save('anonChat', true);
        bttv.settings.set('anonChat', oldSetting);
    } else if (command === '/shrug') {
        sentence.shift();
        helpers.sendMessage(sentence.join(' ') + ' ¯\\_(ツ)_/¯');
    } else if (command === '/sub') {
        tmi().tmiRoom.startSubscribersMode();
    } else if (command === '/suboff') {
        tmi().tmiRoom.stopSubscribersMode();
    } else if (command === '/t') {
        var time = 600;
        if (!isNaN(sentence[2])) time = sentence[2];
        helpers.timeout(sentence[1], time);
    } else if (command === '/u') {
        helpers.unban(sentence[1]);
    } else if (command === '/uptime') {
        bttv.TwitchAPI.get('streams/' + bttv.getChannel()).done(function(stream) {
            if (stream.stream !== null) {
                var startedTime = new Date(stream.stream.created_at),
                    totalUptime = Math.round(Math.abs((Date.now() - (startedTime.getTime() - (startedTime.getTimezoneOffset() * 60 * 1000))) / 1000));
                helpers.serverMessage('Stream uptime: ' + secondsToLength(totalUptime), true);
            } else {
                helpers.serverMessage('Stream offline', true);
            }
        }).fail(function() {
            helpers.serverMessage('Could not fetch start time.', true);
        });
    } else if (command === '/viewers') {
        bttv.TwitchAPI.get('streams/' + bttv.getChannel()).done(function(stream) {
            helpers.serverMessage('Current Viewers: ' + Twitch.display.commatize(stream.stream.viewers), true);
        }).fail(function() {
            helpers.serverMessage('Could not fetch viewer count.', true);
        });
    } else if (command === '/w' && bttv.settings.get('disableWhispers') === true) {
        helpers.serverMessage('You have disabled whispers in BetterTTV settings');
    } else if (command === '/help') {
        helpers.serverMessage('BetterTTV Chat Commands:');
        helpers.serverMessage('/b [username] -- Shortcut for /ban');
        helpers.serverMessage('/chatters -- Tells you how many users are currently in chat');
        helpers.serverMessage('/followers -- Retrieves the number of followers for the channel');
        helpers.serverMessage('/join -- Joins the channel (deactivates anon chat mode)');
        helpers.serverMessage('/linehistory on/off -- Toggles the chat field history (pressing up/down arrow in textbox)');
        helpers.serverMessage('/localascii -- Turns on local ascii-only mode (only your chat is ascii-only mode)');
        helpers.serverMessage('/localasciioff -- Turns off local ascii-only mode');
        helpers.serverMessage('/localmod -- Turns on local mod-only mode (only your chat is mod-only mode)');
        helpers.serverMessage('/localmodoff -- Turns off local mod-only mode');
        helpers.serverMessage('/localsub -- Turns on local sub-only mode (only your chat is sub-only mode)');
        helpers.serverMessage('/localsuboff -- Turns off local sub-only mode');
        helpers.serverMessage('/massunban (or /unban all or /u all) -- Unbans all users in the channel (channel owner only)');
        helpers.serverMessage('/part -- Parts the channel (activates anon chat mode)');
        helpers.serverMessage('/purge [username] (or /p) -- Purges a user\'s chat');
        helpers.serverMessage('/r -- Type \'/r \' to respond to your last whisper');
        helpers.serverMessage('/shrug -- Appends your chat line with a shrug face');
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
        } catch (e) {
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

        // TODO: this should not have to be here
        if (tmi().tmiRoom.isGroupRoom) {
            $('#bttv-channel-state-contain').hide();
        } else {
            $('#bttv-channel-state-contain').show();
        }
    } else {
        if ($('#right_col').css('display') === 'none') return;
        if (store.__messageQueue.length === 0) return;
        if (store.__messageQueue.length > bttv.settings.get('scrollbackAmount')) {
            store.__messageQueue.splice(0, store.__messageQueue.length - bttv.settings.get('scrollbackAmount'));
        }

        store.__messageQueue.forEach(function($message) {
            $message.find('img').on('load', function() {
                helpers.scrollChat();
            });
        });
        $('.ember-chat .chat-messages .tse-content .chat-lines').append(store.__messageQueue);
        store.__messageQueue = [];
    }
    helpers.scrollChat();
};

exports.moderationCard = function(user, $event) {
    var makeCard = require('../features/make-card');

    bttv.TwitchAPI.get('channels/' + user.toLowerCase(), {}, { version: 3 }).done(function(userApi) {
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

exports.clearChat = function(user, info) {
    var trackTimeouts = store.trackTimeouts;

    // Remove chat image preview if it exists.
    // We really shouldn't have to place this here, but since we don't emit events...
    $('#chat_preview').remove();

    if (!user) {
        helpers.serverMessage('Chat was cleared by a moderator (Prevented by BetterTTV)', true);
    } else {
        var printedChatLines = [];
        $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"]').each(function() {
            printedChatLines.push($(this));
        });

        var queuedLines = store.__messageQueue.filter(function($message) {
            if ($message.data('sender') === user) return true;
            return false;
        });

        $chatLines = $(printedChatLines.concat(queuedLines));

        if (!$chatLines.length) return;
        if (bttv.settings.get('hideDeletedMessages') === true) {
            $chatLines.each(function() {
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
                $chatLines.each(function() {
                    var $message = $(this).find('.message');

                    $message.addClass('timed-out');
                    $message.html('<span style="color: #999">&lt;message deleted&gt;</span>').off('click').on('click', function() {
                        $(this).replaceWith(templates.message(user, decodeURIComponent($(this).data('raw'))));
                    });
                });
            } else {
                $chatLines.each(function() {
                    var $message = $(this).find('.message');
                    $('a', $message).each(function() {
                        var rawLink = '<span style="text-decoration: line-through;">' + $(this).attr('href').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
                        $(this).replaceWith(rawLink);
                    });
                    $('.emoticon', $message).each(function() {
                        $(this).css('opacity', '0.1');
                    });
                    $message.addClass('timed-out');
                    $message.html('<span style="color: #999">' + $message.html() + '</span>');
                });
            }

            var message;
            var reason = info['ban-reason'] ? ' Reason: ' + templates.escape(info['ban-reason']) : '';
            var type = info['ban-duration'] ? 'timed out for ' + templates.escape(info['ban-duration']) + ' seconds.' : 'banned from this room.';
            var typeSimple = info['ban-duration'] ? 'timed out.' : 'banned.';

            if (vars.userData.isLoggedIn && user === vars.userData.name) {
                message = 'You have been ' + type + reason;
            } else if (vars.userData.isLoggedIn && helpers.isModerator(vars.userData.name)) {
                message = helpers.lookupDisplayName(user) + ' has been ' + type + reason;
            } else {
                message = helpers.lookupDisplayName(user) + ' has been ' + typeSimple;
            }

            var timesID = trackTimeouts[user] ? trackTimeouts[user].timesID : Math.floor(Math.random() * 100001);
            var spanID = 'times_from_' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '_' + timesID;

            if (trackTimeouts[user]) {
                trackTimeouts[user].count++;
                $('#' + spanID).each(function() {
                    $(this).text(message + ' (' + trackTimeouts[user].count + ' times)');
                });
            } else {
                trackTimeouts[user] = {
                    count: 1,
                    timesID: timesID
                };
                helpers.serverMessage('<span id="' + spanID + '">' + message + '</span>', true);
            }

            // Update channel state with timeout duration
            if (vars.userData.isLoggedIn && user === vars.userData.name) {
                channelState({
                    type: 'notice',
                    tags: {
                        'msg-id': info['ban-duration'] ? 'msg_timedout' : 'msg_banned',
                    },
                    message: info['ban-duration']
                });
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
    } catch (e) {
        debug.log('Error sending tracking data to Twitch');
    }

    if (data.message.substr(0, 5) === ':act ') return;

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
            vars.userData.isLoggedIn ? helpers.isModerator(vars.userData.name) : false,
            {
                message: data.message,
                time: data.date ? data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2') : '',
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

	// Pinned Highlights
    if (messageHighlighted) {
        pinnedHighlights(data);
    }

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
    var bttvBadges = helpers.assignBadges(badges || [], data);

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
            time: data.date ? data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2') : '',
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
    if (vars.localAsciiOnly) {
        for (var i = 0; i < data.message.length; i++) {
            if (data.message.charCodeAt(i) > 128) return;
        }
    }

    message = templates.privmsg(
        messageHighlighted,
        data.style === 'action' ? true : false,
        data.style === 'admin' ? true : false,
        vars.userData.isLoggedIn ? (helpers.isModerator(vars.userData.name) && (!helpers.isModerator(sender) || (vars.userData.name === channel && vars.userData.name !== sender))) : false,
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

    store.__messageQueue.push($(message));
};

exports.onPrivmsg = function(channel, data) {
    if (!rooms.getRoom(channel).active() && data.from && data.from !== 'jtv') {
        rooms.getRoom(channel).queueMessage(data);
        return;
    }
    if (!data.message || !data.message.length) return;
    if (!tmi() || !tmi().tmiRoom) return;
    try {
        if (data.style === 'whisper') {
            store.chatters[data.from] = {lastWhisper: Date.now()};
            if (bttv.settings.get('disableWhispers') === true) return;
            if (data.from !== vars.userData.name) {
                audibleFeedback();
                if (bttv.settings.get('desktopNotifications') === true && bttv.chat.store.activeView === false) bttv.notify('You received a whisper from ' + ((data.tags && data.tags['display-name']) || data.from));
            }
        }
        privmsg(channel, data);
    } catch (e) {
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


},{"../features/audible-feedback":14,"../features/channel-state":20,"../features/embedded-polling":34,"../features/keywords-lists":42,"../features/make-card":43,"../features/pinned-highlights":45,"../helpers/colors":47,"../helpers/debug":48,"../vars":69,"./helpers":5,"./rooms":7,"./store":8,"./templates":10,"./tmi":11}],5:[function(require,module,exports){
var vars = require('../vars'),
    debug = require('../helpers/debug'),
    keyCodes = require('../keycodes'),
    tmi = require('./tmi'),
    store = require('./store'),
    templates = require('./templates'),
    bots = require('../bots'),
    punycode = require('punycode'),
    channelState = require('../features/channel-state'),
    overrideEmotes = require('../features/override-emotes'),
    throttle = require('lodash.throttle');

// Helper functions
var calculateColorBackground = require('../helpers/colors').calculateColorBackground;
var calculateColorReplacement = require('../helpers/colors').calculateColorReplacement;

var lookupDisplayName = exports.lookupDisplayName = function(user, nicknames) {
    if (!user) return '';

    // There's no display-name when sending messages, so we'll fill in for that
    if (vars.userData.isLoggedIn && user === vars.userData.name) {
        store.displayNames[user] = vars.userData.displayName || user;
    }

    if (nicknames !== false) {
        nicknames = bttv.storage.getObject('nicknames');
        if (user in nicknames) return ( nicknames[user] || user.capitalize() );
    }

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
    } catch (err) {
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
    } catch (e) {
        debug.log('Couldn\'t grab user emotes for tab completion.', e);
    }

    return completableEmotesList.sort();
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
                sentence.push('@' + lookupDisplayName(user, false));
            } else {
                sentence.push(lookupDisplayName(user, false));
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
                users = bttv.settings.get('tabCompletionEmotePriority') ? emotes.concat(users) : users.concat(emotes);
            }

            if (users.indexOf(vars.userData.name) > -1) users.splice(users.indexOf(vars.userData.name), 1);

            if (/^(\/|\.)/.test(search)) {
                search = '';
            }

            if (search.length) {
                users = users.filter(function(userToFilter) {
                    var lcUser = userToFilter.toLowerCase();
                    return (lcUser.indexOf(search) === 0);
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
            user = lookupDisplayName(user, false);
            isEmote = false;
        }

        if (/^(\/|\.)/.test(lastWord) && sentence.length === 0) {
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
            return (msg.style === 'whisper' && msg.from.toLowerCase() !== vars.userData.name);
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
            } catch (e) {
                serverMessage('You must be logged into Twitch to send messages.');
            }

            return;
        }

        if (['/', '.'].indexOf(message.charAt(0)) > -1) {
            message = message.split(' ');
            message[0] = message[0].toLowerCase();
            message = message.join(' ');
        }

        if (tmi().tmiSession.sendWhisper && ['/w', '.w'].indexOf(message.substr(0, 2)) > -1) {
            tmi().send(message);
            return;
        }

        if (bttv.settings.get('anonChat') === true) {
            serverMessage('You can\'t send messages when Anon Chat is enabled. You can disable Anon Chat in the BetterTTV settings.');
            return;
        }

        tmi().tmiRoom.sendMessage(message);

        try {
            if (!/^\/w(\s|$)/.test(message)) {
                if (['/', '.'].indexOf(message.charAt(0)) === -1) {
                    channelState({
                        type: 'outgoing_message'
                    });
                }
                bttv.ws.broadcastMe();
                tmi().trackSubOnly(message);
                tmi().trackChat();
            }
        } catch (e) {
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

        if (message.hasClass('timed-out')) return;

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

exports.isSpammer = function(user) {
    if (!user || user === '') return false;
    return store.spammers.indexOf(user.toLowerCase()) > -1;
};

exports.getBadges = function(user) {
    if (!user || user === '') return false;
    var badges = [];
    if (tmi() && tmi().tmiRoom.getLabels(user)) badges = tmi().tmiRoom.getLabels(user);
    if (store.__subscriptions[user] && store.__subscriptions[user].indexOf(bttv.getChannel()) !== -1) badges.push('subscriber');
    if ((store.__channelBots.indexOf(user) > -1 || bots.indexOf(user) > -1) && isModerator(user)) badges.push('bot');
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

exports.scrollChat = throttle(function() {
    var $chat = $('.ember-chat');

    var chatPaused = $chat.find('.chat-interface').children('span').children('.more-messages-indicator').length;

    if (chatPaused || !$chat.length) return;

    var $chatMessages = $chat.find('.chat-messages');
    var $chatScroller = $chatMessages.children('.tse-scroll-content');
    var $chatLines = $chatScroller.find('.chat-lines').children('div.chat-line');

    setTimeout(function() {
        if (!$chatScroller.length) return;

        $chatScroller[0].scrollTop = $chatScroller[0].scrollHeight;
    });

    var linesToDelete = $chatLines.length - bttv.settings.get('scrollbackAmount');

    if (linesToDelete <= 0) return;

    $chatLines.slice(0, linesToDelete).each(function() {
        $(this).remove();
    });
}, 250);

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
            $style.append('.badges .bttv-' + badge.name + ' { background: url("' + badge.svg + '"); background-size: 100%; }');
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
    }

    if (badges.indexOf('bot') !== -1) {
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

        if ([
            'moderator',
            'broadcaster',
            'admin',
            'global-moderator',
            'staff',
            'bot'
        ].indexOf(badge.type) === -1) {
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

exports.massUnban = function() {
    if (!vars.userData.isLoggedIn || vars.userData.name !== bttv.getChannel()) {
        serverMessage("You're not the channel owner.");
        return;
    }

    var unbanCount = 0;

    var unbanChatters = function(users, callback) {
        var interval = setInterval(function() {
            var user = users.shift();

            if (!user) {
                clearInterval(interval);
                callback();
                return;
            }

            unban(user);
        }, 333);
    };

    var getBannedChatters = function() {
        serverMessage('Fetching banned users...');

        $.get('/settings/channel').success(function(data) {
            var $chatterList = $(data).find('#banned_chatter_list');

            if (!$chatterList.length) return serverMessage('Error fetching banned users list.');

            var users = [];

            $chatterList.find('.ban .obj').each(function() {
                var user = $(this).text().trim();
                if (users.indexOf(user) === -1) users.push(user);
            });

            if (users.length === 0) {
                serverMessage('You have no more banned users. Total Unbanned Users: ' + unbanCount);
                return;
            }

            unbanCount += users.length;

            serverMessage('Starting purge process in 5 seconds.');
            serverMessage('This block of users will take ' + (users.length / 3).toFixed(1) + ' seconds to unban.');

            if (users.length > 70) serverMessage('Twitch only provides up to 100 users at a time (some repeat), but this script will cycle through all of the blocks of users.');

            setTimeout(function() {
                unbanChatters(users, function() {
                    serverMessage('This block of users has been purged. Checking for more..');
                    getBannedChatters();
                });
            }, 5000);
        });
    };

    getBannedChatters();
};

exports.translate = function($element, sender, text) {
    var language = (window.cookie && window.cookie.get('language')) ? window.cookie.get('language') : 'en';

    var qs = $.param({
        target: language,
        q: text
    });

    $.getJSON('https://api.betterttv.net/2/translate?' + qs).success(function(data) {
        var $newElement = $(templates.message(sender, data.translation));
        $element.replaceWith($newElement);

        // Show original message on hover
        $newElement.on('mouseover', function() {
            $(this).tipsy({
                trigger: 'manual',
                title: function() { return 'Original message: ' + text; }
            }).tipsy('show');
        }).on('mouseout', function() {
            $(this).tipsy('hide');
            $('div.tipsy').remove();
        });
    }).error(function(data) {
        $newElement = $(templates.message(sender, text));
        $element.replaceWith($newElement);

        var error = 'There was an unknown error translating this message.';

        if (data.responseJSON && data.responseJSON.message) {
            error = data.responseJSON.message;
        }

        $newElement.tipsy({
            trigger: 'manual',
            gravity: $.fn.tipsy.autoNS,
            title: function() { return error; }
        });
        $newElement.tipsy('show');
        setTimeout(function() {
            try {
                $newElement.tipsy('hide');
            } catch (e) {}
        }, 3000);
    });
};

exports.loadBTTVChannelData = function() {
    // Loads global BTTV emotes (if not loaded)
    overrideEmotes();

    // When swapping channels, removes old channel emotes
    var bttvEmoteKeys = Object.keys(store.bttvEmotes);
    for (var i = bttvEmoteKeys.length - 1; i >= 0; i--) {
        var bttvEmoteKey = bttvEmoteKeys[i];
        if (store.bttvEmotes[bttvEmoteKey].type !== 'channel') continue;
        delete store.bttvEmotes[bttvEmoteKey];
    }

    store.__channelBots = [];

    $.getJSON('https://api.betterttv.net/2/channels/' + bttv.getChannel()).done(function(data) {
        data.emotes.forEach(function(bttvEmote) {
            bttvEmote.type = 'channel';
            bttvEmote.urlTemplate = data.urlTemplate.replace('{{id}}', bttvEmote.id);
            bttvEmote.url = bttvEmote.urlTemplate.replace('{{image}}', '1x');
            store.bttvEmotes[bttvEmote.code] = bttvEmote;
        });
        store.__channelBots = data.bots;
    });
};

},{"../bots":1,"../features/channel-state":20,"../features/override-emotes":44,"../helpers/colors":47,"../helpers/debug":48,"../keycodes":52,"../legacy-tags":53,"../vars":69,"./handlers":4,"./store":8,"./templates":10,"./tmi":11,"lodash.throttle":113,"punycode":156}],6:[function(require,module,exports){
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
exports.spammers = [];
exports.tabCompleteHistory = [];
exports.suggestions = {
    matchList: [],
    lastMatch: ''
};
exports.chatHistory = [];
exports.whisperHistory = {};
exports.bttvEmotes = {};
exports.proEmotes = {};
exports.autoCompleteEmotes = {};

// as these aren't objects, they can't be local variables (otherwise we wouldn't be able to modify them from outside)
exports.__messageTimer = false;
exports.currentRoom = '';
exports.activeView = true;

},{}],9:[function(require,module,exports){
var vars = require('../vars'),
    debug = require('../helpers/debug'),
    keyCodes = require('../keycodes'),
    store = require('./store'),
    handlers = require('./handlers'),
    helpers = require('./helpers'),
    rooms = require('./rooms'),
    templates = require('./templates'),
    debounce = require('lodash.debounce'),
    loadChatSettings = require('../features/chat-load-settings'),
    anonChat = require('../features/anon-chat'),
    customTimeouts = require('../features/custom-timeouts');

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

    if (!$('.ember-chat .chat-header:first').hasClass('main-header')) {
        $('.ember-chat .chat-header:first').addClass('main-header');
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

    // Takes over whisper replies (actually all messages Twitch still emits)
    tmi.set('addMessage', function(d) {
        handlers.onPrivmsg(bttv.getChannel(), d);
    });

    // Fake the initial roomstate
    helpers.parseRoomState({
        tags: {
            'subs-only': tmi.get('subsOnly'),
            slow: tmi.get('slow'),
            r9k: tmi.get('r9k')
        }
    });
    vars.localSubsOnly = false;
    vars.localModsOnly = false;

    // Handle Group Chats
    var privateRooms = bttv.getChatController().get('connectedPrivateGroupRooms');
    if (privateRooms && privateRooms.length > 0) {
        privateRooms.forEach(function(room) {
            rooms.newRoom(room.get('id'));
            room.tmiRoom.on('message', rooms.getRoom(room.get('id')).chatHandler);
            room.tmiRoom.on('clearchat', handlers.clearChat);
        });
    }

    // Load BTTV channel emotes/bots
    helpers.loadBTTVChannelData();

    // Load Volunteer Badges
    helpers.loadBadges();
    bttv.ws.broadcastMe();

    // Load Chat Settings
    loadChatSettings();

    // Load spammer list
    $.getJSON('https://api.betterttv.net/2/spammers').done(function(data) {
        store.spammers = data.users;
    });
    $('body').off('click', '.chat-line .message.spam').on('click', '.chat-line .message.spam', function() {
        var user = $(this).parent().data('sender');
        $(this).replaceWith(templates.message(user, decodeURIComponent($(this).data('raw')), null, null, true));
    });

    // Hover over links
    var hoverLink = debounce(function() {
        var $this = $(this);

        if ($this.hasClass('chat-preview')) return;

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
    }, 250);
    $('body').off('mouseover', '.chat-line .message a').on('mouseover', '.chat-line .message a', hoverLink).off('mouseout', '.chat-line .message a').on('mouseout', '.chat-line .message a', function() {
        hoverLink.cancel();
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
    var clickCounter = 0;
    $('body').off('click', '.chat-line .from').on('click', '.chat-line .from', function(e) {
        if (e.shiftKey) return;

        var $element = $(this);
        var sender = ($element.data('sender') || $element.parent().data('sender')).toString();

        if (clickCounter > 0) return clickCounter++;

        setTimeout(function() {
            if (clickCounter >= 2 && bttv.settings.get('dblClickAutoComplete') === true) {
                $('.ember-chat .chat-interface').find('textarea').val(helpers.lookupDisplayName(sender, false) + ', ');
            } else {
                handlers.moderationCard(sender, $element);
            }

            clickCounter = 0;
        }, 250);

        clickCounter++;
    }).on('mousedown', '.chat-line .from', function(e) {
        if (e.which === 3 && !bttv.settings.get('customTOShiftOnly') || e.shiftKey) {
            customTimeouts($(this).data('sender') || $(this).parent().data('sender'), $(this));
        }
    }).on('contextmenu', '.chat-line .from', function(e) {
        if (!helpers.isModerator(vars.userData.name)) return true;
        if (bttv.settings.get('customTOShiftOnly') && !e.shiftKey) return true;
        return false;
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

    // Limit chat input to 500 characters
    $chatInput.attr('maxlength', '500');

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

        if (e.which === keyCodes.Tab && !e.ctrlKey) {
            helpers.tabCompletion(e);
            e.preventDefault();
        }

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

    bttv.ws.joinChannel();

    // Reset chatters list
    store.chatters = {};
    store.chatters[bttv.getChannel()] = {lastWhisper: 0};

    // When messages come in too fast, things get laggy
    if (!store.__messageTimer) store.__messageTimer = setInterval(handlers.shiftQueue, 250);

    // Active Tab monitoring - Useful for knowing if a user is 'watching' chat
    $(window).off('blur focus').on('blur focus', function(e) {
        var prevType = $(this).data('prevType');

        if (prevType !== e.type) {   //  reduce double fire issues
            if (e.type === 'blur') {
                store.activeView = false;
            } else if (e.type === 'focus') {
                $('.chat-interface textarea').focus();
                store.activeView = true;
            }
        }

        $(this).data('prevType', e.type);
    });

    // Keycode to quickly timeout users
    $(window).off('keydown').on('keydown', function(e) {
        var keyCode = e.keyCode || e.which;

        if ($('.bttv-mod-card').length && bttv.settings.get('modcardsKeybinds') === true) {
            var user = $('.bttv-mod-card').data('user');
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
        }
    });
};

},{"../features/anon-chat":13,"../features/chat-load-settings":21,"../features/custom-timeouts":30,"../helpers/debug":48,"../keycodes":52,"../vars":69,"./handlers":4,"./helpers":5,"./rooms":7,"./store":8,"./templates":10,"./tmi":11,"lodash.debounce":112}],10:[function(require,module,exports){
var tmi = require('./tmi'),
    store = require('./store'),
    helpers = require('./helpers');

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
    return '<span ' + (color ? 'style="color: ' + color + ';" ' : '') + 'class="from">' + escape(name) + '</span><span class="colon">:</span>' + (name !== 'jtv' ? '&nbsp;<wbr></wbr>' : '');
};

var timestamp = exports.timestamp = function(time) {
    return '<span class="timestamp"><small>' + time + '</small></span>';
};

var modicons = exports.modicons = function() {
    return '<span class="mod-icons"><a class="mod-icon ban" title="Ban">Ban</a><a class="mod-icon unban" title="Unban" style="display: none;">Unban</a><a class="mod-icon timeout" title="Timeout">Timeout</a></span>';
};

var linkify = exports.linkify = function(message) {
    var regex = /(?:https?:\/\/)?(?:[-a-zA-Z0-9@:%_\+~#=]+\.)+[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=()]*)/gi;
    return message.replace(regex, function(e) {
        if (/\x02/.test(e)) return e;
        if (e.indexOf('@') > -1 && (e.indexOf('/') === -1 || e.indexOf('@') < e.indexOf('/'))) return '<a href="mailto:' + e + '">' + e + '</a>';
        var link = e.replace(/^(?!(?:https?:\/\/|mailto:))/i, 'http://');
        return '<a href="' + link + '" target="_blank">' + e + '</a>';
    });
};

var escapeEmoteCode = function(code) {
    return code.replace(/('|"|>|<|&)/g, '');
};

var emoticonBTTV = exports.emoticonBTTV = function(emote) {
    var channel = emote.channel ? 'data-channel="' + emote.channel + '" ' : '';
    var type = emote.type ? 'data-type="' + emote.type + '" ' : '';
    return '<img class="emoticon bttv-emo-' + emote.id + '" src="' + emote.urlTemplate.replace('{{image}}', '1x') + '" srcset="' + emote.urlTemplate.replace('{{image}}', '2x') + ' 2x" ' + type + channel + 'alt="' + escapeEmoteCode(emote.code) + '" />';
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
        return '<img class="emoticon ttv-emo-' + id + '" src="' + jtvEmoticonize(id) + '" data-id="' + id + '" alt="' + escapeEmoteCode(name) + '" />';
    }
    return '<img class="emoticon ttv-emo-' + id + '" src="https://static-cdn.jtvnw.net/emoticons/v1/' + id + '/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/' + id + '/2.0 2x" data-id="' + id + '" alt="' + escapeEmoteCode(name) + '" />';
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

var bttvEmoticonize = exports.bttvEmoticonize = function(message, emote, sender) {
    if (emote.restrictions) {
        if (emote.restrictions.channels.length && emote.restrictions.channels.indexOf(bttv.getChannel()) === -1) return message;
        if (emote.restrictions.games.length && tmi().channel && emote.restrictions.games.indexOf(tmi().channel.game) === -1) return message;

        var emoteSets = sender ? helpers.getEmotes(sender) : [];
        if (emote.restrictions.emoticonSet && emoteSets.indexOf(emote.restrictions.emoticonSet) === -1) return message;
    }

    return message.replace(emote.code, emoticonBTTV(emote));
};

var bttvMessageTokenize = exports.bttvMessageTokenize = function(sender, message) {
    var tokenizedString = message.split(' ');

    for (var i = 0; i < tokenizedString.length; i++) {
        var piece = tokenizedString[i];

        if (bttv.settings.get('chatImagePreview') === true) {
            var imageTest = new RegExp('(https?:\/\/.)([a-z\-_0-9\/\:\.\%\+]*\.(jpg|jpeg|png|gif|gifv|webm))', 'i');
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
        } else if (store.proEmotes.hasOwnProperty(sender)) {
            if (store.proEmotes[sender].hasOwnProperty(piece)) {
                emote = store.proEmotes[sender][piece];
            } else if (store.proEmotes[sender].hasOwnProperty(test)) {
                emote = store.proEmotes[sender][test];
            }
        }

        if (
            emote &&
            emote.urlTemplate &&
            bttv.settings.get('bttvEmotes') === true &&
            (emote.imageType === 'png' || (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') === true))
        ) {
            piece = bttvEmoticonize(piece, emote, sender);
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

var message = exports.message = function(sender, msg, emotes, colored, force) {
    colored = colored || false;
    force = force || false;
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

    var spam = false;
    if (bttv.settings.get('hideSpam') && helpers.isSpammer(sender) && !helpers.isModerator(sender) && !force) {
        msg = '<span style="color: #999">&lt;spam deleted&gt;</span>';
        spam = true;
    }

    return '<span class="message ' + (spam ? 'spam' : '') + '" ' + (colored ? 'style="color: ' + colored + '" ' : '') + 'data-raw="' + rawMessage + '" data-emotes="' + (emotes ? encodeURIComponent(JSON.stringify(emotes)) : 'false') + '">' + msg + '</span>';
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

},{"../templates/chat-suggestions":61,"../templates/moderation-card":64,"./helpers":5,"./store":8,"./tmi":11}],11:[function(require,module,exports){
module.exports = function() {
    return bttv.getChatController() ? bttv.getChatController().currentRoom : false;
};

},{}],12:[function(require,module,exports){
/* global BTTVLOADED:true PP:true*/
// Declare public and private variables
var debug = require('./helpers/debug'),
    vars = require('./vars'),
    TwitchAPI = require('./twitch-api'),
    WS = require('./ws'),
    Storage = require('./storage'),
    Settings = require('./settings');

bttv.info = {
    version: '6.8',
    release: 44,
    versionString: function() {
        return bttv.info.version + 'R' + bttv.info.release;
    }
};

bttv.TwitchAPI = TwitchAPI;
bttv.vars = vars;
bttv.storage = new Storage();
bttv.settings = new Settings();

bttv.getChannel = function() {
    if (window.Ember && window.App && ['channel.index.index', 'vod'].indexOf(App.__container__.lookup('controller:application').get('currentRouteName')) > -1) {
        var channel = App.__container__.lookup('controller:channel');
        var user = App.__container__.lookup('controller:user');
        return (!Ember.isNone(channel) && channel.get('model.id')) || (!Ember.isNone(user) && user.get('model.id'));
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

bttv.notify = function(message, options) {
    if (!message) return;

    options = options || {};
    var title = options.title || 'Notice';
    var url = options.url || '';
    var image = options.image || 'https://cdn.betterttv.net/style/logos/bttv_logo.png';
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

        if (!window.Twitch.notify) return;

        window.Twitch.notify.alert(message, {
            layout: 'bottomCenter',
            timeout: 5000,
            killer: true,
            escape: false
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
    createSettings = require('./features/create-settings'),
    enableImagePreview = require('./features/image-preview').enablePreview,
    enableTheatreMode = require('./features/auto-theatre-mode'),
    hostButtonBelowVideo = require('./features/host-btn-below-video'),
    conversations = require('./features/conversations'),
    betterViewerList = require('./features/better-viewer-list'),
    ChatReplay = require('./features/chat-replay');

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

        // Some page changes do not trigger a re-render
        App.__container__.lookup('controller:application').addObserver('currentRouteName', function() {
            $('#main_col').removeAttr('style');
        });

        Ember.subscribe('render', {
            before: function() {
                renderingCounter++;
            },
            after: function(name, ts, payload) {
                renderingCounter--;

                if (!payload.template) return;
                debug.log(payload.template, App.__container__.lookup('controller:application').get('currentRouteName'));

                switch (App.__container__.lookup('controller:application').get('currentRouteName')) {
                    case 'channel.index.index':
                        waitForLoad(function(ready) {
                            if (ready) {
                                handleBackground();
                                clearClutter();
                                channelReformat();
                                hostButtonBelowVideo();
                                betterViewerList();
                                if (
                                    App.__container__.lookup('controller:channel').get('isTheatreMode') === false &&
                                    bttv.settings.get('autoTheatreMode') === true
                                ) {
                                    enableTheatreMode();
                                }
                                window.dispatchEvent(new Event('resize'));
                                setTimeout(function() {
                                    window.dispatchEvent(new Event('resize'));
                                }, 3000);
                            }
                        });
                        break;
                    case 'vod':
                        // disconnect old chat replay watcher, spawn new
                        try {
                            chatReplay.disconnect();
                        } catch (e) {}
                        chatReplay = new ChatReplay();
                        window.dispatchEvent(new Event('resize'));
                        break;
                    case 'following.index':
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
                                vars.emotesLoaded = false;
                                chatFunctions();
                                channelReformat();
                                window.dispatchEvent(new Event('resize'));
                            }
                        });
                        break;
                    default:
                        // resets main col width on all non-resized pages
                        $('#main_col').removeAttr('style');
                        break;
                }

                switch (payload.template) {
                    case 'chat/chat':
                        waitForLoad(function(ready) {
                            if (ready) {
                                bttv.chat.store.isLoaded = false;
                                chatFunctions();
                            }
                        });
                        break;
                }
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
        bttv.ws = new WS();

        chatReplay = new ChatReplay();
        conversations();
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

        if (bttv.settings.get('chatImagePreview') === true) {
            enableImagePreview();
        }
        if (bttv.settings.get('autoTheatreMode') === true) {
            enableTheatreMode();
        }

        window.dispatchEvent(new Event('resize'));
    };

    var delayedFuncs = function() {
        channelReformat();
        window.dispatchEvent(new Event('resize'));
        chatFunctions();
        directoryFunctions();
    };

    $(document).ready(function() {
        loadUser(function() {
            createSettings();
            bttv.settings.load();

            debug.log('BTTV v' + bttv.info.versionString());
            debug.log('CALL init ' + document.URL);

            if (/\?bttvMassUnban=true/.test(window.location)) {
                return new MassUnbanPopup();
            }

            initialFuncs();
            setTimeout(delayedFuncs, 3000);
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

if (!window.Twitch || !window.Twitch.api || !window.Twitch.user) {
    debug.log('window.Twitch not detected.');
    return;
}

if (window.BTTVLOADED === true) return;
debug.log('BTTV LOADED ' + document.URL);
BTTVLOADED = true;
checkJquery();

},{"./chat":2,"./features/auto-theatre-mode":15,"./features/better-viewer-list":16,"./features/brand":17,"./features/channel-reformat":19,"./features/chat-replay":22,"./features/check-broadcast-info":23,"./features/check-following":24,"./features/check-messages":25,"./features/clear-clutter":26,"./features/conversations":27,"./features/create-settings":28,"./features/darken-page":31,"./features/dashboard-channelinfo":32,"./features/directory-functions":33,"./features/flip-dashboard":35,"./features/format-dashboard":36,"./features/giveaway-compatibility":37,"./features/handle-background":38,"./features/handle-twitchchat-emotes":39,"./features/host-btn-below-video":40,"./features/image-preview":41,"./features/split-chat":46,"./helpers/debug":48,"./settings":55,"./storage":56,"./twitch-api":68,"./vars":69,"./ws":70}],13:[function(require,module,exports){
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
        var prodConn = session._connections.aws || session._connections.prod || session._connections.main;
        if (!prodConn) return;

        var prodConnOpts = prodConn._opts;

        if (enabled) {
            if (prodConnOpts.nickname === vars.userData.name) {
                prodConnOpts.nickname = 'justinfan12345';
                room._showAdminMessage('BetterTTV: [Anon Chat] Logging you out of chat..');
                bttv.chat.store.ignoreDC = true;
                prodConn._send('QUIT');
            }
        } else {
            if (prodConnOpts.nickname !== vars.userData.name) {
                prodConnOpts.nickname = vars.userData.name;
                room._showAdminMessage('BetterTTV: [Anon Chat] Logging you back into chat..');
                bttv.chat.store.ignoreDC = true;
                prodConn._send('QUIT');
            }
        }
    } catch (e) {
        room._showAdminMessage('BetterTTV: [Anon Chat] We encountered an error anonymizing your chat. You won\'t be hidden in this channel.');
    }
};

},{"../vars":69}],14:[function(require,module,exports){
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

},{"../helpers/debug":48}],15:[function(require,module,exports){
module.exports = function() {
    if (!window.Ember || !window.App ||
        App.__container__.lookup('controller:application').get('currentRouteName') !== 'channel.index.index') {
        return;
    }

    var emberView = $('#player').children()[0].id;
    var emberViews = App.__container__.lookup('-view-registry:main');
    emberViews[emberView].sendAction('toggleTheatreAction', emberViews[emberView].get('player'));
};

},{}],16:[function(require,module,exports){
var buttonTemplate = require('../templates/bvl-button'),
    panelTemplate = require('../templates/bvl-panel'),
    debug = require('../helpers/debug'),
    handlers = require('../chat/handlers'),
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
                text: users[j]
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
                }, row.text);
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
}

function createPanel() {
    // Create panel
    $panel = $(panelTemplate())
        .draggable({
            handle: '.drag_handle',
            containment: 'body'
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
    if (!window.Ember || !window.App ||
        App.__container__.lookup('controller:application').get('currentRouteName') !== 'channel.index.index') return;

    if ($('#bvl-button').length > 0) {
        $('#bvl-button').show();
        return;
    }

    var interval = setInterval(function() {
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

},{"../chat/handlers":4,"../helpers/debug":48,"../templates/bvl-button":57,"../templates/bvl-panel":58,"resizable":166,"view-list":192}],17:[function(require,module,exports){
var debug = require('../helpers/debug');

module.exports = function() {
    debug.log('Branding Site with Better & Importing Styles');

    var $watermark = $('<img />');
    $watermark.attr('id', 'bttv_logo');

    // New Site Logo Branding
    if ($('#large_nav #logo').length) {
        $watermark.attr('src', 'https://cdn.betterttv.net/style/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'left': '90px',
            'top': '10px',
            'position': 'absolute'

        });
        $('#large_nav #logo').append($watermark);
    }

    // New Twitch Friends List (lazy loads, pita)
    var lameLLT = setInterval(function() {
        if (!$('.warp .warp__logo').length) return;

        clearInterval(lameLLT);

        $watermark.attr('src', 'https://cdn.betterttv.net/style/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'left': '90px',
            'top': '-10px',
            'position': 'absolute'
        });
        $('.warp .warp__logo').append($watermark);

        $('.warp__drawer .warp__list .warp__item:eq(2)').before('<li class="warp__item"><a class="warp__tipsy" data-tt_medium="twitch_leftnav" href="#" title="BetterTTV Settings"><figure class="warp__avatar bttvSettingsIconDropDown"></figure><span class="drawer__item">BetterTTV Settings</span></a></li>');
        $('.bttvSettingsIconDropDown').parent().click(function(e) {
            e.preventDefault();
            $('#chat_settings_dropmenu').hide();
            $('#bttvSettingsPanel').show('slow');
        }).tipsy({
            gravity: 'w'
        });
    }, 100);

    // Adds BTTV Settings Icon to Old Left Sidebar
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
};

},{"../helpers/debug":48}],18:[function(require,module,exports){
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
    var isNewPlayer = typeof $('#player .player').data('playertype') !== 'undefined';

    for (var i = 0; i < players.length; i++) {
        var player = players[i];

        if (!$(player).length) continue;

        return ($(player).width() * 0.5625) + (player.indexOf('iframe') > -1 || isNewPlayer ? 0 : 30);
    }

    return -1;
};

module.exports = function() {
    if ($('#right_col').length === 0) return;

    debug.log('Page resized');

    var hostModeEnabled = $('#hostmode').length;

    var $playerStyle = $('#bttvPlayerStyle');

    if (!$playerStyle.length) {
        $playerStyle = $('<style></style>');
        $playerStyle.attr('id', 'bttvPlayerStyle');
        $('body').append($playerStyle);
    }

    // If chat sidebar is closed, element width != 0
    if (vars.chatWidth === 0 || $('#right_col').hasClass('closed')) {
        $('#main_col').css({
            marginRight: '0px'
        });
    } else {
        $('#main_col').css({
            marginRight: $('#right_col').width() + 'px'
        });
    }

    if ($('#main_col #channel').length === 0) return;

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

},{"../../helpers/debug":48,"../../vars":69}],19:[function(require,module,exports){
/* global chatWidthStartingPoint: true*/

var debug = require('../../helpers/debug'),
    keyCodes = require('../../keycodes'),
    vars = require('../../vars');
var handleResize = require('./handle-resize');

module.exports = function() {
    if ($('#main_col #channel').length === 0 || $('#right_col').length === 0) return;

    debug.log('Reformatting Channel Page');

    if (!vars.loadedChannelResize) {
        vars.loadedChannelResize = true;

        var resize = false;

        $(document).keydown(function(event) {
            if (event.keyCode === keyCodes.r && event.altKey) {
                window.dispatchEvent(new Event('resize'));
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
            window.dispatchEvent(new Event('resize'));
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
        $(window).resize(function() {
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
        window.dispatchEvent(new Event('resize'));
    });

    if (bttv.settings.get('chatWidth') !== null) {
        vars.chatWidth = bttv.settings.get('chatWidth');

        if (vars.chatWidth < 340) {
            vars.chatWidth = 0;
            bttv.settings.save('chatWidth', 0);
        }

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

        window.dispatchEvent(new Event('resize'));
    } else {
        if ($('#right_col').width() === '0') {
            $('#right_col').width('340px');
        }

        vars.chatWidth = $('#right_col').width();
        bttv.settings.save('chatWidth', $('#right_col').width());
    }
};

},{"../../helpers/debug":48,"../../keycodes":52,"../../vars":69,"./handle-resize":18}],20:[function(require,module,exports){
var vars = require('../vars');
var template = require('../templates/channel-state');

var stateContainer = '#bttv-channel-state-contain';
var chatHeader = '.chat-container .chat-header:first';
var chatButton = '.chat-interface .chat-buttons-container .button.primary.float-right';

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

    var endTimestamp = Date.now() + (length * 1000);

    bttv.chat.store.chatCountDown = setInterval(function() {
        var remainingTime = endTimestamp - Date.now();

        if (remainingTime <= 0) {
            return resetCountDown();
        }

        $(chatButton).find('span').text('Chat in ' + displaySeconds(Math.ceil(remainingTime / 1000)));
    }, 500);
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
            if (!vars.userData.isLoggedIn || bttv.chat.helpers.isModerator(vars.userData.name)) return;

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
};

},{"../templates/channel-state":59,"../vars":69}],21:[function(require,module,exports){
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

            $('.ember-chat .chat-room').append('<div class="bttvBlackDeprecationWarning">BTTV Black Chat (Chroma Key) feature is deprecated in favor of <a href="https://nightdev.com/kapchat/" target="_blank">KapChat</a>, and will eventually be removed. <span class="close">(close)</span></div>');
            $('.ember-chat .chat-room .bttvBlackDeprecationWarning').one('click', function() {
                $('.ember-chat .chat-room .bttvBlackDeprecationWarning').remove();
            });
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
        var keywords = prompt('Type some blacklist keywords. Messages containing keywords will be filtered from your chat. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase, and () around a word to specify a username. Wildcards are supported.', bttv.settings.get('blacklistKeywords'));
        if (keywords !== null) {
            keywords = keywords.trim().replace(/\s\s+/g, ' ');
            bttv.settings.save('blacklistKeywords', keywords);
        }
    });

    $('.setHighlightKeywords').click(function(e) {
        e.preventDefault();
        var keywords = prompt('Type some highlight keywords. Messages containing keywords will turn red to get your attention. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase, and () around a word to specify a username. Wildcards are supported.', bttv.settings.get('highlightKeywords'));
        if (keywords !== null) {
            keywords = keywords.trim().replace(/\s\s+/g, ' ');
            bttv.settings.save('highlightKeywords', keywords);
        }
    });

    $('.setScrollbackAmount').click(function(e) {
        e.preventDefault();
        var lines = prompt('What is the maximum amount of lines that you want your chat to show? Twitch default is 150. Leave the field blank to disable.', bttv.settings.get('scrollbackAmount'));
        if (lines !== null && lines === '') {
            bttv.settings.save('scrollbackAmount', 150);
        } else if (lines !== null && isNaN(lines) !== true && lines > 0) {
            bttv.settings.save('scrollbackAmount', parseInt(lines, 10));
        }
    });

    // Make chat settings scrollable
    $('.ember-chat .chat-settings').css('max-height', $(window).height() - 100);
};

},{"../helpers/debug":48,"../helpers/element":49,"../templates/chat-settings":60,"../vars":69,"./darken-page":31,"./split-chat":46}],22:[function(require,module,exports){
var chatHelpers = require('../chat/helpers');
var chatStore = require('../chat/store');
var chatTemplates = require('../chat/templates');

function ChatReplay() {
    this._waitForLoad = setInterval(function() {
        if (!window.Ember || !window.App) return;

        var route = App.__container__.lookup('controller:application').get('currentRouteName');

        if (route === 'loading' || route !== 'vod') return;

        clearTimeout(this._waitForLoad);
        this._waitForLoad = null;

        chatHelpers.loadBTTVChannelData();

        this.connect();
    }.bind(this), 1000);
}

ChatReplay.prototype.connect = function() {
    this.watcher = new MutationObserver(function(mutations) {
        if ($('.chatReplay').length && $('.chat-lines').length) {
            this.watcher.disconnect();
            this.watcher.observe($('.chat-lines')[0], { childList: true, subtree: true });
        }

        mutations.forEach(function(mutation) {
            var el;
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                el = mutation.addedNodes[i];

                if ($(el).hasClass('chat-line')) {
                    if ($(el).find('.horizontal-line').length) continue;
                    this.messageParser(el);
                }
            }
        }.bind(this));
    }.bind(this));

    this.watcher.observe($('body')[0], { childList: true, subtree: true });
};

ChatReplay.prototype.disconnect = function() {
    if (this._waitForLoad) clearTimeout(this._waitForLoad);
    this.watcher.disconnect();
};

ChatReplay.prototype.messageParser = function(element) {
    var $element = $(element);

    if ($element.find('.deleted').length) {
        $element.remove();
        return;
    }

    var $name = $element.find('.from');
    var color = $name.attr('style').replace('color:', '');
    $name.css('color', chatHelpers.calculateColor(color));

    var message = element.querySelector('.message');

    if (!message) return;
    message.innerHTML = this.emoticonize(message.innerHTML);
};

ChatReplay.prototype.emoticonize = function(message) {
    if (bttv.settings.get('bttvEmotes') === false) return message;

    var parts = message.split(' ');
    var test;
    var emote;

    for (var i = 0; i < parts.length; i++) {
        if (parts[i].length > 1) parts[i] = parts[i].replace(/\n/, '');
        test = parts[i].replace(/(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g, '');
        emote = null;

        if (chatStore.bttvEmotes.hasOwnProperty(parts[i])) {
            emote = chatStore.bttvEmotes[parts[i]];
        } else if (chatStore.bttvEmotes.hasOwnProperty(test)) {
            emote = chatStore.bttvEmotes[test];
        }
        if (
            emote &&
            emote.urlTemplate &&
            (emote.imageType === 'png' || (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') === true))
        ) {
            parts[i] = chatTemplates.bttvEmoticonize(parts[i], emote);
            changed = true;
        }
    }
    return parts.join(' ');
};

module.exports = ChatReplay;

},{"../chat/helpers":5,"../chat/store":8,"../chat/templates":10}],23:[function(require,module,exports){
var debug = require('../helpers/debug');

var checkBroadcastInfo = module.exports = function() {
    if (!window.App || !window.App.__container__) return;

    var channelCtrl = window.App.__container__.lookup('controller:channel');

    if (!channelCtrl || !channelCtrl.get('model')) return setTimeout(checkBroadcastInfo, 60000);

    var model = channelCtrl.get('model');

    if (Ember.isEmpty(model)) return setTimeout(checkBroadcastInfo, 60000);

    var hostedChannel = model.get('hostModeTarget');
    var channel = hostedChannel ? hostedChannel : model;

    debug.log('Check Channel Title/Game');

    bttv.TwitchAPI.get('channels/' + channel.id, {}, { version: 3 }).done(function(d) {
        if (d.game) {
            channel.set('rollbackData.game', d.game);
            channel.set('game', d.game);
        }

        if (d.status) {
            channel.set('rollbackData.status', d.status);
            channel.set('status', d.status);

            if (!hostedChannel) {
                var $title = $('#broadcast-meta .title');

                if ($title.data('status') !== d.status) {
                    $title.data('status', d.status);

                    d.status = d.status.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    d.status = bttv.chat.templates.linkify(d.status);

                    $title.html(d.status);
                }
            }
        }

        if (d.views) {
            channel.set('rollbackData.views', d.views);
            channel.set('views', d.views);
        }

        if (d.followers && channel.get('followers')) {
            channel.get('followers').set('total', d.followers);
        }
    }).always(function() {
        setTimeout(checkBroadcastInfo, 60000 + Math.random() * 5000);
    });
};

},{"../helpers/debug":48}],24:[function(require,module,exports){
var debug = require('../helpers/debug'),
    vars = require('../vars');

var checkFollowing = module.exports = function() {
    debug.log('Check Following List');

    if ($('body#chat').length || $('body[data-page="ember#chat"]').length || !vars.userData.isLoggedIn) return;

    // old nav
    if (!$('#bttv-small-nav-count').length) {
        var $sbcount = $('<div/>');
        $sbcount.addClass('js-total');
        $sbcount.attr('id', 'bttv-small-nav-count');
        $sbcount.insertBefore('#small_nav li[data-name="following"] a[href="/directory/following"] .filter_icon:first');
    }

    var fetchFollowing = function(callback, followingList, followingNames, offset) {
        followingList = followingList || [];
        followingNames = followingNames || [];
        offset = offset || 0;

        bttv.TwitchAPI.get('streams/followed?stream_type=live&limit=100&offset=' + offset, {}, { auth: true }).done(function(d) {
            if (!d.streams || !d.streams.length) return callback(followingList);

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
                return;
            }

            callback(followingList);
        }).fail(function() {
            callback(followingList);
        });
    };

    fetchFollowing(function(streams) {
        if (!streams) {
            streams = [];
        }

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
                if (vars.userData.isLoggedIn && vars.liveChannels.indexOf(channel.name) === -1 && bttv.settings.get('followingNotifications') === true) {
                    bttv.TwitchAPI.get('users/' + encodeURIComponent(vars.userData.name) + '/follows/channels/' + encodeURIComponent(channel.name)).done(function(follow) {
                        if (follow.notifications === false) return;

                        debug.log(channel.name + ' is now streaming');
                        if (channel.game === null) channel.game = 'on Twitch';
                        bttv.notify(channel.display_name + ' just started streaming ' + channel.game + '.\nClick here to head to ' + channel.display_name + '\'s channel.', {
                            title: channel.display_name + ' is Now Streaming',
                            url: channel.url,
                            image: channel.logo,
                            tag: 'channel_live_' + channel.name,
                            expires: 600000
                        });
                    });
                }
            });
            vars.liveChannels = channels;
        }

        // old nav
        if (!$('#nav_personal li[data-name="following"] a[href="/directory/following"] .js-total').length) {
            $('#nav_personal li[data-name="following"] a[href="/directory/following"]').append('<span class="total_count js-total" style="display: none;"></span>');
        }

        $('#left_col li[data-name="following"] a[href="/directory/following"] .js-total').text(streams.length);
        $('#left_col li[data-name="following"] a[href="/directory/following"] .js-total').css('display', 'inline');

        // new nav
        if (!$('#bttv-follow-count').length) {
            var $count = $('<div/>');
            $count.addClass('js-total');
            $count.attr('id', 'bttv-follow-count');
            $count.insertBefore('.warp a.warp__tipsy[data-tt_content="directory_following"] figure');
        }

        $('#bttv-follow-count').text(streams.length);
        $('#bttv-follow-count').css('display', 'inline');

        setTimeout(checkFollowing, 60000 + Math.random() * 5000);
    });
};

},{"../helpers/debug":48,"../vars":69}],25:[function(require,module,exports){
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
                bttv.notify(sender + ' just sent you a Message!\nClick here to view it.', {
                    title: 'Twitch Message Received',
                    url: url,
                    image: avatar,
                    tag: 'new_message_' + messageId
                });
            });
        });
    };

    setInterval(checkOther, 30000 + Math.random() * 5000);
    checkOther();
};

},{"../helpers/debug":48}],26:[function(require,module,exports){
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
        $('body').append('<style>#nav_games, #nav_streams, #nav_related_streams, .js-recommended-channels { display: none !important; }</style>');
    }
};

},{"../helpers/debug":48,"../helpers/element":49}],27:[function(require,module,exports){
var chatStore = require('../chat/store');
var chatTemplates = require('../chat/templates');
var chatHelpers = require('../chat/helpers');
var colors = require('../helpers/colors');
var keyCodes = require('../keycodes');
var store = require('../chat/store');

function Conversations(timeout) {
    timeout = timeout || 0;

    if (bttv.settings.get('disableWhispers')) {
        $('.conversations-content').hide();
        return;
    }

    if (!(this instanceof Conversations)) return new Conversations(0);

    var $conversations = $('.conversations-content');

    if (!$conversations.length) {
        setTimeout(function() {
            return new Conversations(2 * timeout);
        }, 2 * timeout);
        return;
    }

    var _self = this;

    var watcher = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName) _self.updateTitle(mutation);
            var el, subEls, len = mutation.addedNodes.length;

            for (var i = 0; i < len; i++) {
                el = mutation.addedNodes[i];
                if (!el.querySelector) return;

                if ($(el).hasClass('conversation-window')) _self.newConversation(el);

                _self.messageParser(el);

                subEls = el.querySelectorAll('.conversation-chat-line');
                for (var j = 0; j < subEls.length; j++) {
                    _self.messageParser(subEls[j]);
                }
            }
        });
    });

    watcher.observe($conversations[0], { childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
}

Conversations.prototype.messageParser = function(element) {
    var from = element.querySelector('.from');
    var message = element.querySelector('.message');

    if (!from || !message) return;

    var $element = $(element);

    if ($element.hasClass('bttv-parsed-message')) return;
    $element.addClass('bttv-parsed-message');

    from.style.color = this.usernameRecolor(from.style.color);
    // message.innerHTML = this.emoticonize(message.innerHTML);

    this.scrollDownParent(element);
};

Conversations.prototype.scrollDownParent = function(element) {
    var container = $(element).parents('.conversation-content')[0];

    setTimeout(function() {
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }, 500);
};

Conversations.prototype.emoticonize = function(message) {
    if (bttv.settings.get('bttvEmotes') === false) return message;

    var parts = message.split(' ');
    var test;
    var emote;

    for (var i = 0; i < parts.length; i++) {
        test = parts[i].replace(/(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g, '');
        emote = null;

        if (chatStore.bttvEmotes.hasOwnProperty(parts[i])) {
            emote = chatStore.bttvEmotes[parts[i]];
        } else if (chatStore.bttvEmotes.hasOwnProperty(test)) {
            emote = chatStore.bttvEmotes[test];
        }

        if (
            emote &&
            emote.urlTemplate &&
            (emote.imageType === 'png' || (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') === true))
        ) {
            parts[i] = chatTemplates.bttvEmoticonize(parts[i], emote);
        }
    }

    return parts.join(' ');
};

Conversations.prototype.usernameRecolor = function(color) {
    var matcher = color.match(/rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/);

    if (!matcher) return color;

    return chatHelpers.calculateColor(colors.getHex({
        r: matcher[1],
        g: matcher[2],
        b: matcher[3]
    }));
};

Conversations.prototype.newConversation = function(element) {
    var _self = this;
    var $chatInput = $(element).find('.chat_text_input');
    var name = $(element).find('.conversation-header-name').text().toLowerCase();

    function storeMessage(message) {
        if (!bttv.settings.get('chatLineHistory')) return;
        if (store.whisperHistory[name]) {
            if (store.whisperHistory[name].indexOf(message) !== -1) {
                store.whisperHistory[name].splice(store.whisperHistory[name].indexOf(message), 1);
            }
            store.whisperHistory[name].unshift(message);
        } else {
            store.whisperHistory[name] = [message];
        }
    }

    function loadHistory(e) {
        $chatInput = $(element).find('.chat_text_input');
        if (!bttv.settings.get('chatLineHistory')) return;
        if (!store.whisperHistory[name]) return;
        var historyIndex = store.whisperHistory[name].indexOf($chatInput.val().trim());
        if (e.keyCode === keyCodes.UpArrow) {
            if (historyIndex >= 0) {
                if (store.whisperHistory[name][historyIndex + 1]) {
                    $chatInput.val(store.whisperHistory[name][historyIndex + 1]);
                }
            } else {
                if ($chatInput.val().trim().length) {
                    store.whisperHistory[name].unshift($chatInput.val().trim());
                    $chatInput.val(store.whisperHistory[name][1]);
                } else {
                    $chatInput.val(store.whisperHistory[name][0]);
                }
            }
        } else if (e.keyCode === keyCodes.DownArrow) {
            if (historyIndex >= 0) {
                if (store.whisperHistory[name][historyIndex - 1]) {
                    $chatInput.val(store.whisperHistory[name][historyIndex - 1]);
                } else {
                    $chatInput.val('');
                }
            }
        }
    }

    $chatInput.on('keydown', function(e) {
        if (e.which === keyCodes.Enter) {
            var val = $chatInput.val().trim();
            if (bttv.settings.get('chatLineHistory') === true) {
                storeMessage(val);
            }
        }
        loadHistory(e);
    });

    $(element).find('.send-button').on('click', function() {
        var val = $chatInput.val().trim();
        if (bttv.settings.get('chatLineHistory') === true) {
            storeMessage(val);
        }
    });

    $(element).find('.svg-close').on('click', function() {
        setTimeout(function() {
            _self.updateTitle();
        }, 500);
    });

    this.addBadges(element);
};

Conversations.prototype.addBadges = function(element) {
    var $element = $(element);
    var name = $element.find('.conversation-header-name').text().toLowerCase();
    if (name in store.__badges) {
        var type = store.__badges[name];
        var badgeTemplate = chatTemplates.badge('bttv-' + type, '', store.__badgeTypes[type].description);
        $element.find('.badges').prepend(badgeTemplate);
    }
};

Conversations.prototype.updateTitle = function(m) {
    if (!bttv.settings.get('unreadInTitle')) return;

    if (!m || $(m.target).is('.conversation-window, .has-unread, .incoming')) {
        var title = document.title;
        var hasUnreads = $('.has-unread').length;
        if (hasUnreads) {
            var numOfUnreads = 0;
            var $headers = $('.conversation-unread-count');
            for (var i = 0; i < $headers.length; i++) {
                numOfUnreads += Number($($headers[i]).text());
            }
            if (!numOfUnreads) return;
            numOfUnreads = '(' + numOfUnreads + ') ';
            if (title.charAt(0) === '(') {
                document.title = document.title.replace(/\(\d+\)\s/, numOfUnreads);
            } else {
                document.title = numOfUnreads + title;
            }
        } else {
            if (title.charAt(0) === '(') {
                document.title = document.title.replace(/\(\d+\)\s/, '');
            }
        }
    }
};

module.exports = Conversations;

},{"../chat/helpers":5,"../chat/store":8,"../chat/templates":10,"../helpers/colors":47,"../keycodes":52}],28:[function(require,module,exports){
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
        $('#right_col').remove();
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

    $('#bttvNicknamesBackupButton').click(function() {
        bttv.settings.nicknamesBackup();
    });

    $('#bttvNicknamesImportInput').change(function() {
        bttv.settings.nicknamesImport(this);
    });

    $('#bttvNoSSLImportInput').click(function() {
        bttv.settings.save('importNonSsl', true);
        bttv.settings.popupImport();
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
            $(tab).children('iframe').attr('src', 'https://manage.betterttv.net/channel');
        }

        $(tab).fadeIn();
        $(this).parent('li').addClass('active');
    });
};

},{"../templates/settings-panel":67}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
var template = require('../templates/custom-timeouts');
var vars = require('../vars');
var helpers = require('../chat/helpers');

module.exports = function(user, $event) {
    if (!helpers.isModerator(vars.userData.name)) {
        return;
    }

    $('body').off('.custom-timeouts');
    $('.chat-line').removeClass('bttv-user-locate');
    $('#bttv-custom-timeout-contain').remove();

    $('.ember-chat .chat-room').append(template());

    $('#bttv-custom-timeout-contain').css({
        'top': $event.offset().top + ($event.height() / 2) - ($('#bttv-custom-timeout-contain').height() / 2),
        'left': $('.ember-chat .chat-room').offset().left - $('#bttv-custom-timeout-contain').width() + $('.ember-chat .chat-room').width() - 20
    });

    var action = {type: 'cancel', length: 0, text: 'CANCEL'};

    $('body').on('mousemove.custom-timeouts', function(e) {
        var offset = e.pageY - $('#bttv-custom-timeout-contain').offset().top;
        var offsetx = e.pageX - $('#bttv-custom-timeout-contain').offset().left;
        var amount = 200 - offset;
        var time = Math.floor(Math.pow(1.5, (amount - 20) / 7) * 60);

        var humanTime = Math.floor(time / 60) + ' Minutes';
        if (Math.floor(time / 60 / 60) > 0) humanTime = Math.floor(time / 60 / 60) + ' Hours';
        if (Math.floor(time / 60 / 60 / 24) > 0) humanTime = Math.floor(time / 60 / 60 / 24) + ' Days';

        if (amount > 0 && amount <= 20) action = {type: 'time', length: 2, text: 'PURGE'};
        if (amount >= 180 && amount < 200) action = {type: 'ban', length: 0, text: 'BAN'};
        if (amount > 20 && amount < 180) action = {type: 'time', length: time, text: humanTime};
        if (amount > 200 || amount < 0 || offsetx > 80 || offsetx < 0) action = {type: 'cancel', length: 0, text: 'CANCEL'};

        $('#bttv-custom-timeout-contain .text').text(action.text);
        $('#bttv-custom-timeout-contain .cursor').css('top', offset);
    });

    $('body').on('mousedown.custom-timeouts', function(e) {
        if (e.which === 3 || e.shiftKey) return;

        if (action.type === 'ban') helpers.ban(user);
        if (action.type === 'time') helpers.timeout(user, action.length);

        $('#bttv-custom-timeout-contain').remove();
        $('body').off('.custom-timeouts');
        $('.chat-line').removeClass('bttv-user-locate');
    });

    $('.chat-line[data-sender="' + user + '"]').addClass('bttv-user-locate');
};

},{"../chat/helpers":5,"../templates/custom-timeouts":62,"../vars":69}],31:[function(require,module,exports){
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

},{"../helpers/debug":48,"./handle-background":38}],32:[function(require,module,exports){
var debug = require('../helpers/debug'),
    vars = require('../vars');

module.exports = function dashboardChannelInfo() {
    if ($('#dash_main').length) {
        debug.log('Updating Dashboard Channel Info');

        bttv.TwitchAPI.get('streams/' + bttv.getChannel()).done(function(a) {
            if (a.stream) {
                // lol, a function in window context Twitch uses to update viewer count
                // and we have to use this because they now added viewer count hiding
                window.updateLiveViewers(a.stream.viewers);

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
            $.getJSON('/' + bttv.getChannel() + '/dashboard/revenue/summary_data', function(data) {
                if (!data.data) return;

                if (data.data.total_subscriptions === 0) {
                    vars.dontCheckSubs = true;
                    return;
                }

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

                $('#subs_count span').text(Twitch.display.commatize(data.data.total_subscriptions));
            });
        }

        setTimeout(dashboardChannelInfo, 60000 + Math.random() * 5000);
    }
};

},{"../helpers/debug":48,"../vars":69}],33:[function(require,module,exports){
var debug = require('../helpers/debug');

module.exports = function() {
    if (
        bttv.settings.get('showDirectoryLiveTab') === true &&
        $('h2.title:contains("Following")').length &&
        $('a.active:contains("Overview")').length
    ) {
        debug.log('Changing Directory View');

        $('a[href="/directory/following/live"]').click();
    }
};

},{"../helpers/debug":48}],34:[function(require,module,exports){
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

},{"../chat/helpers":5,"../templates/embedded-poll":63}],35:[function(require,module,exports){
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

},{"../helpers/debug":48}],36:[function(require,module,exports){
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

},{"../helpers/debug":48}],37:[function(require,module,exports){
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

},{"../helpers/debug":48}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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

},{"../helpers/debug":48}],40:[function(require,module,exports){
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
        $hostButton.insertBefore('#channel .channel-actions .js-options');
        $hostButton.click(function() {
            var action = $hostButton.text();

            var conn = tmi.tmiSession._connections.aws || tmi.tmiSession._connections.prod || tmi.tmiSession._connections.main;

            if (action === 'Unhost') {
                try {
                    conn._send('PRIVMSG #' + vars.userData.name + ' :/unhost');
                    helpers.serverMessage('BetterTTV: We sent a /unhost to your channel.');
                    $hostButton.children('span').text('Host');
                } catch (e) {
                    helpers.serverMessage('BetterTTV: There was an error unhosting the channel. You may need to unhost it from your channel.');
                }
            } else {
                try {
                    conn._send('PRIVMSG #' + vars.userData.name + ' :/host ' + bttv.getChannel());
                    helpers.serverMessage('BetterTTV: We sent a /host to your channel. Please note you can only host 3 times per 30 minutes.');
                    $hostButton.children('span').text('Unhost');
                } catch (e) {
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

},{"../vars":69}],41:[function(require,module,exports){
var debounce = require('lodash.debounce');

exports.enablePreview = function() {
    var enter = debounce(function() {
        var url = this.href;

        $.get('https://api.betterttv.net/2/image_embed/' + encodeURIComponent(url)).done(function(data) {
            if (!$(this).length || !$(this).is(':hover')) return;

            $(this).tipsy({
                trigger: 'manual',
                gravity: $.fn.tipsy.autoNS,
                html: true,
                title: function() { return data; }
            });
            $(this).tipsy('show');
        }.bind(this));
    }, 250);

    var leave = function() {
        enter.cancel();
        $(this).tipsy('hide');
        $('div.tipsy').remove();
    };

    $(document).on({
        mouseenter: enter,
        mouseleave: leave
    }, 'a.chat-preview');
};

exports.disablePreview = function() {
    $(document).off('mouseenter mouseleave mousemove', 'a.chat-preview');
};

},{"lodash.debounce":112}],42:[function(require,module,exports){
var vars = require('../vars');
var debug = require('../helpers/debug');
var escapeRegExp = require('../helpers/regex').escapeRegExp;

exports.blacklistFilter = function(data) {
    var blacklistKeywords = [];
    var blacklistUsers = [];

    var keywords = bttv.settings.get('blacklistKeywords');
    var phraseRegex = /\{.+?\}/g;

    var testCases;
    try {
        testCases = keywords.match(phraseRegex);
    } catch (e) {
        debug.log(e);
        return false;
    }

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
        if (blacklistRegex.test(data.message) && vars.userData.name !== data.from) {
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

    var testCases;
    try {
        testCases = extraKeywords.match(phraseRegex);
    } catch (e) {
        debug.log(e);
        return false;
    }

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
        if (vars.userData.isLoggedIn && vars.userData.name !== data.from && wordRegex.test(data.message)) {
            if (bttv.settings.get('desktopNotifications') === true && bttv.chat.store.activeView === false) {
                bttv.notify('You were mentioned by {{name}} in {{channel}}\'s channel: {{message}}'
                    .replace('{{name}}', data.from)
                    .replace('{{channel}}', bttv.chat.helpers.lookupDisplayName(bttv.getChannel()))
                    .replace('{{message}}', data.message.substr(0, 100)));
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

},{"../features/audible-feedback":14,"../helpers/debug":48,"../helpers/regex":51,"../vars":69}],43:[function(require,module,exports){
module.exports = function(user, $event) {
    // adds in user messages from chat
    user.messages = $.makeArray($('.chat-room .chat-messages .chat-line[data-sender="' + user.name + '"]')).reverse();

    var top = Math.max(0, Math.min($event.offset().top + 25, window.innerHeight - 200));
    var left = Math.max(0, Math.min($event.offset().left - 25, window.innerWidth - 290));
    var template = bttv.chat.templates.moderationCard(user, top, left);
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

        // prompt returns null on cancel
        if (nickname === null) return;

        // empty string = reset
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

    $modCard.draggable({ handle: '.drag-handle', containment: 'body', el: $modCard });

    $('.chat-line[data-sender="' + user.name + '"]').addClass('bttv-user-locate');
    $modCard.on('remove', function() {
        $('.chat-line[data-sender="' + user.name + '"]').removeClass('bttv-user-locate');
    });
};

},{}],44:[function(require,module,exports){
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
            emote.type = 'global';

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
                    if ($emote && $emote.attr('alt')) {
                        var raw = $emote.attr('alt');
                        if (bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                            return 'Emote: ' + raw + '<br />Channel: ' + bttv.TwitchEmoteIDToChannel[$emote.data('id')];
                        } else if (!$emote.data('channel') && $emote.data('type')) {
                            return 'Emote: ' + raw + '<br />BetterTTV ' + $emote.data('type').capitalize() + ' Emote';
                        } else if ($emote.data('channel')) {
                            return 'Emote: ' + raw + '<br />Channel: ' + $emote.data('channel') + '<br />BetterTTV ' + $emote.data('type').capitalize() + ' Emote';
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

},{"../helpers/debug":48,"../vars":69}],45:[function(require,module,exports){
var highlightTemplate = require('../templates/pinned-highlight');

// only pin up to 10 messages
var maximumPinCount = 10;

module.exports = function(message) {
    if (!bttv.settings.get('pinnedHighlights')) return;

    var $highlightContainer = $('#bttv-pin-container');

    // Push pin container to DOM if it doesn't exist
    if (!$highlightContainer.length) {
        $highlightContainer = $('<div id="bttv-pin-container">').appendTo($('.ember-chat .chat-room'));
    }

    var timeSent = message.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2');

    var $nextHighlight = $(highlightTemplate({ time: timeSent, displayName: message.tags['display-name'] || message.from, message: message.message }));

    // If the next highlight will bump the container over the limit, remove the oldest highlight
    if ($highlightContainer.children().length + 1 > maximumPinCount) {
        $highlightContainer.children().first().remove();
    }

    // User manually closes the highlight
    $nextHighlight.children('.close').on('click', function() {
        $nextHighlight.remove();
    });

    // Append the highlight to the container
    $highlightContainer.append($nextHighlight);

    if (bttv.settings.get('timeoutHighlights')) {
        setTimeout(function() {
            $nextHighlight.remove();
        }, 60000);
    }
};

},{"../templates/pinned-highlight":65}],46:[function(require,module,exports){
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

},{"../helpers/debug":48}],47:[function(require,module,exports){
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
        switch (max) {
            case r: h = Math.min(Math.max(0, (g - b) / d + (g < b ? 6 : 0)), 6); break;
            case g: h = Math.min(Math.max(0, (b - r) / d + 2), 6); break;
            case b: h = Math.min(Math.max(0, (r - g) / d + 4), 6); break;
        }
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

},{}],48:[function(require,module,exports){
module.exports = {
    log: function() {
        if (!window.console || !console.log || !bttv.settings.get('consoleLog') === true) return;
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console.log, ['BTTV:'].concat(args));
    }
};

},{}],49:[function(require,module,exports){
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

},{}],50:[function(require,module,exports){
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
},{}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
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

},{}],53:[function(require,module,exports){
module.exports = function(data) {
    return {
        // Developers and Supporters
        'night': { mod: true, tagType: 'broadcaster', tagName: '<span style="color:#FFD700;">Creator</span>', color: '#000;text-shadow: 0 0 10px #FFD700' },
        // Donations
        'gspwar': { mod: false, tagType: 'admin', tagName: 'EH?' },
        'nightmare': { mod: false, tagType: 'broadcaster', tagName: 'MLG' },
        'sour': { mod: false, tagType: 'teal', tagName: '<span style="color:#d00162;">Saucy</span>', color: data.color + ';text-shadow: 0 0 10px #FFD700' },
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
        'sauce': { mod: true, tagType: 'purple', tagName: 'Drippin\' Dat' },
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

},{}],54:[function(require,module,exports){
var chat = bttv.chat, vars = bttv.vars;
var splitChat = require('./features/split-chat'),
    darkenPage = require('./features/darken-page'),
    handleBackground = require('./features/handle-background'),
    flipDashboard = require('./features/flip-dashboard'),
    cssLoader = require('./features/css-loader'),
    hostButton = require('./features/host-btn-below-video'),
    anonChat = require('./features/anon-chat'),
    betterViewerList = require('./features/better-viewer-list'),
    handleTwitchChatEmotesScript = require('./features/handle-twitchchat-emotes');
var displayElement = require('./helpers/element').display,
    removeElement = require('./helpers/element').remove,
    imagePreview = require('./features/image-preview');

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
        default: false,
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

                var html5 = '';
                if (window.navigator.userAgent.indexOf('Chrome') > -1) {
                    html5 = '&html5';
                }

                $('div.tipsy').remove();

                var $this = $(this);
                setTimeout(function() {
                    if (!$this.is(':hover')) return;

                    $('div.tipsy').remove();
                    $this.tipsy({
                        trigger: 'manual',
                        gravity: $.fn.tipsy.autoNS,
                        html: true,
                        opacity: 1,
                        title: function() { return '<iframe src="https://player.twitch.tv/?channel=' + chan + '&!branding&!showInfo&autoplay&volume=0.1' + html5 + '" style="border: none;" width="320" height="208"></iframe><style>.tipsy-inner{max-width:320px;}</style>'; }
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
                    var frameSrc = $('#video-1').children('iframe').eq(0).attr('src');
                    $('#video-1').children('iframe').eq(0).attr('src', frameSrc + '&autoplay=false');
                    $('#video-1').bind('DOMNodeInserted DOMNodeRemoved', function() {
                        frameSrc = $('#video-1').children('iframe').eq(0).attr('src');
                        $('#video-1').children('iframe').eq(0).attr('src', frameSrc + '&autoplay=false');
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
        name: 'Following Notifications',
        description: 'BetterTTV will notify you when channels you follow go live',
        default: true,
        storageKey: 'followingNotifications'
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
        name: 'Hide Spam Messages',
        description: 'Hides known spam messages. Click on the message to reveal it',
        default: true,
        storageKey: 'hideSpam'
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
        storageKey: 'highlightFeedback'
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
        name: 'Tab Completion Tooltip',
        description: 'Shows a tooltip with suggested names when using tab completion',
        default: false,
        storageKey: 'tabCompletionTooltip'
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
    }
];

},{"./features/anon-chat":13,"./features/better-viewer-list":16,"./features/css-loader":29,"./features/darken-page":31,"./features/flip-dashboard":35,"./features/handle-background":38,"./features/handle-twitchchat-emotes":39,"./features/host-btn-below-video":40,"./features/image-preview":41,"./features/split-chat":46,"./helpers/element":49}],55:[function(require,module,exports){
var debug = require('./helpers/debug');
var saveAs = require('./helpers/filesaver').saveAs;

function Settings() {
    this._settings = {};
    this.prefix = 'bttv_';
}

Settings.prototype._parseSetting = function(value) {
    if (value === null) {
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
        if (e.data) {
            if (typeof e.data !== 'string') return;

            var data = e.data.split(' ');
            var key, value;
            if (data[0] === 'bttv_setting') {
                if (e.origin.split('//')[1] !== window.location.host) return;
                key = data[1];
                value = _self._parseSetting(data[2]);

                _self.save(key, value);
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
                } catch (e) {
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

Settings.prototype.nicknamesBackup = function() {
    var download = bttv.storage.getObject('nicknames');

    download = new Blob([JSON.stringify(download)], {
        type: 'text/plain;charset=utf-8;'
    });

    saveAs(download, 'bttv_nicknames.backup');
};

Settings.prototype.nicknamesImport = function(input) {
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
            var nicknames = JSON.parse(data);
            var currentNicknames = bttv.storage.getObject('nicknames');
            Object.keys(nicknames).forEach(function(name) {
                currentNicknames[name] = nicknames[name];
            });

            bttv.storage.putObject('nicknames', currentNicknames);

            bttv.notify('BetterTTV imported nicknames');
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
            // if (window.__bttvga) __bttvga('send', 'event', 'BTTV', 'Change Setting: ' + setting + '=' + value);

            if (window !== window.top) window.parent.postMessage('bttv_setting ' + setting + ' ' + value, window.location.protocol + '//' + window.location.host);

            this.set(setting, value);

            if (this._settings[setting].toggle) this._settings[setting].toggle(value);
        } catch (e) {
            debug.log(e);
        }
    }
};

Settings.prototype.popup = function() {
    var settingsUrl = window.location.protocol + '//' + window.location.host + '/directory?bttvSettings=true';
    window.open(settingsUrl, 'BetterTTV Settings', 'width=800,height=500,top=500,left=800,scrollbars=no,location=no,directories=no,status=no,menubar=no,toolbar=no,resizable=no');
};

module.exports = Settings;

},{"./helpers/debug":48,"./helpers/filesaver":50,"./settings-list":54,"./templates/setting-switch":66}],56:[function(require,module,exports){
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
        } catch (e) {
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
    if (!this.exists(item)) [];
    return JSON.parse(this.get(item));
};

Storage.prototype.getObject = function(item) {
    if (!this.exists(item)) return {};
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

},{"./helpers/debug":48,"cookies-js":81}],57:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<a id=\"bvl-button\" title=\"Better Viewer List\" class=\"button glyph-only float-left\"><svg version=\"1.1\" viewbox=\"0 0 16 16\" width=\"16px\" height=\"16px\" class=\"svg-betterviewerlist\"><path clip-rule=\"evenodd\" d=\"M6,14v-2h8v2H6z M6,8h8v2H6V7z M6,4h8v2H6V3z M6,0h8v2H6V3z M2,12h2v2H2V11z M2,8h2v2H2V7z M2,4h2v2H2V3z M2,0h2v2H2V11z\"></path></svg></a>");;return buf.join("");
};module.exports=template;
},{}],58:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"bvl-panel\" class=\"chatters-view\"><div class=\"drag_handle chat-header\"><a class=\"button glyph-only close-button left\"><svg viewbox=\"0 0 16 16\" width=\"16px\" height=\"16px\" class=\"svg-close\"><path clip-rule=\"evenodd\" d=\"M6.4,8 L1.8,3.3 L1,2.5 L2.5,1 L3.3,1.8 L8,6.4 L12.67,1.8 L13.4,1 L15,2.5 L14.2,3.3 L9.5,8 L14.2,12.67 L15,13.4 L13.4,15 L12.67,14.2 L8,9.5 L3.3,14.2 L2.5,15 L1,13.4 L1.8,12.67 L6.4,8 Z\" fill-rule=\"evenodd\"></path></svg></a><a class=\"button glyph-only refresh-button right\"><svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewbox=\"0 0 16 16\"><path id=\"spin\" d=\"M2.083,9H0.062H0v5l1.481-1.361C2.932,14.673,5.311,16,8,16c4.08,0,7.446-3.054,7.938-7h-2.021 c-0.476,2.838-2.944,5-5.917,5c-2.106,0-3.96-1.086-5.03-2.729L5.441,9H2.083z\"></path><g transform=\"translate(16, 16) rotate(180)\"><use xlink:href=\"#spin\"></use></g></svg></a><p class=\"room-title\">Viewer List</p></div><div class=\"status\"></div><input type=\"text\" autocomplete=\"off\" placeholder=\"Filter Viewers\" class=\"filter text\"/><svg viewbox=\"0 0 16 16\" width=\"16\" height=\"16\" class=\"bvl-resizer\"><path clip-rule=\"evenodd\" d=\"M12,12h2v2H12V11z M12,8h2v2H12V11z M12,4h2v2H12V11z M8,8h2v2H8V11z M8,12h2v2H8V11z M4,12h2v2H4V11z\"></path></svg></div>");;return buf.join("");
};module.exports=template;
},{}],59:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"bttv-channel-state-contain\"><div title=\"Robot9000 Enabled\" class=\"r9k\"><svg width=\"26px\" height=\"22px\" version=\"1.1\" viewBox=\"0 0 26 22\" x=\"0px\" y=\"0px\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" fill=\"#d3d3d3\" stroke=\"none\" d=\"M2.98763607,10.2134233 C2.98763607,9.87789913 2.97951867,9.53696837 2.96328363,9.19062081 C2.94704859,8.84427325 2.93351959,8.3951105 2.92269623,7.84311909 L3.97796866,7.84311909 L3.97796866,9.25556065 L4.01043858,9.25556065 C4.08620211,9.04991679 4.1944341,8.85239341 4.33513779,8.66298459 C4.47584149,8.47357577 4.64630687,8.30311039 4.84653905,8.15158334 C5.04677123,8.00005628 5.27947001,7.87829529 5.54464235,7.78629672 C5.8098147,7.69429815 6.11015847,7.64829956 6.44568266,7.64829956 C6.74873677,7.64829956 7.01390514,7.68076916 7.24119573,7.74570932 L7.03014124,8.80098176 C6.88943755,8.74686495 6.68379677,8.71980695 6.41321274,8.71980695 C6.00192502,8.71980695 5.65017106,8.79827515 5.35794031,8.95521388 C5.06570956,9.11215262 4.82218758,9.3123818 4.62736708,9.55590742 C4.43254658,9.79943305 4.2891392,10.0618956 4.19714063,10.343303 C4.10514206,10.6247104 4.05914347,10.8952904 4.05914347,11.155051 L4.05914347,15.4410806 L2.98763607,15.4410806 L2.98763607,10.2134233 Z M14.1735239,7.30736539 C14.1735239,6.93937111 14.1112905,6.60385195 13.9868218,6.30079784 C13.8623532,5.99774372 13.6864762,5.73798695 13.4591856,5.52151973 C13.231895,5.30505251 12.9613151,5.13458713 12.6474376,5.01011847 C12.3335601,4.88564982 11.9872178,4.82341643 11.6084001,4.82341643 C11.2295825,4.82341643 10.8832401,4.88564982 10.5693626,5.01011847 C10.2554852,5.13458713 9.98490519,5.30505251 9.75761461,5.52151973 C9.53032403,5.73798695 9.35444705,5.99774372 9.22997839,6.30079784 C9.10550974,6.60385195 9.04327635,6.93937111 9.04327635,7.30736539 C9.04327635,7.67535967 9.10550974,8.01087883 9.22997839,8.31393294 C9.35444705,8.61698705 9.53032403,8.87944962 9.75761461,9.10132853 C9.98490519,9.32320743 10.2554852,9.49367281 10.5693626,9.61272978 C10.8832401,9.73178676 11.2295825,9.79131435 11.6084001,9.79131435 C11.9872178,9.79131435 12.3335601,9.73178676 12.6474376,9.61272978 C12.9613151,9.49367281 13.231895,9.32320743 13.4591856,9.10132853 C13.6864762,8.87944962 13.8623532,8.61698705 13.9868218,8.31393294 C14.1112905,8.01087883 14.1735239,7.67535967 14.1735239,7.30736539 L14.1735239,7.30736539 Z M13.0046067,10.5056526 L12.9721368,10.4731827 C12.7881397,10.603063 12.5419119,10.7004718 12.2334461,10.765412 C11.9249803,10.8303521 11.6408713,10.8628217 11.3811107,10.8628217 C10.8832361,10.8628217 10.4205443,10.7735304 9.99302154,10.5949449 C9.56549877,10.4163594 9.19480422,10.1701317 8.88092674,9.85625419 C8.56704927,9.54237672 8.3208215,9.16897636 8.14223604,8.73604192 C7.96365058,8.30310747 7.87435919,7.82688672 7.87435919,7.30736539 C7.87435919,6.77702069 7.96635638,6.29538835 8.15035352,5.8624539 C8.33435066,5.42951946 8.59410743,5.0561191 8.92963162,4.74224162 C9.26515582,4.42836415 9.66020257,4.18484218 10.1147837,4.0116684 C10.5693649,3.83849462 11.0672321,3.75190903 11.6084001,3.75190903 C12.1495682,3.75190903 12.6474353,3.83849462 13.1020165,4.0116684 C13.5565976,4.18484218 13.9516444,4.42836415 14.2871686,4.74224162 C14.6226928,5.0561191 14.8824496,5.42951946 15.0664467,5.8624539 C15.2504438,6.29538835 15.342441,6.77702069 15.342441,7.30736539 C15.342441,7.9459437 15.247738,8.50333843 15.0583292,8.97956632 C14.8689204,9.45579421 14.6335158,9.92660336 14.3521084,10.3920079 L11.251231,15.4410806 L9.87125933,15.4410806 L13.0046067,10.5056526 Z M18.3621437,11.2686958 L21.95007,7.84311909 L23.5573311,7.84311909 L19.7745853,11.3174006 L23.9632051,15.4410806 L22.3072391,15.4410806 L18.3621437,11.4472803 L18.3621437,15.4410806 L17.2906363,15.4410806 L17.2906363,3.16745045 L18.3621437,3.16745045 L18.3621437,11.2686958 Z\"></path></svg></div><div title=\"Subscribers-Only Mode Enabled\" class=\"subs-only\"><svg width=\"26px\" height=\"22px\" version=\"1.1\" viewBox=\"0 0 26 22\" x=\"0px\" y=\"0px\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" fill=\"#d3d3d3\" stroke=\"none\" d=\"M9.27481618,13.6268381 C9.27481619,15.0585936 21.1132816,15.0078128 21.1132816,13.6268381 C21.1132816,12.2458633 16.9215274,13.7446739 16.6289064,11.3913143 C16.3362854,9.03795478 17.8113514,9.06502765 17.8113514,7.74195776 C17.8113514,6.41888788 16.1631438,5.44732696 15.194049,5.3492647 C14.2249543,5.25120244 12.5834099,6.17624082 12.5834099,7.74195772 C12.5834099,9.30767461 13.8025847,9.44785699 13.6895682,11.3913143 C13.5765516,13.3347717 9.27481616,12.1950825 9.27481618,13.6268381 Z\"></path><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" fill=\"#d3d3d3\" stroke=\"none\" d=\"M9.05269623,4.02031837 C9.41269803,4.02031837 9.78602763,4.06698457 10.1726962,4.16031837 C10.5593648,4.25365217 10.8993614,4.41698387 11.1926962,4.65031837 L10.2326962,5.82031837 C10.0726954,5.68031767 9.88936393,5.57865202 9.68269623,5.51531837 C9.47602853,5.45198472 9.26603063,5.41365177 9.05269623,5.40031837 L9.05269623,6.99031837 L10.0126962,7.27031837 C10.4526984,7.40365237 10.8043616,7.62198352 11.0676962,7.92531837 C11.3310309,8.22865322 11.4626962,8.61364937 11.4626962,9.08031837 C11.4626962,9.43365347 11.3993635,9.74365037 11.2726962,10.0103184 C11.1460289,10.2769864 10.9726973,10.5036508 10.7526962,10.6903184 C10.5326951,10.876986 10.276031,11.0236512 9.98269623,11.1303184 C9.68936143,11.2369856 9.37936453,11.3069849 9.05269623,11.3403184 L9.05269623,12.0403184 L8.39269623,12.0403184 L8.39269623,11.3403184 C7.95269403,11.3403184 7.51436508,11.280319 7.07769623,11.1603184 C6.64102738,11.0403178 6.25603123,10.8303199 5.92269623,10.5303184 L6.98269623,9.34031837 C7.15603043,9.55365277 7.36602833,9.70531792 7.61269623,9.79531837 C7.85936413,9.88531882 8.11936153,9.94031827 8.39269623,9.96031837 L8.39269623,8.27031837 L7.66269623,8.05031837 C7.15602703,7.89031757 6.77103088,7.66531982 6.50769623,7.37531837 C6.24436158,7.08531692 6.11269623,6.68698757 6.11269623,6.18031837 C6.11269623,5.86698347 6.17602893,5.58365297 6.30269623,5.33031837 C6.42936353,5.07698377 6.59769518,4.86031927 6.80769623,4.68031837 C7.01769728,4.50031747 7.26102818,4.35365227 7.53769623,4.24031837 C7.81436428,4.12698447 8.09936143,4.05365187 8.39269623,4.02031837 L8.39269623,3.32031837 L9.05269623,3.32031837 L9.05269623,4.02031837 Z M8.39269623,5.43031837 C8.20602863,5.47031857 8.03936363,5.54031787 7.89269623,5.64031837 C7.74602883,5.74031887 7.67269623,5.89698397 7.67269623,6.11031837 C7.67269623,6.26365247 7.70269593,6.38365127 7.76269623,6.47031837 C7.82269653,6.55698547 7.89269583,6.62531812 7.97269623,6.67531837 C8.05269663,6.72531862 8.13269583,6.76031827 8.21269623,6.78031837 C8.29269663,6.80031847 8.35269603,6.81698497 8.39269623,6.83031837 L8.39269623,5.43031837 Z M9.05269623,9.94031837 C9.15269673,9.92031827 9.25436238,9.89198522 9.35769623,9.85531837 C9.46103008,9.81865152 9.55269583,9.77031867 9.63269623,9.71031837 C9.71269663,9.65031807 9.77769598,9.57865212 9.82769623,9.49531837 C9.87769648,9.41198462 9.90269623,9.31365227 9.90269623,9.20031837 C9.90269623,9.09365117 9.88436308,9.00365207 9.84769623,8.93031837 C9.81102938,8.85698467 9.76269653,8.79531862 9.70269623,8.74531837 C9.64269593,8.69531812 9.57269663,8.65198522 9.49269623,8.61531837 C9.41269583,8.57865152 9.32936333,8.54365187 9.24269623,8.51031837 L9.05269623,8.44031837 L9.05269623,9.94031837 Z\"></path></svg></div><div class=\"slow\"><div title=\"0 seconds\" class=\"slow-time\">0:00</div><svg width=\"26px\" height=\"22px\" version=\"1.1\" viewBox=\"0 0 26 22\" x=\"0px\" y=\"0px\" title=\"Slow Mode Enabled\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" fill=\"#d3d3d3\" stroke=\"none\" d=\"M17.1477712,15.2881724 C18.1841482,15.2990242 18.3714659,13.1141401 18.984666,13.0696235 C20.7929233,12.9383492 21.27411,12.5312339 22.0061575,11.9392359 C23.1373692,11.0244387 19.9060764,12.1089751 19.4762501,10.2570139 C19.0464238,8.40505269 20.0193482,10.024402 20.0193482,10.024402 C20.0193482,10.024402 21.8187185,4.26759557 15.5617966,4.00868857 C9.30487476,3.74978158 10.4161868,9.36314385 10.4161868,9.36314385 C10.4161868,9.36314385 11.2540951,8.34295601 11.2540951,9.63941257 C11.2540951,10.1964047 9.76901904,10.6570445 8.53287358,9.63941257 C7.29672813,8.62178061 8.11686902,7.37127839 7.67827778,6.69569265 C7.23968654,6.02010691 3.76038497,5.06926224 3.24213373,5.95824564 C2.72388249,6.84722904 5.76831809,8.74663617 5.96217543,9.63941257 C6.15603277,10.532189 7.03943787,12.1288651 7.49294803,12.5678492 C7.94645819,13.0068332 5.92939735,14.4797566 6.69153143,14.5326896 C7.45366552,14.5856225 9.47706304,12.9278239 10.0844223,12.7478364 C10.6917815,12.5678489 13.1392341,12.9471552 14.5871877,13.023578 C15.3550569,13.064106 16.1113943,15.2773206 17.1477712,15.2881724 Z M4.84344721,6.76429629 C5.04601701,6.76429629 5.21023228,6.60974074 5.21023228,6.41908681 C5.21023228,6.22843288 5.04601701,6.07387733 4.84344721,6.07387733 C4.6408774,6.07387733 4.47666213,6.22843288 4.47666213,6.41908681 C4.47666213,6.60974074 4.6408774,6.76429629 4.84344721,6.76429629 Z M11.7028228,7.36314163 C11.7326095,6.35178988 13.3449525,4.92929352 15.0963754,4.98088076 C16.8477983,5.032468 18.7948736,6.68625403 18.7749376,7.36314154 C18.7550016,8.04002904 16.952545,5.71526454 15.0963754,5.66059204 C13.2402058,5.60591954 11.673036,8.37449337 11.7028228,7.36314163 Z\"></path></svg></div></div>");;return buf.join("");
};module.exports=template;
},{}],60:[function(require,module,exports){
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
},{}],61:[function(require,module,exports){
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
},{}],62:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"bttv-custom-timeout-contain\"><div class=\"text\"></div><svg width=\"80px\" height=\"200px\" version=\"1.1\" viewBox=\"0 0 80 200\" x=\"0px\" y=\"0px\" class=\"back\"><rect id=\"purge-rect\" fill-opacity=\"0.303979846\" fill=\"#000000\" sketch:type=\"MSShapeGroup\" x=\"0\" y=\"0\" width=\"80\" height=\"20\"></rect><rect id=\"ban-rect\" fill-opacity=\"0.303979846\" fill=\"#000000\" sketch:type=\"MSShapeGroup\" x=\"0\" y=\"180\" width=\"80\" height=\"20\"></rect><path id=\"time-curve\" d=\"M-5.68434189e-14,19.8046875 C15.9905561,51.8248392 9.84960937,154.183594 80,180\" fill=\"none\" stroke-opacity=\"0.3\" stroke=\"#ACACAC\" sketch:type=\"MSShapeGroup\" transform=\"translate(40.000000, 99.902344) scale(-1, 1) translate(-40.000000, -99.902344) \"></path><path id=\"Ban\" d=\"M34.5654297,11.9848633 C34.5654297,12.5268582 34.4628917,13.005369 34.2578125,13.4204102 C34.0527333,13.8354513 33.7768572,14.1772448 33.4301758,14.4458008 C33.0200175,14.768068 32.5695825,14.9975579 32.0788574,15.1342773 C31.5881323,15.2709968 30.9643593,15.3393555 30.2075195,15.3393555 L26.340332,15.3393555 L26.340332,4.43359375 L29.5703125,4.43359375 C30.3662149,4.43359375 30.9619121,4.46289033 31.3574219,4.52148438 C31.7529317,4.58007842 32.1313458,4.70214751 32.4926758,4.88769531 C32.8930684,5.0976573 33.1835928,5.36742999 33.3642578,5.69702148 C33.5449228,6.02661298 33.6352539,6.42089614 33.6352539,6.87988281 C33.6352539,7.39746353 33.5034193,7.83813295 33.2397461,8.2019043 C32.9760729,8.56567565 32.6245139,8.85742078 32.1850586,9.07714844 L32.1850586,9.13574219 C32.922367,9.28711013 33.5034158,9.61059323 33.9282227,10.1062012 C34.3530295,10.6018091 34.5654297,11.2280236 34.5654297,11.9848633 L34.5654297,11.9848633 Z M32.1264648,7.0703125 C32.1264648,6.80663931 32.08252,6.58447356 31.9946289,6.40380859 C31.9067378,6.22314363 31.7651377,6.07666072 31.5698242,5.96435547 C31.3403309,5.83251887 31.0620134,5.75073258 30.7348633,5.71899414 C30.4077132,5.6872557 30.0024438,5.67138672 29.519043,5.67138672 L27.7905273,5.67138672 L27.7905273,8.82080078 L29.6655273,8.82080078 C30.1196312,8.82080078 30.4809557,8.79760765 30.7495117,8.7512207 C31.0180677,8.70483375 31.2670887,8.60839917 31.496582,8.46191406 C31.7260754,8.31542896 31.8884273,8.12622186 31.9836426,7.89428711 C32.0788579,7.66235236 32.1264648,7.3876969 32.1264648,7.0703125 L32.1264648,7.0703125 Z M33.0566406,12.043457 C33.0566406,11.6040017 32.9907233,11.2548841 32.8588867,10.9960938 C32.7270501,10.7373034 32.4877947,10.517579 32.1411133,10.3369141 C31.9067371,10.2148431 31.6223161,10.1354982 31.2878418,10.098877 C30.9533675,10.0622557 30.5468774,10.0439453 30.0683594,10.0439453 L27.7905273,10.0439453 L27.7905273,14.1015625 L29.7094727,14.1015625 C30.3442415,14.1015625 30.8642558,14.0686038 31.2695312,14.0026855 C31.6748067,13.9367672 32.0068346,13.8159188 32.265625,13.6401367 C32.5390639,13.4497061 32.7392572,13.2324231 32.8662109,12.9882812 C32.9931647,12.7441394 33.0566406,12.4292011 33.0566406,12.043457 L33.0566406,12.043457 Z M42.8710938,15.3393555 L41.5014648,15.3393555 L41.5014648,14.4677734 C41.3793939,14.5507817 41.2146006,14.6667473 41.0070801,14.8156738 C40.7995595,14.9646004 40.5981455,15.0830074 40.402832,15.1708984 C40.1733387,15.2832037 39.9096695,15.3771969 39.6118164,15.4528809 C39.3139634,15.5285648 38.9648458,15.5664062 38.5644531,15.5664062 C37.8271448,15.5664062 37.202151,15.3222681 36.6894531,14.8339844 C36.1767552,14.3457007 35.9204102,13.7231483 35.9204102,12.9663086 C35.9204102,12.3461883 36.0534655,11.8444843 36.3195801,11.4611816 C36.5856947,11.0778789 36.9653296,10.7763683 37.4584961,10.5566406 C37.9565455,10.336913 38.554684,10.1879887 39.2529297,10.1098633 C39.9511754,10.0317379 40.7006796,9.97314473 41.5014648,9.93408203 L41.5014648,9.72167969 C41.5014648,9.40917813 41.4465338,9.15039165 41.3366699,8.9453125 C41.2268061,8.74023335 41.069337,8.57910215 40.8642578,8.46191406 C40.6689443,8.34960881 40.4345717,8.27392598 40.1611328,8.23486328 C39.8876939,8.19580059 39.6020523,8.17626953 39.3041992,8.17626953 C38.9428693,8.17626953 38.5400413,8.22387648 38.0957031,8.3190918 C37.651365,8.41430712 37.1923852,8.55224519 36.71875,8.73291016 L36.6455078,8.73291016 L36.6455078,7.33398438 C36.9140638,7.26074182 37.3022436,7.18017622 37.8100586,7.09228516 C38.3178736,7.00439409 38.8183569,6.96044922 39.3115234,6.96044922 C39.8876982,6.96044922 40.3894022,7.00805616 40.8166504,7.10327148 C41.2438986,7.1984868 41.613768,7.3608387 41.9262695,7.59033203 C42.2338883,7.81494253 42.4682609,8.10546697 42.6293945,8.46191406 C42.7905281,8.81836116 42.8710938,9.26025127 42.8710938,9.78759766 L42.8710938,15.3393555 Z M41.5014648,13.3251953 L41.5014648,11.0473633 C41.0815409,11.0717775 40.587161,11.1083982 40.0183105,11.1572266 C39.44946,11.2060549 38.9990251,11.276855 38.6669922,11.3696289 C38.2714824,11.4819342 37.9516614,11.656493 37.7075195,11.8933105 C37.4633777,12.1301281 37.3413086,12.4560526 37.3413086,12.8710938 C37.3413086,13.3398461 37.4829087,13.6926258 37.7661133,13.9294434 C38.0493178,14.1662609 38.4814424,14.284668 39.0625,14.284668 C39.5459009,14.284668 39.987791,14.1906748 40.3881836,14.0026855 C40.7885762,13.8146963 41.1596663,13.5888685 41.5014648,13.3251953 L41.5014648,13.3251953 Z M52.3632812,15.3393555 L50.9863281,15.3393555 L50.9863281,10.6811523 C50.9863281,10.3051739 50.9643557,9.95239423 50.9204102,9.62280273 C50.8764646,9.29321124 50.795899,9.03564546 50.6787109,8.85009766 C50.55664,8.64501851 50.3808605,8.49243214 50.1513672,8.39233398 C49.9218739,8.29223583 49.6240253,8.2421875 49.2578125,8.2421875 C48.8818341,8.2421875 48.4887716,8.33496001 48.0786133,8.52050781 C47.668455,8.70605562 47.2753925,8.94286965 46.8994141,9.23095703 L46.8994141,15.3393555 L45.5224609,15.3393555 L45.5224609,7.15820312 L46.8994141,7.15820312 L46.8994141,8.06640625 C47.3291037,7.70995916 47.7734352,7.43164163 48.2324219,7.23144531 C48.6914085,7.031249 49.1625952,6.93115234 49.6459961,6.93115234 C50.5297896,6.93115234 51.203611,7.19726296 51.6674805,7.72949219 C52.13135,8.26172141 52.3632812,9.02831531 52.3632812,10.0292969 L52.3632812,15.3393555 Z\" fill=\"#FFFFFF\" sketch:type=\"MSShapeGroup\"></path><path id=\"Purge\" d=\"M26.2561035,186.291992 C26.2561035,186.775393 26.1718758,187.223387 26.003418,187.635986 C25.8349601,188.048586 25.5993667,188.406248 25.2966309,188.708984 C24.9206524,189.084963 24.4763209,189.366942 23.963623,189.554932 C23.4509252,189.742921 22.803959,189.836914 22.0227051,189.836914 L20.5725098,189.836914 L20.5725098,193.901855 L19.1223145,193.901855 L19.1223145,182.996094 L22.0812988,182.996094 C22.735599,182.996094 23.2897927,183.051025 23.7438965,183.160889 C24.1980003,183.270753 24.6008283,183.44287 24.9523926,183.677246 C25.3674337,183.955568 25.6884754,184.302244 25.9155273,184.717285 C26.1425793,185.132326 26.2561035,185.657223 26.2561035,186.291992 L26.2561035,186.291992 Z M24.7473145,186.328613 C24.7473145,185.952635 24.6813971,185.62549 24.5495605,185.347168 C24.417724,185.068846 24.2175306,184.841798 23.9489746,184.666016 C23.7145984,184.514648 23.4472671,184.406006 23.1469727,184.340088 C22.8466782,184.27417 22.4670433,184.241211 22.0080566,184.241211 L20.5725098,184.241211 L20.5725098,188.599121 L21.7956543,188.599121 C22.3815947,188.599121 22.8576642,188.546631 23.223877,188.44165 C23.5900897,188.336669 23.8879383,188.169435 24.1174316,187.939941 C24.346925,187.705565 24.5092769,187.458986 24.6044922,187.200195 C24.6997075,186.941405 24.7473145,186.650881 24.7473145,186.328613 L24.7473145,186.328613 Z M34.8400879,193.901855 L33.4631348,193.901855 L33.4631348,192.993652 C32.9992653,193.359865 32.5549338,193.640624 32.130127,193.835938 C31.7053201,194.031251 31.2365748,194.128906 30.723877,194.128906 C29.8644977,194.128906 29.195559,193.866458 28.717041,193.341553 C28.238523,192.816648 27.9992676,192.046392 27.9992676,191.030762 L27.9992676,185.720703 L29.3762207,185.720703 L29.3762207,190.378906 C29.3762207,190.793947 29.3957518,191.149168 29.4348145,191.44458 C29.4738771,191.739992 29.5568841,191.992675 29.6838379,192.202637 C29.8156745,192.417482 29.9865712,192.57373 30.1965332,192.671387 C30.4064952,192.769043 30.7116679,192.817871 31.1120605,192.817871 C31.4685076,192.817871 31.857908,192.725099 32.2802734,192.539551 C32.7026388,192.354003 33.096922,192.117189 33.4631348,191.829102 L33.4631348,185.720703 L34.8400879,185.720703 L34.8400879,193.901855 Z M42.6550293,187.222168 L42.5817871,187.222168 C42.376708,187.17334 42.1777353,187.13794 41.9848633,187.115967 C41.7919912,187.093994 41.563722,187.083008 41.3000488,187.083008 C40.875242,187.083008 40.4650899,187.177001 40.0695801,187.36499 C39.6740703,187.552979 39.2932147,187.795897 38.927002,188.09375 L38.927002,193.901855 L37.5500488,193.901855 L37.5500488,185.720703 L38.927002,185.720703 L38.927002,186.929199 C39.4738797,186.489744 39.9560526,186.178468 40.3735352,185.995361 C40.7910177,185.812255 41.2170388,185.720703 41.6516113,185.720703 C41.8908703,185.720703 42.0642084,185.726807 42.1716309,185.739014 C42.2790533,185.751221 42.4401845,185.774414 42.6550293,185.808594 L42.6550293,187.222168 Z M50.5871582,192.97168 C50.5871582,194.358405 50.2722199,195.376462 49.642334,196.025879 C49.012448,196.675296 48.0432194,197 46.7346191,197 C46.3000467,197 45.8764669,196.969483 45.4638672,196.908447 C45.0512675,196.847412 44.6447774,196.760743 44.2443848,196.648438 L44.2443848,195.242188 L44.317627,195.242188 C44.5422375,195.330079 44.8986792,195.43872 45.3869629,195.568115 C45.8752466,195.69751 46.3635229,195.762207 46.8518066,195.762207 C47.320559,195.762207 47.7087387,195.706055 48.0163574,195.59375 C48.3239761,195.481445 48.5632316,195.325196 48.7341309,195.125 C48.9050302,194.934569 49.0270992,194.705079 49.1003418,194.436523 C49.1735844,194.167967 49.2102051,193.867677 49.2102051,193.535645 L49.2102051,192.788574 C48.7951639,193.120607 48.3984394,193.368407 48.0200195,193.531982 C47.6415997,193.695557 47.1594268,193.777344 46.5734863,193.777344 C45.5969189,193.777344 44.8217802,193.424564 44.2480469,192.718994 C43.6743135,192.013424 43.3874512,191.018561 43.3874512,189.734375 C43.3874512,189.031246 43.4863271,188.424563 43.684082,187.914307 C43.8818369,187.40405 44.1516096,186.963381 44.4934082,186.592285 C44.8107926,186.245604 45.1965309,185.975831 45.6506348,185.782959 C46.1047386,185.590087 46.5563942,185.493652 47.0056152,185.493652 C47.4792504,185.493652 47.875975,185.541259 48.1958008,185.636475 C48.5156266,185.73169 48.853758,185.876952 49.2102051,186.072266 L49.2980957,185.720703 L50.5871582,185.720703 L50.5871582,192.97168 Z M49.2102051,191.65332 L49.2102051,187.192871 C48.8439923,187.026855 48.5034195,186.908448 48.1884766,186.837646 C47.8735336,186.766845 47.559816,186.731445 47.2473145,186.731445 C46.4904747,186.731445 45.8947776,186.985349 45.4602051,187.493164 C45.0256326,188.000979 44.8083496,188.738276 44.8083496,189.705078 C44.8083496,190.623051 44.9694808,191.318845 45.291748,191.79248 C45.6140153,192.266116 46.1486779,192.50293 46.895752,192.50293 C47.2961446,192.50293 47.6977519,192.426026 48.1005859,192.272217 C48.50342,192.118407 48.8732893,191.912111 49.2102051,191.65332 L49.2102051,191.65332 Z M60.1452637,189.954102 L54.1174316,189.954102 C54.1174316,190.457034 54.1931145,190.895262 54.3444824,191.268799 C54.4958504,191.642336 54.7033678,191.948729 54.967041,192.187988 C55.2209485,192.422364 55.5224592,192.598144 55.871582,192.715332 C56.2207049,192.83252 56.6052225,192.891113 57.0251465,192.891113 C57.5817899,192.891113 58.142087,192.78003 58.7060547,192.557861 C59.2700224,192.335692 59.6716297,192.117189 59.9108887,191.902344 L59.9841309,191.902344 L59.9841309,193.403809 C59.5202614,193.599122 59.0466333,193.762695 58.5632324,193.894531 C58.0798316,194.026368 57.5720241,194.092285 57.0397949,194.092285 C55.6823663,194.092285 54.6228065,193.724857 53.861084,192.98999 C53.0993614,192.255123 52.7185059,191.211433 52.7185059,189.858887 C52.7185059,188.520989 53.0834924,187.458988 53.8134766,186.672852 C54.5434607,185.886715 55.5041444,185.493652 56.6955566,185.493652 C57.7990778,185.493652 58.6498994,185.815915 59.2480469,186.460449 C59.8461944,187.104984 60.1452637,188.020502 60.1452637,189.207031 L60.1452637,189.954102 Z M58.8049316,188.899414 C58.8000488,188.176754 58.6181659,187.617678 58.2592773,187.222168 C57.9003888,186.826658 57.35474,186.628906 56.6223145,186.628906 C55.8850061,186.628906 55.2978537,186.846189 54.8608398,187.280762 C54.4238259,187.715334 54.1760257,188.25488 54.1174316,188.899414 L58.8049316,188.899414 Z\" fill=\"#FFFFFF\" sketch:type=\"MSShapeGroup\"></path></svg><div class=\"cursor\"></div></div>");;return buf.join("");
};module.exports=template;
},{}],63:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (pollId) {
buf.push("<div id=\"bttv-poll-contain\"><div class=\"title\">New poll available! <span style=\"text-decoration: underline;\">Vote now!</span></div><div class=\"close\"><svg height=\"16px\" version=\"1.1\" viewbox=\"0 0 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-close\"><path clip-rule=\"evenodd\" d=\"M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z\" fill-rule=\"evenodd\"></path></svg></div><iframe" + (jade.attr("src", 'https://strawpoll.me/embed_2/' + (pollId) + '', true, false)) + " class=\"frame\"></iframe></div>");}.call(this,"pollId" in locals_for_with?locals_for_with.pollId:typeof pollId!=="undefined"?pollId:undefined));;return buf.join("");
};module.exports=template;
},{}],64:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (require, user, top, left, bttv, Twitch, moment) {
var vars = require('../vars')
buf.push("<div" + (jade.attr("data-user", user.name, true, false)) + (jade.attr("style", "top: " + (top) + "px;left: " + (left) + "px;", true, false)) + " class=\"bttv-mod-card ember-view moderation-card\"><div class=\"close-button\"><svg height=\"16px\" version=\"1.1\" viewbox=\"0 0 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-close\"><path clip-rule=\"evenodd\" d=\"M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z\" fill-rule=\"evenodd\"></path></svg></div><div" + (jade.attr("style", "background-color: " + (user.profile_banner_background_color?user.profile_banner_background_color:'#000') + "", true, false)) + " class=\"card-header\"><img" + (jade.attr("src", user.logo?user.logo:'https://www-cdn.jtvnw.net/images/xarth/404_user_300x300.png', true, false)) + " class=\"channel_logo\"/><div class=\"drag-handle\"></div>");
if ( bttv.storage.getObject("nicknames")[user.name.toLowerCase()])
{
buf.push("<h4 class=\"real-name\">" + (jade.escape(null == (jade_interp = user.display_name) ? "" : jade_interp)) + "</h4>");
}
buf.push("<h3 class=\"name\"><a" + (jade.attr("href", Twitch.url.profile(user.name), true, false)) + " target=\"_blank\">" + (jade.escape(null == (jade_interp = bttv.storage.getObject("nicknames")[user.name.toLowerCase()] || user.display_name) ? "" : jade_interp)) + "</a><svg height=\"10px\" width=\"10px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-edit mod-card-edit\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M6.414,12.414L3.586,9.586l8-8l2.828,2.828L6.414,12.414z M4.829,14H2l0,0v-2.828l0.586-0.586l2.828,2.828L4.829,14z\"></path></svg></h3><h4 class=\"created-at\">" + (jade.escape(null == (jade_interp = "Created " + moment(user.created_at).format("MMM D, YYYY")) ? "" : jade_interp)) + "</h4><div class=\"channel_background_cover\"></div>");
if ( user.profile_banner)
{
buf.push("<img" + (jade.attr("src", user.profile_banner, true, false)) + " class=\"channel_background\"/>");
}
buf.push("<div class=\"channel-stats\"><span class=\"stat\">" + (jade.escape(null == (jade_interp = Twitch.display.commatize(user.views)) ? "" : jade_interp)) + "<svg height=\"16px\" version=\"1.1\" viewbox=\"1 1 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-glyph_views\"><path clip-rule=\"evenodd\" d=\"M11,13H5L1,9V8V7l4-4h6l4,4v1v1L11,13z M8,5C6.344,5,5,6.343,5,8c0,1.656,1.344,3,3,3c1.657,0,3-1.344,3-3C11,6.343,9.657,5,8,5z M8,9C7.447,9,7,8.552,7,8s0.447-1,1-1s1,0.448,1,1S8.553,9,8,9z\" fill-rule=\"evenodd\"></path></svg></span><span class=\"stat\">" + (jade.escape(null == (jade_interp = Twitch.display.commatize(user.followers)) ? "" : jade_interp)) + "<svg height=\"16px\" version=\"1.1\" viewbox=\"0 0 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-glyph_followers\"><path clip-rule=\"evenodd\" d=\"M8,13.5L1.5,7V4l2-2h3L8,3.5L9.5,2h3l2,2v3L8,13.5z\" fill-rule=\"evenodd\"></path></svg></span></div></div>");
if ( user.name != vars.userData.name)
{
buf.push("<div class=\"interface\"><div class=\"btn-wrapper\"><button class=\"button-simple primary mod-card-follow\">Follow</button><button style=\"height: 30px;vertical-align: top;\" title=\"View user's profile\" class=\"button-simple dark mod-card-profile\"><img src=\"https://www-cdn.jtvnw.net/images/xarth/g/g18_person-00000080.png\" style=\"margin-top: 6px;\"/></button><button style=\"height: 30px;vertical-align: top;\" title=\"Send user a message\" class=\"button-simple dark mod-card-message\"><img src=\"https://www-cdn.jtvnw.net/images/xarth/g/g18_mail-00000080.png\" style=\"margin-top: 6px;\"/></button><button title=\"Add/Remove user from ignores\" class=\"button-simple dark mod-card-ignore\"><svg height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-ignore\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M13,11.341V16l-3.722-3.102C8.863,12.959,8.438,13,8,13c-3.866,0-7-2.462-7-5.5C1,4.462,4.134,2,8,2s7,2.462,7,5.5C15,8.996,14.234,10.35,13,11.341z M11,7H5v1h6V7z\"></path></svg><svg style=\"display: none;\" height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-unignore\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M13,11.341V16l-3.722-3.102C8.863,12.959,8.438,13,8,13c-3.866,0-7-2.462-7-5.5C1,4.462,4.134,2,8,2s7,2.462,7,5.5C15,8.996,14.234,10.35,13,11.341z\"></path></svg></button>");
if ( vars.userData.isLoggedIn && (bttv.chat.helpers.isOwner(vars.userData.name) || bttv.chat.helpers.isStaff(vars.userData.name) || bttv.chat.helpers.isAdmin(vars.userData.name)))
{
buf.push("<button title=\"Add/Remove this user as a moderator\" class=\"button-simple dark mod-card-mod\"><svg height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-add-mod\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M15,7L1,16l4.666-7H1l14-9l-4.667,7H15z\"></path></svg><svg style=\"display: none;\" height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-remove-mod\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M 1.7692223,7.3226542 14.725057,7.3226542 14.725057,8.199533 1.7692223,8.199533 z M 15,0 5.4375,6.15625 10.90625,6.15625 15,0 z M 5.375,9.40625 1,16 11.25,9.40625 5.375,9.40625 z\"></path></svg></button>");
}
if ( vars.userData.isLoggedIn && bttv.chat.helpers.isModerator(vars.userData.name) && (!bttv.chat.helpers.isModerator(user.name) || vars.userData.name === bttv.getChannel()))
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
buf.push("</div>");}.call(this,"require" in locals_for_with?locals_for_with.require:typeof require!=="undefined"?require:undefined,"user" in locals_for_with?locals_for_with.user:typeof user!=="undefined"?user:undefined,"top" in locals_for_with?locals_for_with.top:typeof top!=="undefined"?top:undefined,"left" in locals_for_with?locals_for_with.left:typeof left!=="undefined"?left:undefined,"bttv" in locals_for_with?locals_for_with.bttv:typeof bttv!=="undefined"?bttv:undefined,"Twitch" in locals_for_with?locals_for_with.Twitch:typeof Twitch!=="undefined"?Twitch:undefined,"moment" in locals_for_with?locals_for_with.moment:typeof moment!=="undefined"?moment:undefined));;return buf.join("");
};module.exports=template;
},{"../vars":69}],65:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (time, displayName, message) {
buf.push("<div id=\"bttv-pinned-highlight\"><span class=\"close\"><svg height=\"8px\" version=\"1.1\" viewbox=\"0 0 16 16\" width=\"8px\" x=\"0px\" y=\"0px\" class=\"svg-close\"><path clip-rule=\"evenodd\" d=\"M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z\" fill-rule=\"evenodd\"></path></svg></span><span class=\"time\">" + (jade.escape((jade_interp = time) == null ? '' : jade_interp)) + "</span><span class=\"display-name\">" + (jade.escape((jade_interp = displayName) == null ? '' : jade_interp)) + ":</span><span class=\"message\">" + (jade.escape((jade_interp = message) == null ? '' : jade_interp)) + "</span></div>");}.call(this,"time" in locals_for_with?locals_for_with.time:typeof time!=="undefined"?time:undefined,"displayName" in locals_for_with?locals_for_with.displayName:typeof displayName!=="undefined"?displayName:undefined,"message" in locals_for_with?locals_for_with.message:typeof message!=="undefined"?message:undefined));;return buf.join("");
};module.exports=template;
},{}],66:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (storageKey, name, description) {
buf.push("<div" + (jade.cls(['option',"bttvOption-" + (storageKey) + ""], [null,true])) + "><span style=\"font-weight:bold;font-size:14px;color:#D3D3D3;\">" + (jade.escape(null == (jade_interp = name) ? "" : jade_interp)) + "</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;" + (jade.escape(null == (jade_interp = description) ? "" : jade_interp)) + "<div class=\"bttv-switch\"><input type=\"radio\"" + (jade.attr("name", storageKey, true, false)) + " value=\"false\"" + (jade.attr("id", "" + (storageKey) + "False", true, false)) + " class=\"bttv-switch-input bttv-switch-off\"/><label" + (jade.attr("for", "" + (storageKey) + "False", true, false)) + " class=\"bttv-switch-label bttv-switch-label-off\">Off</label><input type=\"radio\"" + (jade.attr("name", storageKey, true, false)) + " value=\"true\"" + (jade.attr("id", "" + (storageKey) + "True", true, false)) + " class=\"bttv-switch-input\"/><label" + (jade.attr("for", "" + (storageKey) + "True", true, false)) + " class=\"bttv-switch-label bttv-switch-label-on\">On</label><span class=\"bttv-switch-selection\"></span></div></div>");}.call(this,"storageKey" in locals_for_with?locals_for_with.storageKey:typeof storageKey!=="undefined"?storageKey:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"description" in locals_for_with?locals_for_with.description:typeof description!=="undefined"?description:undefined));;return buf.join("");
};module.exports=template;
},{}],67:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (bttv, Date) {
buf.push("<div id=\"header\"><span id=\"logo\"><img height=\"45px\" src=\"https://cdn.betterttv.net/style/logos/settings_logo.png\"/></span><ul class=\"nav\"><li><a href=\"#bttvAbout\">About</a></li><li class=\"active\"><a href=\"#bttvSettings\">Settings</a></li><li><a href=\"#bttvChannel\" target=\"_blank\">Channel</a></li><li><a href=\"#bttvChangelog\">Changelog</a></li><li><a href=\"#bttvPrivacy\">Privacy Policy</a></li><li><a href=\"#bttvBackup\">Backup/Import</a></li></ul><span id=\"close\">&times;</span></div><div id=\"bttvSettings\" style=\"height:425px;\" class=\"scroll scroll-dark\"><div class=\"tse-content options-list\"><h2 class=\"option\">Here you can manage the various BetterTTV options. Click On or Off to toggle settings.</h2></div></div><div id=\"bttvAbout\" style=\"display:none;\"><div class=\"aboutHalf\"><img src=\"https://cdn.betterttv.net/style/logos/mascot.png\" class=\"bttvAboutIcon\"/><h1>BetterTTV v" + (jade.escape((jade_interp = bttv.info.versionString()) == null ? '' : jade_interp)) + "</h1><h2>from your friends at <a href=\"https://www.nightdev.com\" target=\"_blank\">NightDev</a></h2><br/></div><div class=\"aboutHalf\"><h1 style=\"margin-top: 100px;\">Think this addon is awesome?</h1><br/><br/><h2><a target=\"_blank\" href=\"https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped\">Drop a Review on the Chrome Webstore</a></h2><br/><h2>or maybe</h2><br/><h2><a target=\"_blank\" href=\"https://streamtip.com/t/night\">Send us a Tip</a></h2><br/></div></div><div id=\"bttvChannel\" style=\"display:none;\"><iframe frameborder=\"0\" width=\"100%\" height=\"425\"></iframe></div><div id=\"bttvPrivacy\" style=\"display:none;height:425px;\" class=\"scroll scroll-dark\"><div class=\"tse-content\"></div></div><div id=\"bttvChangelog\" style=\"display:none;height:425px;\" class=\"scroll scroll-dark\"><div class=\"tse-content\"></div></div><div id=\"bttvBackup\" style=\"display:none;height:425px;padding:25px;\"><h4 style=\"padding-bottom:10px;\">Backup Settings</h4><button id=\"bttvBackupButton\" class=\"primary_button\"><span>Download</span></button><h4 style=\"padding-top:15px;padding-bottom:10px;\">Import Settings</h4><input id=\"bttvImportInput\" type=\"file\" style=\"height: 25px;width: 250px;\"/><br/><button id=\"bttvNoSSLImportInput\" class=\"primary_button\"><span>Import from Non-SSL Twitch</span></button><h4 style=\"padding-top:15px;padding-bottom:10px;\">Backup Nicknames</h4><button id=\"bttvNicknamesBackupButton\" class=\"primary_button\"><span>Download</span></button><h4 style=\"padding-top:15px;padding-bottom:10px;\">Import Nicknames</h4><input id=\"bttvNicknamesImportInput\" type=\"file\" style=\"height: 25px;width: 250px;\"/></div><div id=\"footer\"><span>BetterTTV &copy; <a href=\"https://www.nightdev.com\" target=\"_blank\">NightDev, LLC</a> " + (jade.escape((jade_interp = new Date().getFullYear()) == null ? '' : jade_interp)) + "</span><span style=\"float:right;\"><a href=\"https://twitter.com/betterttv\" target=\"_blank\">Twitter</a> | <a href=\"https://community.nightdev.com/c/betterttv\" target=\"_blank\">Forums</a> | <a href=\"https://github.com/night/BetterTTV/issues/new?labels=bug\" target=\"_blank\">Bug Report</a> | <a href=\"https://streamtip.com/t/night\" target=\"_blank\">Tip Us</a></span></div>");}.call(this,"bttv" in locals_for_with?locals_for_with.bttv:typeof bttv!=="undefined"?bttv:undefined,"Date" in locals_for_with?locals_for_with.Date:typeof Date!=="undefined"?Date:undefined));;return buf.join("");
};module.exports=template;
},{}],68:[function(require,module,exports){
vars = require('./vars');

module.exports = {
    _setHeaders: function(options) {
        if (!options.headers) options.headers = {};

        options.headers['Client-ID'] = '6x8avioex0zt85ht6py4sq55z6avsea';

        if (options.auth && vars.userData.isLoggedIn) {
            options.headers.Authorization = 'OAuth ' + vars.userData.oauthToken;
        }

        delete options.auth;
    },
    _call: function(method, url, data, options) {
        if (!options) options = {};

        this._setHeaders(options);

        return window.Twitch.api[method].call(this, url, data, options);
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

},{"./vars":69}],69:[function(require,module,exports){
module.exports = {
    userData: {
        isLoggedIn: false,
        name: '',
        displayName: '',
        oauthToken: ''
    },
    settings: {},
    liveChannels: [],
    blackChat: false
};

},{}],70:[function(require,module,exports){
var debug = require('./helpers/debug');
var vars = require('./vars');

var events = {};

// The rare occasion we need to global message to people
events.alert = function(data) {
    if (data.type === 'chat') {
        bttv.chat.helpers.serverMessage(data.message);
    } else if (data.type === 'growl') {
        bttv.notify(data.message.text, {
            title: data.message.title,
            url: data.message.url,
            image: data.message.image,
            tag: data.message.tag,
            permanent: data.message.permanent
        });
    }
};

// Night's legacy subs
events.new_subscriber = function(data) {
    if (data.channel !== bttv.getChannel()) return;

    bttv.chat.helpers.notifyMessage('subscriber', bttv.chat.helpers.lookupDisplayName(data.user) + ' just subscribed!');
    bttv.chat.store.__subscriptions[data.user] = ['night'];
    bttv.chat.helpers.reparseMessages(data.user);
};

// Chat Spammers
events.new_spammer = function(data) {
    bttv.chat.store.spammers.push(data.name);
};

// Nightbot emits commercial warnings to mods
events.commercial = function(data) {
    if (data.channel !== bttv.getChannel()) return;
    if (!vars.userData.isLoggedIn || !bttv.chat.helpers.isModerator(vars.userData.name)) return;

    bttv.chat.helpers.notifyMessage('bot', data.message);
};

// Night's legacy subs & BetterTTV Pro
events.lookup_user = function(subscription) {
    if (!subscription.pro && !subscription.subscribed) return;

    if (subscription.pro && subscription.emotes) {
        bttv.chat.store.proEmotes[subscription.name] = {};

        subscription.emotes.forEach(function(emote) {
            emote.type = 'personal';
            bttv.chat.store.proEmotes[subscription.name][emote.code] = emote;
        });
    }

    if (subscription.subscribed) {
        bttv.chat.store.__subscriptions[subscription.name] = ['night'];
        if (subscription.glow) bttv.chat.store.__subscriptions[subscription.name].push('_glow');
    }

    bttv.chat.helpers.reparseMessages(subscription.name);
};

function SocketClient() {
    this.socket = false;
    this._lookedUpUsers = [];
    this._connected = false;
    this._connecting = false;
    this._connectAttempts = 1;
    this._joinedChannel = null;
    this._events = events;

    this.connect();
}

SocketClient.prototype.connect = function() {
    if (this._connected || this._connecting) return;
    this._connecting = true;

    debug.log('SocketClient: Connecting to Beta BetterTTV Socket Server');

    var _self = this;
    this.socket = new WebSocket('wss://sockets-beta.betterttv.net/ws');

    this.socket.onopen = function() {
        debug.log('SocketClient: Connected to Beta BetterTTV Socket Server');

        _self._connected = true;
        _self._connectAttempts = 1;
        _self.joinChannel();
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
        } catch (e) {
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
        } catch (e) {}
    }

    delete this.socket;

    this._connected = false;

    if (this._connecting === false) return;
    this._connecting = false;

    setTimeout(function() {
        _self.connect();
    }, Math.random() * (Math.pow(2, this._connectAttempts) - 1) * 30000);
};

SocketClient.prototype.emit = function(evt, data) {
    if (!this._connected || !this.socket) return;

    this.socket.send(JSON.stringify({
        name: evt,
        data: data
    }));
};

// Night's legacy subs
SocketClient.prototype.broadcastMe = function() {
    if (!this._connected || !vars.userData.isLoggedIn) return;

    this.emit('broadcast_me', { name: vars.userData.name, channel: bttv.getChannel() });
};

SocketClient.prototype.joinChannel = function() {
    if (!this._connected) return;

    var channel = bttv.getChannel();

    if (!channel.length) return;

    if (this._joinedChannel) {
        this.emit('part_channel', { name: this._joinedChannel });
    }

    this.emit('join_channel', { name: channel });
    this._joinedChannel = channel;

    // Night's legacy subs
    if (channel !== 'night') return;
    var element = document.createElement('style');
    element.type = 'text/css';
    element.innerHTML = '.badge.subscriber { background-image: url("https://cdn.betterttv.net/tags/subscriber.png") !important; }';
    bttv.jQuery('.ember-chat .chat-room').append(element);
};

module.exports = SocketClient;

},{"./helpers/debug":48,"./vars":69}],71:[function(require,module,exports){
(function (process,__filename){
/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 1.0.0 Copyright (c) 2011-2015, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                if (callback) {
                    process.nextTick(function () {
                        callback.apply(null, deps);
                    });
                }
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

}).call(this,require("+xKvab"),"/../node_modules/amdefine/amdefine.js")
},{"+xKvab":80,"path":155}],72:[function(require,module,exports){
'use strict'

/**
 * Expose `arrayFlatten`.
 */
module.exports = flatten
module.exports.from = flattenFrom
module.exports.depth = flattenDepth
module.exports.fromDepth = flattenFromDepth

/**
 * Flatten an array.
 *
 * @param  {Array} array
 * @return {Array}
 */
function flatten (array) {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected value to be an array')
  }

  return flattenFrom(array)
}

/**
 * Flatten an array-like structure.
 *
 * @param  {Array} array
 * @return {Array}
 */
function flattenFrom (array) {
  return flattenDown(array, [], Infinity)
}

/**
 * Flatten an array-like structure with depth.
 *
 * @param  {Array}  array
 * @param  {number} depth
 * @return {Array}
 */
function flattenDepth (array, depth) {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected value to be an array')
  }

  return flattenFromDepth(array, depth)
}

/**
 * Flatten an array-like structure with depth.
 *
 * @param  {Array}  array
 * @param  {number} depth
 * @return {Array}
 */
function flattenFromDepth (array, depth) {
  if (typeof depth !== 'number') {
    throw new TypeError('Expected the depth to be a number')
  }

  return flattenDownDepth(array, [], depth)
}

/**
 * Flatten an array indefinitely.
 *
 * @param  {Array} array
 * @param  {Array} result
 * @return {Array}
 */
function flattenDown (array, result) {
  for (var i = 0; i < array.length; i++) {
    var value = array[i]

    if (Array.isArray(value)) {
      flattenDown(value, result)
    } else {
      result.push(value)
    }
  }

  return result
}

/**
 * Flatten an array with depth.
 *
 * @param  {Array}  array
 * @param  {Array}  result
 * @param  {number} depth
 * @return {Array}
 */
function flattenDownDepth (array, result, depth) {
  depth--

  for (var i = 0; i < array.length; i++) {
    var value = array[i]

    if (depth > -1 && Array.isArray(value)) {
      flattenDownDepth(value, result, depth)
    } else {
      result.push(value)
    }
  }

  return result
}

},{}],73:[function(require,module,exports){
/*!
 * array-unique <https://github.com/jonschlinkert/array-unique>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function unique(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.');
  }

  var len = arr.length;
  var i = -1;

  while (i++ < len) {
    var j = i + 1;

    for (; j < arr.length; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1);
      }
    }
  }
  return arr;
};

},{}],74:[function(require,module,exports){
/*!
 * arrayify-compact <https://github.com/jonschlinkert/arrayify-compact>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var flatten = require('array-flatten');

module.exports = function(arr) {
  return flatten(!Array.isArray(arr) ? [arr] : arr)
    .filter(Boolean);
};

},{"array-flatten":72}],75:[function(require,module,exports){
var css = require('css')

module.exports = function (src, vtree, opts) {
  var ast = css.parse(src, opts)
  prefixSelector(ast.stylesheet.rules, vtree)
  return css.stringify(ast, opts)
}

function prefixSelector (rules, vtree) {
  var props = vtree.properties || {}

  var rootClass = props.className
  var rootId = props.id
  if (!rootClass && !rootId) throw new Error('The top level VirtualNode must have a className or an id')
  rootClass = rootClass.split(' ')[0]

  var rootTag = vtree.tagName.toLowerCase()

  rules = rules.map(function (rule) {
    rule.selectors = rule.selectors.map(function (selector) {
      var parts = selector.split(' ')
      if (parts[0].toLowerCase() === rootTag) {
        selector = parts[0] + '.' + rootClass
        if (parts.length > 1) selector += ' ' + parts.slice(1).join(' ')
        return selector
      } else if (
        (parts[0] === '#' + rootId || parts[0] === '.' + rootClass) ||
        (rootClass && parts[0].slice(1, rootClass.length + 1) === rootClass) ||
        (rootId && parts[0].slice(1, rootId.length + 1) === rootId)
      ) {
        return selector
      }
      return '.' + rootClass + ' ' + selector
    })
    // TODO: Detect nested rules and recurse
    return rule
  })
}

},{"css":82}],76:[function(require,module,exports){
module.exports = BaseElement

var h = require('virtual-dom/h')
var diff = require('virtual-dom/diff')
var patch = require('virtual-dom/patch')
var createElement = require('virtual-dom/create-element')
var toHTML = require('vdom-to-html')

function BaseElement (el) {
  if (!(this instanceof BaseElement)) return new BaseElement(el)
  this.vtree = null
  this.element = null
  this.__appendTo__ = el
  this.__events__ = Object.create(null)
  this.__BaseElementSig__ = 'be-' + Date.now()
  this.__onload__ = new Onload(this.send.bind(this))
}

BaseElement.prototype.html = function () {
  return h.apply(this, arguments)
}

BaseElement.prototype.afterRender = function (vtree) {
  if (this.hasOwnProperty('__BaseElementSig__')) {
    return BaseElement.prototype.render.call(this, vtree)
  }
  return vtree
}

BaseElement.prototype.render = function (vtree) {
  if (typeof vtree === 'function') {
    vtree = vtree.call(this)
  }
  // Top level vnode must have className for CSS
  // TODO: Check if were using CSS though
  if (vtree && vtree.properties && !vtree.properties.className) {
    vtree.properties.className = this.__BaseElementSig__
  }
  if (!this.vtree) {
    this.vtree = vtree
    this.element = createElement(this.vtree)
    if (this.__appendTo__) {
      this.__appendTo__.appendChild(this.element)
    }
  } else {
    var patches = diff(this.vtree, vtree)
    this.element = patch(this.element, patches)
    this.vtree = vtree
  }
  return this.vtree
}

BaseElement.prototype.toString = function () {
  this.render.apply(this, arguments)
  return toHTML(this.vtree)
}

BaseElement.prototype.send = function (name) {
  var found = this.__events__[name]
  if (!found) return this
  var args = Array.prototype.slice.call(arguments, 1)
  for (var i = 0; i < found.length; i++) {
    var fn = found[i]
    if (typeof fn === 'function') fn.apply(this, args)
  }
  return this
}

BaseElement.prototype.addEventListener = function (name, cb) {
  if (!Array.isArray(this.__events__[name])) this.__events__[name] = []
  this.__events__[name].push(cb)
}

function Onload (cb) {
  this.cb = cb
}
Onload.prototype.hook = function (node) {
  var self = this
  setTimeout(function () {
    self.cb('load', node)
  }, 10)
}
Onload.prototype.unhook = function (node) {
  var self = this
  setTimeout(function () {
    self.cb('unload', node)
  }, 10)
}

},{"vdom-to-html":189,"virtual-dom/create-element":193,"virtual-dom/diff":194,"virtual-dom/h":195,"virtual-dom/patch":196}],77:[function(require,module,exports){

},{}],78:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],79:[function(require,module,exports){
module.exports=require(77)
},{}],80:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],81:[function(require,module,exports){
/*
 * Cookies.js - 1.2.2
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
            
            var value = Cookies._cache[Cookies._cacheKeyPrefix + key];

            return value === undefined ? undefined : decodeURIComponent(value);
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

            var key = cookieString.substr(0, separatorIndex);
            var decodedKey;
            try {
                decodedKey = decodeURIComponent(key);
            } catch (e) {
                if (console && typeof console.error === 'function') {
                    console.error('Could not decode cookie with key "' + key + '"', e);
                }
            }
            
            return {
                key: decodedKey,
                value: cookieString.substr(separatorIndex + 1) // Defer decoding value until accessed
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
},{}],82:[function(require,module,exports){
exports.parse = require('./lib/parse');
exports.stringify = require('./lib/stringify');

},{"./lib/parse":83,"./lib/stringify":87}],83:[function(require,module,exports){
// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027
var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g

module.exports = function(css, options){
  options = options || {};

  /**
   * Positional.
   */

  var lineno = 1;
  var column = 1;

  /**
   * Update lineno and column based on `str`.
   */

  function updatePosition(str) {
    var lines = str.match(/\n/g);
    if (lines) lineno += lines.length;
    var i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
  }

  /**
   * Mark position and patch `node.position`.
   */

  function position() {
    var start = { line: lineno, column: column };
    return function(node){
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }

  /**
   * Store position information for a node
   */

  function Position(start) {
    this.start = start;
    this.end = { line: lineno, column: column };
    this.source = options.source;
  }

  /**
   * Non-enumerable source string
   */

  Position.prototype.content = css;

  /**
   * Error `msg`.
   */

  var errorsList = [];

  function error(msg) {
    var err = new Error(options.source + ':' + lineno + ':' + column + ': ' + msg);
    err.reason = msg;
    err.filename = options.source;
    err.line = lineno;
    err.column = column;
    err.source = css;

    if (options.silent) {
      errorsList.push(err);
    } else {
      throw err;
    }
  }

  /**
   * Parse stylesheet.
   */

  function stylesheet() {
    var rulesList = rules();

    return {
      type: 'stylesheet',
      stylesheet: {
        rules: rulesList,
        parsingErrors: errorsList
      }
    };
  }

  /**
   * Opening brace.
   */

  function open() {
    return match(/^{\s*/);
  }

  /**
   * Closing brace.
   */

  function close() {
    return match(/^}/);
  }

  /**
   * Parse ruleset.
   */

  function rules() {
    var node;
    var rules = [];
    whitespace();
    comments(rules);
    while (css.length && css.charAt(0) != '}' && (node = atrule() || rule())) {
      if (node !== false) {
        rules.push(node);
        comments(rules);
      }
    }
    return rules;
  }

  /**
   * Match `re` and return captures.
   */

  function match(re) {
    var m = re.exec(css);
    if (!m) return;
    var str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }

  /**
   * Parse whitespace.
   */

  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */

  function comments(rules) {
    var c;
    rules = rules || [];
    while (c = comment()) {
      if (c !== false) {
        rules.push(c);
      }
    }
    return rules;
  }

  /**
   * Parse comment.
   */

  function comment() {
    var pos = position();
    if ('/' != css.charAt(0) || '*' != css.charAt(1)) return;

    var i = 2;
    while ("" != css.charAt(i) && ('*' != css.charAt(i) || '/' != css.charAt(i + 1))) ++i;
    i += 2;

    if ("" === css.charAt(i-1)) {
      return error('End of comment missing');
    }

    var str = css.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i);
    column += 2;

    return pos({
      type: 'comment',
      comment: str
    });
  }

  /**
   * Parse selector.
   */

  function selector() {
    var m = match(/^([^{]+)/);
    if (!m) return;
    /* @fix Remove all comments from selectors
     * http://ostermiller.org/findcomment.html */
    return trim(m[0])
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
        return m.replace(/,/g, '\u200C');
      })
      .split(/\s*(?![^(]*\)),\s*/)
      .map(function(s) {
        return s.replace(/\u200C/g, ',');
      });
  }

  /**
   * Parse declaration.
   */

  function declaration() {
    var pos = position();

    // prop
    var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!prop) return;
    prop = trim(prop[0]);

    // :
    if (!match(/^:\s*/)) return error("property missing ':'");

    // val
    var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);

    var ret = pos({
      type: 'declaration',
      property: prop.replace(commentre, ''),
      value: val ? trim(val[0]).replace(commentre, '') : ''
    });

    // ;
    match(/^[;\s]*/);

    return ret;
  }

  /**
   * Parse declarations.
   */

  function declarations() {
    var decls = [];

    if (!open()) return error("missing '{'");
    comments(decls);

    // declarations
    var decl;
    while (decl = declaration()) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
    }

    if (!close()) return error("missing '}'");
    return decls;
  }

  /**
   * Parse keyframe.
   */

  function keyframe() {
    var m;
    var vals = [];
    var pos = position();

    while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
      vals.push(m[1]);
      match(/^,\s*/);
    }

    if (!vals.length) return;

    return pos({
      type: 'keyframe',
      values: vals,
      declarations: declarations()
    });
  }

  /**
   * Parse keyframes.
   */

  function atkeyframes() {
    var pos = position();
    var m = match(/^@([-\w]+)?keyframes\s*/);

    if (!m) return;
    var vendor = m[1];

    // identifier
    var m = match(/^([-\w]+)\s*/);
    if (!m) return error("@keyframes missing name");
    var name = m[1];

    if (!open()) return error("@keyframes missing '{'");

    var frame;
    var frames = comments();
    while (frame = keyframe()) {
      frames.push(frame);
      frames = frames.concat(comments());
    }

    if (!close()) return error("@keyframes missing '}'");

    return pos({
      type: 'keyframes',
      name: name,
      vendor: vendor,
      keyframes: frames
    });
  }

  /**
   * Parse supports.
   */

  function atsupports() {
    var pos = position();
    var m = match(/^@supports *([^{]+)/);

    if (!m) return;
    var supports = trim(m[1]);

    if (!open()) return error("@supports missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@supports missing '}'");

    return pos({
      type: 'supports',
      supports: supports,
      rules: style
    });
  }

  /**
   * Parse host.
   */

  function athost() {
    var pos = position();
    var m = match(/^@host\s*/);

    if (!m) return;

    if (!open()) return error("@host missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@host missing '}'");

    return pos({
      type: 'host',
      rules: style
    });
  }

  /**
   * Parse media.
   */

  function atmedia() {
    var pos = position();
    var m = match(/^@media *([^{]+)/);

    if (!m) return;
    var media = trim(m[1]);

    if (!open()) return error("@media missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@media missing '}'");

    return pos({
      type: 'media',
      media: media,
      rules: style
    });
  }


  /**
   * Parse custom-media.
   */

  function atcustommedia() {
    var pos = position();
    var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (!m) return;

    return pos({
      type: 'custom-media',
      name: trim(m[1]),
      media: trim(m[2])
    });
  }

  /**
   * Parse paged media.
   */

  function atpage() {
    var pos = position();
    var m = match(/^@page */);
    if (!m) return;

    var sel = selector() || [];

    if (!open()) return error("@page missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@page missing '}'");

    return pos({
      type: 'page',
      selectors: sel,
      declarations: decls
    });
  }

  /**
   * Parse document.
   */

  function atdocument() {
    var pos = position();
    var m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) return;

    var vendor = trim(m[1]);
    var doc = trim(m[2]);

    if (!open()) return error("@document missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@document missing '}'");

    return pos({
      type: 'document',
      document: doc,
      vendor: vendor,
      rules: style
    });
  }

  /**
   * Parse font-face.
   */

  function atfontface() {
    var pos = position();
    var m = match(/^@font-face\s*/);
    if (!m) return;

    if (!open()) return error("@font-face missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@font-face missing '}'");

    return pos({
      type: 'font-face',
      declarations: decls
    });
  }

  /**
   * Parse import
   */

  var atimport = _compileAtrule('import');

  /**
   * Parse charset
   */

  var atcharset = _compileAtrule('charset');

  /**
   * Parse namespace
   */

  var atnamespace = _compileAtrule('namespace');

  /**
   * Parse non-block at-rules
   */


  function _compileAtrule(name) {
    var re = new RegExp('^@' + name + '\\s*([^;]+);');
    return function() {
      var pos = position();
      var m = match(re);
      if (!m) return;
      var ret = { type: name };
      ret[name] = m[1].trim();
      return pos(ret);
    }
  }

  /**
   * Parse at rule.
   */

  function atrule() {
    if (css[0] != '@') return;

    return atkeyframes()
      || atmedia()
      || atcustommedia()
      || atsupports()
      || atimport()
      || atcharset()
      || atnamespace()
      || atdocument()
      || atpage()
      || athost()
      || atfontface();
  }

  /**
   * Parse rule.
   */

  function rule() {
    var pos = position();
    var sel = selector();

    if (!sel) return error('selector missing');
    comments();

    return pos({
      type: 'rule',
      selectors: sel,
      declarations: declarations()
    });
  }

  return addParent(stylesheet());
};

/**
 * Trim `str`.
 */

function trim(str) {
  return str ? str.replace(/^\s+|\s+$/g, '') : '';
}

/**
 * Adds non-enumerable parent node reference to each node.
 */

function addParent(obj, parent) {
  var isNode = obj && typeof obj.type === 'string';
  var childParent = isNode ? obj : parent;

  for (var k in obj) {
    var value = obj[k];
    if (Array.isArray(value)) {
      value.forEach(function(v) { addParent(v, childParent); });
    } else if (value && typeof value === 'object') {
      addParent(value, childParent);
    }
  }

  if (isNode) {
    Object.defineProperty(obj, 'parent', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent || null
    });
  }

  return obj;
}

},{}],84:[function(require,module,exports){

/**
 * Expose `Compiler`.
 */

module.exports = Compiler;

/**
 * Initialize a compiler.
 *
 * @param {Type} name
 * @return {Type}
 * @api public
 */

function Compiler(opts) {
  this.options = opts || {};
}

/**
 * Emit `str`
 */

Compiler.prototype.emit = function(str) {
  return str;
};

/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  return this[node.type](node);
};

/**
 * Map visit over array of `nodes`, optionally using a `delim`
 */

Compiler.prototype.mapVisit = function(nodes, delim){
  var buf = '';
  delim = delim || '';

  for (var i = 0, length = nodes.length; i < length; i++) {
    buf += this.visit(nodes[i]);
    if (delim && i < length - 1) buf += this.emit(delim);
  }

  return buf;
};

},{}],85:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Base = require('./compiler');
var inherits = require('inherits');

/**
 * Expose compiler.
 */

module.exports = Compiler;

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  Base.call(this, options);
}

/**
 * Inherit from `Base.prototype`.
 */

inherits(Compiler, Base);

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return node.stylesheet
    .rules.map(this.visit, this)
    .join('');
};

/**
 * Visit comment node.
 */

Compiler.prototype.comment = function(node){
  return this.emit('', node.position);
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  return this.emit('@import ' + node.import + ';', node.position);
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  return this.emit('@media ' + node.media, node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit document node.
 */

Compiler.prototype.document = function(node){
  var doc = '@' + (node.vendor || '') + 'document ' + node.document;

  return this.emit(doc, node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  return this.emit('@charset ' + node.charset + ';', node.position);
};

/**
 * Visit namespace node.
 */

Compiler.prototype.namespace = function(node){
  return this.emit('@namespace ' + node.namespace + ';', node.position);
};

/**
 * Visit supports node.
 */

Compiler.prototype.supports = function(node){
  return this.emit('@supports ' + node.supports, node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  return this.emit('@'
    + (node.vendor || '')
    + 'keyframes '
    + node.name, node.position)
    + this.emit('{')
    + this.mapVisit(node.keyframes)
    + this.emit('}');
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  var decls = node.declarations;

  return this.emit(node.values.join(','), node.position)
    + this.emit('{')
    + this.mapVisit(decls)
    + this.emit('}');
};

/**
 * Visit page node.
 */

Compiler.prototype.page = function(node){
  var sel = node.selectors.length
    ? node.selectors.join(', ')
    : '';

  return this.emit('@page ' + sel, node.position)
    + this.emit('{')
    + this.mapVisit(node.declarations)
    + this.emit('}');
};

/**
 * Visit font-face node.
 */

Compiler.prototype['font-face'] = function(node){
  return this.emit('@font-face', node.position)
    + this.emit('{')
    + this.mapVisit(node.declarations)
    + this.emit('}');
};

/**
 * Visit host node.
 */

Compiler.prototype.host = function(node){
  return this.emit('@host', node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit custom-media node.
 */

Compiler.prototype['custom-media'] = function(node){
  return this.emit('@custom-media ' + node.name + ' ' + node.media + ';', node.position);
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  var decls = node.declarations;
  if (!decls.length) return '';

  return this.emit(node.selectors.join(','), node.position)
    + this.emit('{')
    + this.mapVisit(decls)
    + this.emit('}');
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  return this.emit(node.property + ':' + node.value, node.position) + this.emit(';');
};


},{"./compiler":84,"inherits":106}],86:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Base = require('./compiler');
var inherits = require('inherits');

/**
 * Expose compiler.
 */

module.exports = Compiler;

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  options = options || {};
  Base.call(this, options);
  this.indentation = options.indent;
}

/**
 * Inherit from `Base.prototype`.
 */

inherits(Compiler, Base);

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return this.stylesheet(node);
};

/**
 * Visit stylesheet node.
 */

Compiler.prototype.stylesheet = function(node){
  return this.mapVisit(node.stylesheet.rules, '\n\n');
};

/**
 * Visit comment node.
 */

Compiler.prototype.comment = function(node){
  return this.emit(this.indent() + '/*' + node.comment + '*/', node.position);
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  return this.emit('@import ' + node.import + ';', node.position);
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  return this.emit('@media ' + node.media, node.position)
    + this.emit(
        ' {\n'
        + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit document node.
 */

Compiler.prototype.document = function(node){
  var doc = '@' + (node.vendor || '') + 'document ' + node.document;

  return this.emit(doc, node.position)
    + this.emit(
        ' '
      + ' {\n'
      + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  return this.emit('@charset ' + node.charset + ';', node.position);
};

/**
 * Visit namespace node.
 */

Compiler.prototype.namespace = function(node){
  return this.emit('@namespace ' + node.namespace + ';', node.position);
};

/**
 * Visit supports node.
 */

Compiler.prototype.supports = function(node){
  return this.emit('@supports ' + node.supports, node.position)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  return this.emit('@' + (node.vendor || '') + 'keyframes ' + node.name, node.position)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.mapVisit(node.keyframes, '\n')
    + this.emit(
        this.indent(-1)
        + '}');
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  var decls = node.declarations;

  return this.emit(this.indent())
    + this.emit(node.values.join(', '), node.position)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.mapVisit(decls, '\n')
    + this.emit(
      this.indent(-1)
      + '\n'
      + this.indent() + '}\n');
};

/**
 * Visit page node.
 */

Compiler.prototype.page = function(node){
  var sel = node.selectors.length
    ? node.selectors.join(', ') + ' '
    : '';

  return this.emit('@page ' + sel, node.position)
    + this.emit('{\n')
    + this.emit(this.indent(1))
    + this.mapVisit(node.declarations, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n}');
};

/**
 * Visit font-face node.
 */

Compiler.prototype['font-face'] = function(node){
  return this.emit('@font-face ', node.position)
    + this.emit('{\n')
    + this.emit(this.indent(1))
    + this.mapVisit(node.declarations, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n}');
};

/**
 * Visit host node.
 */

Compiler.prototype.host = function(node){
  return this.emit('@host', node.position)
    + this.emit(
        ' {\n'
        + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit custom-media node.
 */

Compiler.prototype['custom-media'] = function(node){
  return this.emit('@custom-media ' + node.name + ' ' + node.media + ';', node.position);
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  var indent = this.indent();
  var decls = node.declarations;
  if (!decls.length) return '';

  return this.emit(node.selectors.map(function(s){ return indent + s }).join(',\n'), node.position)
    + this.emit(' {\n')
    + this.emit(this.indent(1))
    + this.mapVisit(decls, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n' + this.indent() + '}');
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  return this.emit(this.indent())
    + this.emit(node.property + ': ' + node.value, node.position)
    + this.emit(';');
};

/**
 * Increase, decrease or return current indentation.
 */

Compiler.prototype.indent = function(level) {
  this.level = this.level || 1;

  if (null != level) {
    this.level += level;
    return '';
  }

  return Array(this.level).join(this.indentation || '  ');
};

},{"./compiler":84,"inherits":106}],87:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Compressed = require('./compress');
var Identity = require('./identity');

/**
 * Stringfy the given AST `node`.
 *
 * Options:
 *
 *  - `compress` space-optimized output
 *  - `sourcemap` return an object with `.code` and `.map`
 *
 * @param {Object} node
 * @param {Object} [options]
 * @return {String}
 * @api public
 */

module.exports = function(node, options){
  options = options || {};

  var compiler = options.compress
    ? new Compressed(options)
    : new Identity(options);

  // source maps
  if (options.sourcemap) {
    var sourcemaps = require('./source-map-support');
    sourcemaps(compiler);

    var code = compiler.compile(node);
    compiler.applySourceMaps();

    var map = options.sourcemap === 'generator'
      ? compiler.map
      : compiler.map.toJSON();

    return { code: code, map: map };
  }

  var code = compiler.compile(node);
  return code;
};

},{"./compress":85,"./identity":86,"./source-map-support":88}],88:[function(require,module,exports){

/**
 * Module dependencies.
 */

var SourceMap = require('source-map').SourceMapGenerator;
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var sourceMapResolve = require('source-map-resolve');
var urix = require('urix');
var fs = require('fs');
var path = require('path');

/**
 * Expose `mixin()`.
 */

module.exports = mixin;

/**
 * Mixin source map support into `compiler`.
 *
 * @param {Compiler} compiler
 * @api public
 */

function mixin(compiler) {
  compiler._comment = compiler.comment;
  compiler.map = new SourceMap();
  compiler.position = { line: 1, column: 1 };
  compiler.files = {};
  for (var k in exports) compiler[k] = exports[k];
}

/**
 * Update position.
 *
 * @param {String} str
 * @api private
 */

exports.updatePosition = function(str) {
  var lines = str.match(/\n/g);
  if (lines) this.position.line += lines.length;
  var i = str.lastIndexOf('\n');
  this.position.column = ~i ? str.length - i : this.position.column + str.length;
};

/**
 * Emit `str`.
 *
 * @param {String} str
 * @param {Object} [pos]
 * @return {String}
 * @api private
 */

exports.emit = function(str, pos) {
  if (pos) {
    var sourceFile = urix(pos.source || 'source.css');

    this.map.addMapping({
      source: sourceFile,
      generated: {
        line: this.position.line,
        column: Math.max(this.position.column - 1, 0)
      },
      original: {
        line: pos.start.line,
        column: pos.start.column - 1
      }
    });

    this.addFile(sourceFile, pos);
  }

  this.updatePosition(str);

  return str;
};

/**
 * Adds a file to the source map output if it has not already been added
 * @param {String} file
 * @param {Object} pos
 */

exports.addFile = function(file, pos) {
  if (typeof pos.content !== 'string') return;
  if (Object.prototype.hasOwnProperty.call(this.files, file)) return;

  this.files[file] = pos.content;
};

/**
 * Applies any original source maps to the output and embeds the source file
 * contents in the source map.
 */

exports.applySourceMaps = function() {
  Object.keys(this.files).forEach(function(file) {
    var content = this.files[file];
    this.map.setSourceContent(file, content);

    if (this.options.inputSourcemaps !== false) {
      var originalMap = sourceMapResolve.resolveSync(
        content, file, fs.readFileSync);
      if (originalMap) {
        var map = new SourceMapConsumer(originalMap.map);
        var relativeTo = originalMap.sourcesRelativeTo;
        this.map.applySourceMap(map, file, urix(path.dirname(relativeTo)));
      }
    }
  }, this);
};

/**
 * Process comments, drops sourceMap comments.
 * @param {Object} node
 */

exports.comment = function(node) {
  if (/^# sourceMappingURL=/.test(node.comment))
    return this.emit('', node.position);
  else
    return this._comment(node);
};

},{"fs":79,"path":155,"source-map":175,"source-map-resolve":173,"urix":187}],89:[function(require,module,exports){
/**
 * Define stateful property on an object
 */
module.exports = defineState;

var State = require('st8');


/**
 * Define stateful property on a target
 *
 * @param {object} target Any object
 * @param {string} property Property name
 * @param {object} descriptor State descriptor
 *
 * @return {object} target
 */
function defineState (target, property, descriptor, isFn) {
	//define accessor on a target
	if (isFn) {
		target[property] = function () {
			if (arguments.length) {
				return state.set(arguments[0]);
			}
			else {
				return state.get();
			}
		};
	}

	//define setter/getter on a target
	else {
		Object.defineProperty(target, property, {
			set: function (value) {
				return state.set(value);
			},
			get: function () {
				return state.get();
			}
		});
	}

	//define state controller
	var state = new State(descriptor, target);

	return target;
}
},{"st8":186}],90:[function(require,module,exports){
/**
 * Simple draggable component
 *
 * @module draggy
 */


//work with css
var css = require('mucss/css');
var parseCSSValue = require('mucss/parse-value');
var selection = require('mucss/selection');
var offsets = require('mucss/offset');
var getTranslate = require('mucss/translate');
var intersect = require('intersects');

//events
var on = require('emmy/on');
var off = require('emmy/off');
var emit = require('emmy/emit');
var Emitter = require('events');
var getClientX = require('get-client-xy').x;
var getClientY = require('get-client-xy').y;

//utils
var isArray = require('mutype/is-array');
var isNumber = require('mutype/is-number');
var isString = require('mutype/is-string');
var isFn = require('mutype/is-fn');
var defineState = require('define-state');
var extend = require('xtend/mutable');
var round = require('mumath/round');
var between = require('mumath/clamp');
var loop = require('mumath/mod');
var getUid = require('get-uid');
var q = require('queried');


var win = window, doc = document, root = doc.documentElement;


/**
 * Draggable controllers associated with elements.
 *
 * Storing them on elements is
 * - leak-prone,
 * - pollutes element’s namespace,
 * - requires some artificial key to store,
 * - unable to retrieve controller easily.
 *
 * That is why weakmap.
 */
var draggableCache = Draggable.cache = new WeakMap;



/**
 * Make an element draggable.
 *
 * @constructor
 *
 * @param {HTMLElement} target An element whether in/out of DOM
 * @param {Object} options An draggable options
 *
 * @return {HTMLElement} Target element
 */
function Draggable(target, options) {
	if (!(this instanceof Draggable)) {
		return new Draggable(target, options);
	}

	var self = this;

	//ignore existing instance
	var instance = draggableCache.get(target);
	if (instance) {
		instance.state = 'reset';

		//take over options
		extend(instance, options);

		instance.update();

		return instance;
	}

	else {
		//get unique id for instance
		//needed to track event binders
		self.id = getUid();
		self._ns = '.draggy_' + self.id;

		//save element passed
		self.element = target;

		draggableCache.set(target, self);
	}

	//define mode of drag
	defineState(self, 'css3', self.css3);
	self.css3 = true;

	//define state behaviour
	defineState(self, 'state', self.state);

	//define axis behaviour
	defineState(self, 'axis', self.axis);
	self.axis = null;

	//preset handles
	self.currentHandles = [];

	//take over options
	extend(self, options);

	//define handle
	if (self.handle === undefined) {
		self.handle = self.element;
	}

	//setup droppable
	if (self.droppable) {
		self.initDroppable();
	}

	//try to calc out basic limits
	self.update();

	//go to initial state
	self.state = 'idle';
}


/** Inherit draggable from Emitter */
var proto = Draggable.prototype = Object.create(Emitter.prototype);


/** Init droppable "plugin" */
proto.initDroppable = function () {
	var self = this;

	on(self, 'dragstart', function () {
		var self = this;
		self.dropTargets = q.all(self.droppable);
	});

	on(self, 'drag', function () {
		var self = this;

		if (!self.dropTargets) {
			return;
		}

		var selfRect = offsets(self.element);

		self.dropTargets.forEach(function (dropTarget) {
			var targetRect = offsets(dropTarget);

			if (intersect(selfRect, targetRect, self.droppableTolerance)) {
				if (self.droppableClass) {
					dropTarget.classList.add(self.droppableClass);
				}
				if (!self.dropTarget) {
					self.dropTarget = dropTarget;

					emit(self, 'dragover', dropTarget);
					emit(dropTarget, 'dragover', self);
				}
			}
			else {
				if (self.dropTarget) {
					emit(self, 'dragout', dropTarget);
					emit(dropTarget, 'dragout', self);

					self.dropTarget = null;
				}
				if (self.droppableClass) {
					dropTarget.classList.remove(self.droppableClass);
				}
			}
		});
	});

	on(self, 'dragend', function () {
		var self = this;

		//emit drop, if any
		if (self.dropTarget) {
			emit(self.dropTarget, 'drop', self);
			emit(self, 'drop', self.dropTarget);
			self.dropTarget.classList.remove(self.droppableClass);
			self.dropTarget = null;
		}
	});
};


/**
 * Draggable behaviour
 * @enum {string}
 * @default is 'idle'
 */
proto.state = {
	//idle
	_: {
		before: function () {
			var self = this;

			self.element.classList.add('draggy-idle');

			//emit drag evts on element
			emit(self.element, 'idle', null, true);
			self.emit('idle');

			//reset keys
			self.ctrlKey = false;
			self.shiftKey = false;
			self.metaKey = false;
			self.altKey = false;

			//reset movement params
			self.movementX = 0;
			self.movementY = 0;
			self.deltaX = 0;
			self.deltaY = 0;

			on(doc, 'mousedown' + self._ns + ' touchstart' + self._ns, function (e) {
				//ignore non-draggy events
				if (!e.draggies) {
					return;
				}

				//ignore dragstart for not registered draggies
				if (e.draggies.indexOf(self) < 0) {
					return;
				}

				//if target is focused - ignore drag
				//FIXME: detect focused by whitelist of tags, name supposition may be wrong (idk, form elements have names, so likely to be focused by click)
				if (e.target.name !== undefined) {
					return;
				}

				//multitouch has multiple starts
				self.setTouch(e);

				//update movement params
				self.update(e);

				//go to threshold state
				self.state = 'threshold';
			});
		},
		after: function () {
			var self = this;

			self.element.classList.remove('draggy-idle');

			off(doc, self._ns);

			//set up tracking
			if (self.release) {
				self._trackingInterval = setInterval(function (e) {
					var now = Date.now();
					var elapsed = now - self.timestamp;

					//get delta movement since the last track
					var dX = self.prevX - self.frame[0];
					var dY = self.prevY - self.frame[1];
					self.frame[0] = self.prevX;
					self.frame[1] = self.prevY;

					var delta = Math.sqrt(dX * dX + dY * dY);

					//get speed as average of prev and current (prevent div by zero)
					var v = Math.min(self.velocity * delta / (1 + elapsed), self.maxSpeed);
					self.speed = 0.8 * v + 0.2 * self.speed;

					//get new angle as a last diff
					//NOTE: vector average isn’t the same as speed scalar average
					self.angle = Math.atan2(dY, dX);

					self.emit('track');

					return self;
				}, self.framerate);
			}
		}
	},

	threshold: {
		before: function () {
			var self = this;

			//ignore threshold state, if threshold is none
			if (isZeroArray(self.threshold)) {
				self.state = 'drag';
				return;
			}

			self.element.classList.add('draggy-threshold');

			//emit drag evts on element
			self.emit('threshold');
			emit(self.element, 'threshold');

			//listen to doc movement
			on(doc, 'touchmove' + self._ns + ' mousemove' + self._ns, function (e) {
				e.preventDefault();

				//compare movement to the threshold
				var clientX = getClientX(e, self.touchIdx);
				var clientY = getClientY(e, self.touchIdx);
				var difX = self.prevMouseX - clientX;
				var difY = self.prevMouseY - clientY;

				if (difX < self.threshold[0] || difX > self.threshold[2] || difY < self.threshold[1] || difY > self.threshold[3]) {
					self.update(e);
					self.state = 'drag';
				}
			});
			on(doc, 'mouseup' + self._ns + ' touchend' + self._ns + '', function (e) {
				e.preventDefault();

				//forget touches
				self.resetTouch();

				self.state = 'idle';
			});
		},

		after: function () {
			var self = this;

			self.element.classList.remove('draggy-threshold');

			off(doc, self._ns);
		}
	},

	drag: {
		before: function () {
			var self = this;

			//reduce dragging clutter
			selection.disable(root);

			self.element.classList.add('draggy-drag');

			//emit drag evts on element
			self.emit('dragstart');
			emit(self.element, 'dragstart', null, true);

			//emit drag events on self
			self.emit('drag');
			emit(self.element, 'drag', null, true);

			//stop drag on leave
			on(doc, 'touchend' + self._ns + ' mouseup' + self._ns + ' mouseleave' + self._ns, function (e) {
				e.preventDefault();

				//forget touches - dragend is called once
				self.resetTouch();

				//manage release movement
				if (self.speed > 1) {
					self.state = 'release';
				}

				else {
					self.state = 'idle';
				}
			});

			//move via transform
			on(doc, 'touchmove' + self._ns + ' mousemove' + self._ns, function (e) {
				self.drag(e);
			});
		},

		after: function () {
			var self = this;

			//enable document interactivity
			selection.enable(root);

			self.element.classList.remove('draggy-drag');

			//emit dragend on element, this
			self.emit('dragend');
			emit(self.element, 'dragend', null, true);

			//unbind drag events
			off(doc, self._ns);

			clearInterval(self._trackingInterval);
		}
	},

	release: {
		before: function () {
			var self = this;

			self.element.classList.add('draggy-release');

			//enter animation mode
			clearTimeout(self._animateTimeout);

			//set proper transition
			css(self.element, {
				'transition': (self.releaseDuration) + 'ms ease-out ' + (self.css3 ? 'transform' : 'position')
			});

			//plan leaving anim mode
			self._animateTimeout = setTimeout(function () {
				self.state = 'idle';
			}, self.releaseDuration);


			//calc target point & animate to it
			self.move(
				self.prevX + self.speed * Math.cos(self.angle),
				self.prevY + self.speed * Math.sin(self.angle)
			);

			self.speed = 0;
			self.emit('track');
		},

		after: function () {
			var self = this;

			self.element.classList.remove('draggy-release');

			css(this.element, {
				'transition': null
			});
		}
	},

	destroy: function () {
		var self = this;
	},

	reset: function () {
		var self = this;

		self.currentHandles.forEach(function (handle) {
			off(handle, self._ns);
		});

		clearTimeout(self._animateTimeout);

		off(doc, self._ns);
		off(self.element, self._ns);

		return '_';
	}
};


/** Drag handler. Needed to provide drag movement emulation via API */
proto.drag = function (e) {
	var self = this;

	e.preventDefault();

	var mouseX = getClientX(e, self.touchIdx),
		mouseY = getClientY(e, self.touchIdx);

	//calc mouse movement diff
	var diffMouseX = mouseX - self.prevMouseX,
		diffMouseY = mouseY - self.prevMouseY;

	//absolute mouse coordinate
	var mouseAbsX = mouseX + win.pageXOffset,
		mouseAbsY = mouseY + win.pageYOffset;

	//calc sniper offset, if any
	if (e.ctrlKey || e.metaKey) {
		self.sniperOffsetX += diffMouseX * self.sniperSlowdown;
		self.sniperOffsetY += diffMouseY * self.sniperSlowdown;
	}

	//save refs to the meta keys
	self.ctrlKey = e.ctrlKey;
	self.shiftKey = e.shiftKey;
	self.metaKey = e.metaKey;
	self.altKey = e.altKey;

	//calc movement x and y
	//take absolute placing as it is the only reliable way (2x proved)
	var x = (mouseAbsX - self.initOffsetX) - self.innerOffsetX - self.sniperOffsetX,
		y = (mouseAbsY - self.initOffsetY) - self.innerOffsetY - self.sniperOffsetY;

	//move element
	self.move(x, y);

	//save prevClientXY for calculating diff
	self.prevMouseX = mouseX;
	self.prevMouseY = mouseY;

	//emit drag
	self.emit('drag');
	emit(self.element, 'drag', null, true);
};


/** Current number of draggable touches */
var touches = 0;


/** Manage touches */
proto.setTouch = function (e) {
	if (!e.touches || this.isTouched()) return this;

	//current touch index
	this.touchIdx = touches;
	touches++;

	return this;
};
proto.resetTouch = function () {
	touches = 0;
	this.touchIdx = null;

	return this;
};
proto.isTouched = function () {
	return this.touchIdx !== null;
};


/** Index to fetch touch number from event */
proto.touchIdx = null;


/**
 * Update movement limits.
 * Refresh self.withinOffsets and self.limits.
 */
proto.update = function (e) {
	var self = this;

	//update handles
	self.currentHandles.forEach(function (handle) {
		off(handle, self._ns);
	});

	var cancelEls = q.all(self.cancel);

	self.currentHandles = q.all(self.handle);

	self.currentHandles.forEach(function (handle) {
		on(handle, 'mousedown' + self._ns + ' touchstart' + self._ns, function (e) {
			//mark event as belonging to the draggy
			if (!e.draggies) {
				e.draggies = [];
			}
			//ignore draggies containing other draggies
			if (e.draggies.some(function (draggy) {
				return self.element.contains(draggy.element);
			})) {
				return;
			}
			//ignore events happened within cancelEls
			if (cancelEls.some(function (cancelEl) {
				return cancelEl.contains(e.target);
			})) {
				return;
			}

			//register draggy
			e.draggies.push(self);
		});
	});

	//update limits
	self.updateLimits();

	//preset inner offsets
	self.innerOffsetX = self.pin[0];
	self.innerOffsetY = self.pin[1];

	var selfClientRect = self.element.getBoundingClientRect();

	//if event passed - update acc to event
	if (e) {
		//take last mouse position from the event
		self.prevMouseX = getClientX(e, self.touchIdx);
		self.prevMouseY = getClientY(e, self.touchIdx);

		//if mouse is within the element - take offset normally as rel displacement
		self.innerOffsetX = -selfClientRect.left + getClientX(e, self.touchIdx);
		self.innerOffsetY = -selfClientRect.top + getClientY(e, self.touchIdx);
	}
	//if no event - suppose pin-centered event
	else {
		//take mouse position & inner offset as center of pin
		var pinX = (self.pin[0] + self.pin[2] ) * 0.5;
		var pinY = (self.pin[1] + self.pin[3] ) * 0.5;
		self.prevMouseX = selfClientRect.left + pinX;
		self.prevMouseY = selfClientRect.top + pinY;
		self.innerOffsetX = pinX;
		self.innerOffsetY = pinY;
	}

	//set initial kinetic props
	self.speed = 0;
	self.amplitude = 0;
	self.angle = 0;
	self.timestamp = +new Date();
	self.frame = [self.prevX, self.prevY];

	//set sniper offset
	self.sniperOffsetX = 0;
	self.sniperOffsetY = 0;
};

/**
 * Update limits only from current position
 */
proto.updateLimits = function () {
	var self = this;

	//initial translation offsets
	var initXY = self.getCoords();

	//calc initial coords
	self.prevX = initXY[0];
	self.prevY = initXY[1];
	self.initX = initXY[0];
	self.initY = initXY[1];

	//container rect might be outside the vp, so calc absolute offsets
	//zero-position offsets, with translation(0,0)
	var selfOffsets = offsets(self.element);
	self.initOffsetX = selfOffsets.left - self.prevX;
	self.initOffsetY = selfOffsets.top - self.prevY;
	self.offsets = selfOffsets;

	//handle parent case
	var within = self.within;
	if (self.within === 'parent') {
		within = self.element.parentNode;
	}
	within = within || doc;

	//absolute offsets of a container
	var withinOffsets = offsets(within);
	self.withinOffsets = withinOffsets;

	//calculate movement limits - pin width might be wider than constraints
	self.overflowX = self.pin.width - withinOffsets.width;
	self.overflowY = self.pin.height - withinOffsets.height;
	self.limits = {
		left: withinOffsets.left - self.initOffsetX - self.pin[0] - (self.overflowX < 0 ? 0 : self.overflowX),
		top: withinOffsets.top - self.initOffsetY - self.pin[1] - (self.overflowY < 0 ? 0 : self.overflowY),
		right: self.overflowX > 0 ? 0 : withinOffsets.right - self.initOffsetX - self.pin[2],
		bottom: self.overflowY > 0 ? 0 : withinOffsets.bottom - self.initOffsetY - self.pin[3]
	};
};


/**
 * Update info regarding of movement
 */
proto.updateInfo = function (x, y) {
	var self = this;

	//provide delta from prev state
	self.deltaX = x - self.prevX;
	self.deltaY = y - self.prevY;

	//save prev coords to use as a start point next time
	self.prevX = x;
	self.prevY = y;

	//provide movement delta from initial state
	self.movementX = x - self.initX;
	self.movementY = y - self.initY;

}


/**
 * Way of placement:
 * - position === false (slower but more precise and cross-browser)
 * - translate3d === true (faster but may cause blurs on linux systems)
 */
proto.css3 = {
	_: function () {
		css(this.element, 'position', 'absolute');
		this.getCoords = function () {
			// return [this.element.offsetLeft, this.element.offsetTop];
			return [parseCSSValue(css(this.element,'left')), parseCSSValue(css(this.element, 'top'))];
		};

		this.setCoords = function (x, y) {
			if (x == null) x = this.prevX;
			if (y == null) y = this.prevY;

			x = round(x, this.precision);
			y = round(y, this.precision);

			css(this.element, {
				left: x,
				top: y
			});

			//update movement info
			this.updateInfo(x, y);
		};
	},

	//undefined placing is treated as translate3d
	true: function () {
		this.getCoords  = function () {
			return getTranslate(this.element).slice(0, 2) || [0,0];
		};

		this.setCoords = function (x, y) {
			if (x == null) x = this.prevX;
			if (y == null) y = this.prevY;

			x = round(x, this.precision);
			y = round(y, this.precision);

			css(this.element, 'transform', ['translate3d(', x, 'px,', y, 'px, 0)'].join(''));

			this.updateInfo(x, y);
		};
	}
};


/**
 * Restricting container
 * @type {Element|object}
 * @default doc.documentElement
 */
proto.within = doc;


/** Handle to drag */
proto.handle;


Object.defineProperties(proto, {
	/**
	 * Which area of draggable should not be outside the restriction area.
	 * @type {(Array|number)}
	 * @default [0,0,this.element.offsetWidth, this.element.offsetHeight]
	 */
	pin: {
		set: function (value) {
			if (isArray(value)) {
				if (value.length === 2) {
					this._pin = [value[0], value[1], value[0], value[1]];
				} else if (value.length === 4) {
					this._pin = value;
				}
			}

			else if (isNumber(value)) {
				this._pin = [value, value, value, value];
			}

			else {
				this._pin = value;
			}

			//calc pin params
			this._pin.width = this._pin[2] - this._pin[0];
			this._pin.height = this._pin[3] - this._pin[1];
		},

		get: function () {
			if (this._pin) return this._pin;

			//returning autocalculated pin, if private pin is none
			var pin = [0,0, this.offsets.width, this.offsets.height];
			pin.width = this.offsets.width;
			pin.height = this.offsets.height;
			return pin;
		}
	},

	/** Avoid initial mousemove */
	threshold: {
		set: function (val) {
			if (isNumber(val)) {
				this._threshold = [-val*0.5, -val*0.5, val*0.5, val*0.5];
			} else if (val.length === 2) {
				//Array(w,h)
				this._threshold = [-val[0]*0.5, -val[1]*0.5, val[0]*0.5, val[1]*0.5];
			} else if (val.length === 4) {
				//Array(x1,y1,x2,y2)
				this._threshold = val;
			} else if (isFn(val)) {
				//custom val funciton
				this._threshold = val();
			} else {
				this._threshold = [0,0,0,0];
			}
		},

		get: function () {
			return this._threshold || [0,0,0,0];
		}
	}
});



/**
 * For how long to release movement
 *
 * @type {(number|false)}
 * @default false
 * @todo
 */
proto.release = false;
proto.releaseDuration = 500;
proto.velocity = 1000;
proto.maxSpeed = 250;
proto.framerate = 50;


/** To what extent round position */
proto.precision = 1;


/** Droppable params */
proto.droppable = null;
proto.droppableTolerance = 0.5;
proto.droppableClass = null;


/** Slow down movement by pressing ctrl/cmd */
proto.sniper = true;


/** How much to slow sniper drag */
proto.sniperSlowdown = .85;


/**
 * Restrict movement by axis
 *
 * @default undefined
 * @enum {string}
 */
proto.axis = {
	_: function () {
		this.move = function (x, y) {
			if (x == null) x = this.prevX;
			if (y == null) y = this.prevY;

			var limits = this.limits;

			if (this.repeat) {
				var w = (limits.right - limits.left);
				var h = (limits.bottom - limits.top);
				var oX = - this.initOffsetX + this.withinOffsets.left - this.pin[0] - Math.max(0, this.overflowX);
				var oY = - this.initOffsetY + this.withinOffsets.top - this.pin[1] - Math.max(0, this.overflowY);
				if (this.repeat === 'x') {
					x = loop(x - oX, w) + oX;
				}
				else if (this.repeat === 'y') {
					y = loop(y - oY, h) + oY;
				}
				else {
					x = loop(x - oX, w) + oX;
					y = loop(y - oY, h) + oY;
				}
			}

			x = between(x, limits.left, limits.right);
			y = between(y, limits.top, limits.bottom);

			this.setCoords(x, y);
		};
	},
	x: function () {
		this.move = function (x, y) {
			if (x == null) x = this.prevX;
			if (y == null) y = this.prevY;

			var limits = this.limits;

			if (this.repeat) {
				var w = (limits.right - limits.left);
				var oX = - this.initOffsetX + this.withinOffsets.left - this.pin[0] - Math.max(0, this.overflowX);
				x = loop(x - oX, w) + oX;
			} else {
				x = between(x, limits.left, limits.right);
			}

			this.setCoords(x);
		};
	},
	y: function () {
		this.move = function (x, y) {
			if (x == null) x = this.prevX;
			if (y == null) y = this.prevY;

			var limits = this.limits;

			if (this.repeat) {
				var h = (limits.bottom - limits.top);
				var oY = - this.initOffsetY + this.withinOffsets.top - this.pin[1] - Math.max(0, this.overflowY);
				y = loop(y - oY, h) + oY;
			} else {
				y = between(y, limits.top, limits.bottom);
			}

			this.setCoords(null, y);
		};
	}
};


/** Repeat movement by one of axises */
proto.repeat = false;


/** Check whether arr is filled with zeros */
function isZeroArray(arr) {
	if (!arr[0] && !arr[1] && !arr[2] && !arr[3]) return true;
}



/** Clean all memory-related things */
proto.destroy = function () {
	var self = this;

	self.currentHandles.forEach(function (handle) {
		off(handle, self._ns);
	});

	self.state = 'destroy';

	clearTimeout(self._animateTimeout);

	off(doc, self._ns);
	off(self.element, self._ns);


	self.element = null;
	self.within = null;
};



module.exports = Draggable;
},{"define-state":89,"emmy/emit":91,"emmy/off":93,"emmy/on":94,"events":97,"get-client-xy":98,"get-uid":100,"intersects":107,"mucss/css":117,"mucss/offset":122,"mucss/parse-value":124,"mucss/selection":128,"mucss/translate":129,"mumath/clamp":130,"mumath/mod":131,"mumath/round":133,"mutype/is-array":138,"mutype/is-fn":143,"mutype/is-number":145,"mutype/is-string":150,"queried":157,"xtend/mutable":222}],91:[function(require,module,exports){
/**
 * @module emmy/emit
 */
var icicle = require('icicle');
var slice = require('sliced');
var isString = require('mutype/is-string');
var isNode = require('mutype/is-node');
var isEvent = require('mutype/is-event');
var listeners = require('./listeners');


/**
 * A simple wrapper to handle stringy/plain events
 */
module.exports = function(target, evt){
	if (!target) return;

	var args = arguments;
	if (isString(evt)) {
		args = slice(arguments, 2);
		evt.split(/\s+/).forEach(function(evt){
			evt = evt.split('.')[0];

			emit.apply(this, [target, evt].concat(args));
		});
	} else {
		return emit.apply(this, args);
	}
};


/** detect env */
var $ = typeof jQuery === 'undefined' ? undefined : jQuery;
var doc = typeof document === 'undefined' ? undefined : document;
var win = typeof window === 'undefined' ? undefined : window;


/**
 * Emit an event, optionally with data or bubbling
 * Accept only single elements/events
 *
 * @param {string} eventName An event name, e. g. 'click'
 * @param {*} data Any data to pass to event.details (DOM) or event.data (elsewhere)
 * @param {bool} bubbles Whether to trigger bubbling event (DOM)
 *
 *
 * @return {target} a target
 */
function emit(target, eventName, data, bubbles){
	var emitMethod, evt = eventName;

	//Create proper event for DOM objects
	if (isNode(target) || target === win) {
		//NOTE: this doesnot bubble on off-DOM elements

		if (isEvent(eventName)) {
			evt = eventName;
		} else {
			//IE9-compliant constructor
			evt = doc.createEvent('CustomEvent');
			evt.initCustomEvent(eventName, bubbles, true, data);

			//a modern constructor would be:
			// var evt = new CustomEvent(eventName, { detail: data, bubbles: bubbles })
		}

		emitMethod = target.dispatchEvent;
	}

	//create event for jQuery object
	else if ($ && target instanceof $) {
		//TODO: decide how to pass data
		evt = $.Event( eventName, data );
		evt.detail = data;

		//FIXME: reference case where triggerHandler needed (something with multiple calls)
		emitMethod = bubbles ? targte.trigger : target.triggerHandler;
	}

	//detect target events
	else {
		//emit - default
		//trigger - jquery
		//dispatchEvent - DOM
		//raise - node-state
		//fire - ???
		emitMethod = target['dispatchEvent'] || target['emit'] || target['trigger'] || target['fire'] || target['raise'];
	}


	var args = slice(arguments, 2);


	//use locks to avoid self-recursion on objects wrapping this method
	if (emitMethod) {
		if (icicle.freeze(target, 'emit' + eventName)) {
			//use target event system, if possible
			emitMethod.apply(target, [evt].concat(args));
			icicle.unfreeze(target, 'emit' + eventName);

			return target;
		}

		//if event was frozen - probably it is emitter instance
		//so perform normal callback
	}


	//fall back to default event system
	var evtCallbacks = listeners(target, evt);

	//copy callbacks to fire because list can be changed by some callback (like `off`)
	var fireList = slice(evtCallbacks);
	for (var i = 0; i < fireList.length; i++ ) {
		fireList[i] && fireList[i].apply(target, args);
	}

	return target;
}
},{"./listeners":92,"icicle":103,"mutype/is-event":142,"mutype/is-node":144,"mutype/is-string":150,"sliced":172}],92:[function(require,module,exports){
/**
 * A storage of per-target callbacks.
 * WeakMap is the most safe solution.
 *
 * @module emmy/listeners
 */


/**
 * Property name to provide on targets.
 *
 * Can’t use global WeakMap -
 * it is impossible to provide singleton global cache of callbacks for targets
 * not polluting global scope. So it is better to pollute target scope than the global.
 *
 * Otherwise, each emmy instance will create it’s own cache, which leads to mess.
 *
 * Also can’t use `._events` property on targets, as it is done in `events` module,
 * because it is incompatible. Emmy targets universal events wrapper, not the native implementation.
 *
 */
//FIXME: new npm forces flat modules structure, so weakmaps are better providing that there’s the one emmy across the project.
var cbPropName = '_callbacks';


/**
 * Get listeners for the target/evt (optionally).
 *
 * @param {object} target a target object
 * @param {string}? evt an evt name, if undefined - return object with events
 *
 * @return {(object|array)} List/set of listeners
 */
function listeners(target, evt, tags){
	var cbs = target[cbPropName];
	var result;

	if (!evt) {
		result = cbs || {};

		//filter cbs by tags
		if (tags) {
			var filteredResult = {};
			for (var evt in result) {
				filteredResult[evt] = result[evt].filter(function (cb) {
					return hasTags(cb, tags);
				});
			}
			result = filteredResult;
		}

		return result;
	}

	if (!cbs || !cbs[evt]) {
		return [];
	}

	result = cbs[evt];

	//if there are evt namespaces specified - filter callbacks
	if (tags && tags.length) {
		result = result.filter(function (cb) {
			return hasTags(cb, tags);
		});
	}

	return result;
}


/**
 * Remove listener, if any
 */
listeners.remove = function(target, evt, cb, tags){
	//get callbacks for the evt
	var evtCallbacks = target[cbPropName];
	if (!evtCallbacks || !evtCallbacks[evt]) return false;

	var callbacks = evtCallbacks[evt];

	//if tags are passed - make sure callback has some tags before removing
	if (tags && tags.length && !hasTags(cb, tags)) return false;

	//remove specific handler
	for (var i = 0; i < callbacks.length; i++) {
		//once method has original callback in .cb
		if (callbacks[i] === cb || callbacks[i].fn === cb) {
			callbacks.splice(i, 1);
			break;
		}
	}
};


/**
 * Add a new listener
 */
listeners.add = function(target, evt, cb, tags){
	if (!cb) return;

	var targetCallbacks = target[cbPropName];

	//ensure set of callbacks for the target exists
	if (!targetCallbacks) {
		targetCallbacks = {};
		Object.defineProperty(target, cbPropName, {
			value: targetCallbacks
		});
	}

	//save a new callback
	(targetCallbacks[evt] = targetCallbacks[evt] || []).push(cb);

	//save ns for a callback, if any
	if (tags && tags.length) {
		cb._ns = tags;
	}
};


/** Detect whether an cb has at least one tag from the list */
function hasTags(cb, tags){
	if (cb._ns) {
		//if cb is tagged with a ns and includes one of the ns passed - keep it
		for (var i = tags.length; i--;){
			if (cb._ns.indexOf(tags[i]) >= 0) return true;
		}
	}
}


module.exports = listeners;
},{}],93:[function(require,module,exports){
/**
 * @module emmy/off
 */
module.exports = off;

var icicle = require('icicle');
var slice = require('sliced');
var listeners = require('./listeners');
var isArray = require('mutype/is-array');


/**
 * Remove listener[s] from the target
 *
 * @param {[type]} evt [description]
 * @param {Function} fn [description]
 *
 * @return {[type]} [description]
 */
function off(target, evt, fn) {
	if (!target) return target;

	var callbacks, i;

	//unbind all listeners if no fn specified
	if (fn === undefined) {
		var args = slice(arguments, 1);

		//try to use target removeAll method, if any
		var allOff = target['removeAll'] || target['removeAllListeners'];

		//call target removeAll
		if (allOff) {
			allOff.apply(target, args);
		}


		//then forget own callbacks, if any

		//unbind all evts
		if (!evt) {
			callbacks = listeners(target);
			for (evt in callbacks) {
				off(target, evt);
			}
		}
		//unbind all callbacks for an evt
		else {
			evt = '' + evt;

			//invoke method for each space-separated event from a list
			evt.split(/\s+/).forEach(function (evt) {
				var evtParts = evt.split('.');
				evt = evtParts.shift();
				callbacks = listeners(target, evt, evtParts);

				//returned array of callbacks (as event is defined)
				if (evt) {
					var obj = {};
					obj[evt] = callbacks;
					callbacks = obj;
				}

				//for each group of callbacks - unbind all
				for (var evtName in callbacks) {
					slice(callbacks[evtName]).forEach(function (cb) {
						off(target, evtName, cb);
					});
				}
			});
		}

		return target;
	}


	//target events (string notation to advanced_optimizations)
	var offMethod = target['removeEventListener'] || target['removeListener'] || target['detachEvent'] || target['off'];

	//invoke method for each space-separated event from a list
	evt.split(/\s+/).forEach(function (evt) {
		var evtParts = evt.split('.');
		evt = evtParts.shift();

		//use target `off`, if possible
		if (offMethod) {
			//avoid self-recursion from the outside
			if (icicle.freeze(target, 'off' + evt)) {
				offMethod.call(target, evt, fn);
				icicle.unfreeze(target, 'off' + evt);
			}

			//if it’s frozen - ignore call
			else {
				return target;
			}
		}

		if (fn.closedCall) fn.closedCall = false;

		//forget callback
		listeners.remove(target, evt, fn, evtParts);
	});


	return target;
}
},{"./listeners":92,"icicle":103,"mutype/is-array":138,"sliced":172}],94:[function(require,module,exports){
/**
 * @module emmy/on
 */


var icicle = require('icicle');
var listeners = require('./listeners');
var isObject = require('mutype/is-object');

module.exports = on;


/**
 * Bind fn to a target.
 *
 * @param {*} targte A single target to bind evt
 * @param {string} evt An event name
 * @param {Function} fn A callback
 * @param {Function}? condition An optional filtering fn for a callback
 *                              which accepts an event and returns callback
 *
 * @return {object} A target
 */
function on(target, evt, fn){
	if (!target) return target;

	//consider object of events
	if (isObject(evt)) {
		for(var evtName in evt) {
			on(target, evtName, evt[evtName]);
		}
		return target;
	}

	//get target `on` method, if any
	//prefer native-like method name
	//user may occasionally expose `on` to the global, in case of browserify
	//but it is unlikely one would replace native `addEventListener`
	var onMethod =  target['addEventListener'] || target['addListener'] || target['attachEvent'] || target['on'];

	var cb = fn;

	evt = '' + evt;

	//invoke method for each space-separated event from a list
	evt.split(/\s+/).forEach(function(evt){
		var evtParts = evt.split('.');
		evt = evtParts.shift();

		//use target event system, if possible
		if (onMethod) {
			//avoid self-recursions
			//if it’s frozen - ignore call
			if (icicle.freeze(target, 'on' + evt)){
				onMethod.call(target, evt, cb);
				icicle.unfreeze(target, 'on' + evt);
			}
			else {
				return target;
			}
		}

		//save the callback anyway
		listeners.add(target, evt, cb, evtParts);
	});

	return target;
}


/**
 * Wrap an fn with condition passing
 */
on.wrap = function(target, evt, fn, condition){
	var cb = function() {
		if (condition.apply(target, arguments)) {
			return fn.apply(target, arguments);
		}
	};

	cb.fn = fn;

	return cb;
};
},{"./listeners":92,"icicle":103,"mutype/is-object":146}],95:[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

},{}],96:[function(require,module,exports){
'use strict';

var OneVersionConstraint = require('individual/one-version');

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

},{"individual/one-version":105}],97:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],98:[function(require,module,exports){
/**
 * Get clientY/clientY from an event.
 * If index is passed, treat it as index of global touches, not the targetTouches.
 * Global touches include target touches.
 *
 * @module get-client-xy
 *
 * @param {Event} e Event raised, like mousemove
 *
 * @return {number} Coordinate relative to the screen
 */
function getClientY (e, idx) {
	// touch event
	if (e.touches) {
		if (arguments.length > 1) {
			return findTouch(e.touches, idx).clientY
		}
		else {
			return e.targetTouches[0].clientY;
		}
	}

	// mouse event
	return e.clientY;
}
function getClientX (e, idx) {
	// touch event
	if (e.touches) {
		if (arguments.length > idx) {
			return findTouch(e.touches, idx).clientX;
		}
		else {
			return e.targetTouches[0].clientX;
		}
	}

	// mouse event
	return e.clientX;
}

function getClientXY (e, idx) {
	return [getClientX.apply(this, arguments), getClientY.apply(this, arguments)];
}

function findTouch (touchList, idx) {
	for (var i = 0; i < touchList.length; i++) {
		if (touchList[i].identifier === idx) {
			return touchList[i];
		}
	}
}


getClientXY.x = getClientX;
getClientXY.y = getClientY;
getClientXY.findTouch = findTouch;

module.exports = getClientXY;
},{}],99:[function(require,module,exports){
/**
 * @module  get-doc
 */

var hasDom = require('has-dom');

module.exports = hasDom() ? document : null;
},{"has-dom":102}],100:[function(require,module,exports){
/** generate unique id for selector */
var counter = Date.now() % 1e9;

module.exports = function getUid(){
	return (Math.random() * 1e9 >>> 0) + (counter++);
};
},{}],101:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":77}],102:[function(require,module,exports){
'use strict';
module.exports = function () {
	return typeof window !== 'undefined'
		&& typeof document !== 'undefined'
		&& typeof document.createElement === 'function';
};

},{}],103:[function(require,module,exports){
/**
 * @module Icicle
 */
module.exports = {
	freeze: lock,
	unfreeze: unlock,
	isFrozen: isLocked
};


/** Set of targets  */
var lockCache = new WeakMap;


/**
 * Set flag on target with the name passed
 *
 * @return {bool} Whether lock succeeded
 */
function lock(target, name){
	var locks = lockCache.get(target);
	if (locks && locks[name]) return false;

	//create lock set for a target, if none
	if (!locks) {
		locks = {};
		lockCache.set(target, locks);
	}

	//set a new lock
	locks[name] = true;

	//return success
	return true;
}


/**
 * Unset flag on the target with the name passed.
 *
 * Note that if to return new value from the lock/unlock,
 * then unlock will always return false and lock will always return true,
 * which is useless for the user, though maybe intuitive.
 *
 * @param {*} target Any object
 * @param {string} name A flag name
 *
 * @return {bool} Whether unlock failed.
 */
function unlock(target, name){
	var locks = lockCache.get(target);
	if (!locks || !locks[name]) return false;

	locks[name] = null;

	return true;
}


/**
 * Return whether flag is set
 *
 * @param {*} target Any object to associate lock with
 * @param {string} name A flag name
 *
 * @return {Boolean} Whether locked or not
 */
function isLocked(target, name){
	var locks = lockCache.get(target);
	return (locks && locks[name]);
}
},{}],104:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],105:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":104}],106:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],107:[function(require,module,exports){
/** @module  intersects */
module.exports = intersects;


var min = Math.min, max = Math.max;


/**
 * Main intersection detector.
 *
 * @param {Rectangle} a Target
 * @param {Rectangle} b Container
 *
 * @return {bool} Whether target is within the container
 */
function intersects (a, b, tolerance){
	//ignore definite disintersection
	if (a.right < b.left || a.left > b.right) return false;
	if (a.bottom < b.top || a.top > b.bottom) return false;

	//intersection values
	var iX = min(a.right - max(b.left, a.left), b.right - max(a.left, b.left));
	var iY = min(a.bottom - max(b.top, a.top), b.bottom - max(a.top, b.top));
	var iSquare = iX * iY;

	var bSquare = (b.bottom - b.top) * (b.right - b.left);
	var aSquare = (a.bottom - a.top) * (a.right - a.left);

	//measure square overlap relative to the min square
	var targetSquare = min(aSquare, bSquare);


	//minimal overlap ratio
	tolerance = tolerance !== undefined ? tolerance : 0.5;

	if (iSquare / targetSquare > tolerance) {
		return true;
	}

	return false;
}
},{}],108:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],109:[function(require,module,exports){
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;
  
  if (isObjectObject(o) === false) return false;
  
  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;
  
  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;
  
  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }
  
  // Most likely a plain Object
  return true;
};

},{"isobject":110}],110:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function isObject(val) {
  return val != null && typeof val === 'object'
    && !Array.isArray(val);
};

},{}],111:[function(require,module,exports){
/**
 * lodash 3.9.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = getNative;

},{}],112:[function(require,module,exports){
/**
 * lodash 4.0.6 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @type {Function}
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred function to be invoked.
 */
var now = Date.now;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide an options object to indicate whether `func` should be invoked on
 * the leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent calls
 * to the debounced function return the result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime = 0,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (!lastCallTime || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    clearTimeout(timerId);
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastCallTime = lastInvokeTime = 0;
    lastArgs = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3);
 * // => 3
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3');
 * // => 3
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = isFunction(value.valueOf) ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

},{}],113:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var debounce = require('lodash.debounce');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed invocations. Provide an options object to indicate
 * that `func` should be invoked on the leading and/or trailing edge of the
 * `wait` timeout. Subsequent calls to the throttled function return the
 * result of the last `func` call.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the throttled function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=true] Specify invoking on the leading
 *  edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // avoid excessively updating the position while scrolling
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
 * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
 *   'trailing': false
 * }));
 *
 * // cancel a trailing throttled call
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (options === false) {
    leading = false;
  } else if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, { 'leading': leading, 'maxWait': +wait, 'trailing': trailing });
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = throttle;

},{"lodash.debounce":114}],114:[function(require,module,exports){
/**
 * lodash 3.1.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var getNative = require('lodash._getnative');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeNow = getNative(Date, 'now');

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Date
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => logs the number of milliseconds it took for the deferred function to be invoked
 */
var now = nativeNow || function() {
  return new Date().getTime();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed invocations. Provide an options object to indicate that `func`
 * should be invoked on the leading and/or trailing edge of the `wait` timeout.
 * Subsequent calls to the debounced function return the result of the last
 * `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify invoking on the leading
 *  edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be
 *  delayed before it is invoked.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // ensure `batchLog` is invoked once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }));
 *
 * // cancel a debounced call
 * var todoChanges = _.debounce(batchLog, 1000);
 * Object.observe(models.todo, todoChanges);
 *
 * Object.observe(models, function(changes) {
 *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
 *     todoChanges.cancel();
 *   }
 * }, ['delete']);
 *
 * // ...at some point `models.todo` is changed
 * models.todo.completed = true;
 *
 * // ...before 1 second has passed `models.todo` is deleted
 * // which cancels the debounced `todoChanges` call
 * delete models.todo;
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = wait < 0 ? 0 : (+wait || 0);
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = !!options.leading;
    maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
    }
    lastCalled = 0;
    maxTimeoutId = timeoutId = trailingCall = undefined;
  }

  function complete(isCalled, id) {
    if (id) {
      clearTimeout(id);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (isCalled) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = undefined;
      }
    }
  }

  function delayed() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0 || remaining > wait) {
      complete(trailingCall, maxTimeoutId);
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  }

  function maxDelayed() {
    complete(trailing, timeoutId);
  }

  function debounced() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0 || remaining > maxWait;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      }
      else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    }
    else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = undefined;
    }
    return result;
  }
  debounced.cancel = cancel;
  return debounced;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = debounce;

},{"lodash._getnative":111}],115:[function(require,module,exports){
/**
 * Special language-specific overrides.
 *
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 *
 * @type {Object}
 */
var LANGUAGES = {
  tr: {
    regexp: /\u0130|\u0049|\u0049\u0307/g,
    map: {
      '\u0130': '\u0069',
      '\u0049': '\u0131',
      '\u0049\u0307': '\u0069'
    }
  },
  az: {
    regexp: /[\u0130]/g,
    map: {
      '\u0130': '\u0069',
      '\u0049': '\u0131',
      '\u0049\u0307': '\u0069'
    }
  },
  lt: {
    regexp: /[\u0049\u004A\u012E\u00CC\u00CD\u0128]/g,
    map: {
      '\u0049': '\u0069\u0307',
      '\u004A': '\u006A\u0307',
      '\u012E': '\u012F\u0307',
      '\u00CC': '\u0069\u0307\u0300',
      '\u00CD': '\u0069\u0307\u0301',
      '\u0128': '\u0069\u0307\u0303'
    }
  }
}

/**
 * Lowercase a string.
 *
 * @param  {String} str
 * @return {String}
 */
module.exports = function (str, locale) {
  var lang = LANGUAGES[locale]

  str = str == null ? '' : String(str)

  if (lang) {
    str = str.replace(lang.regexp, function (m) { return lang.map[m] })
  }

  return str.toLowerCase()
}

},{}],116:[function(require,module,exports){
/**
 * Parse element’s borders
 *
 * @module mucss/borders
 */

var Rect = require('./rect');
var parse = require('./parse-value');

/**
 * Return border widths of an element
 */
module.exports = function(el){
	if (el === window) return Rect();

	if (!(el instanceof Element)) throw Error('Argument is not an element');

	var style = window.getComputedStyle(el);

	return Rect(
		parse(style.borderLeftWidth),
		parse(style.borderTopWidth),
		parse(style.borderRightWidth),
		parse(style.borderBottomWidth)
	);
};
},{"./parse-value":124,"./rect":126}],117:[function(require,module,exports){
/**
 * Get or set element’s style, prefix-agnostic.
 *
 * @module  mucss/css
 */
var fakeStyle = require('./fake-element').style;
var prefix = require('./prefix').lowercase;


/**
 * Apply styles to an element.
 *
 * @param    {Element}   el   An element to apply styles.
 * @param    {Object|string}   obj   Set of style rules or string to get style rule.
 */
module.exports = function(el, obj){
	if (!el || !obj) return;

	var name, value;

	//return value, if string passed
	if (typeof obj === 'string') {
		name = obj;

		//return value, if no value passed
		if (arguments.length < 3) {
			return el.style[prefixize(name)];
		}

		//set style, if value passed
		value = arguments[2] || '';
		obj = {};
		obj[name] = value;
	}

	for (name in obj){
		//convert numbers to px
		if (typeof obj[name] === 'number' && /left|right|bottom|top|width|height/i.test(name)) obj[name] += 'px';

		value = obj[name] || '';

		el.style[prefixize(name)] = value;
	}
};


/**
 * Return prefixized prop name, if needed.
 *
 * @param    {string}   name   A property name.
 * @return   {string}   Prefixed property name.
 */
function prefixize(name){
	var uName = name[0].toUpperCase() + name.slice(1);
	if (fakeStyle[name] !== undefined) return name;
	if (fakeStyle[prefix + uName] !== undefined) return prefix + uName;
	return '';
}

},{"./fake-element":118,"./prefix":125}],118:[function(require,module,exports){
/** Just a fake element to test styles
 * @module mucss/fake-element
 */

module.exports = document.createElement('div');
},{}],119:[function(require,module,exports){
/**
 * Window scrollbar detector.
 *
 * @module mucss/has-scroll
 */

//TODO: detect any element scroll, not only the window
exports.x = function () {
	return window.innerHeight > document.documentElement.clientHeight;
};
exports.y = function () {
	return window.innerWidth > document.documentElement.clientWidth;
};
},{}],120:[function(require,module,exports){
/**
 * Detect whether element is placed to fixed container or is fixed itself.
 *
 * @module mucss/is-fixed
 *
 * @param {(Element|Object)} el Element to detect fixedness.
 *
 * @return {boolean} Whether element is nested.
 */
module.exports = function (el) {
	var parentEl = el;

	//window is fixed, btw
	if (el === window) return true;

	//unlike the doc
	if (el === document) return false;

	while (parentEl) {
		if (getComputedStyle(parentEl).position === 'fixed') return true;
		parentEl = parentEl.offsetParent;
	}
	return false;
};
},{}],121:[function(require,module,exports){
/**
 * Get margins of an element.
 * @module mucss/margins
 */

var parse = require('./parse-value');
var Rect = require('./rect');

/**
 * Return margins of an element.
 *
 * @param    {Element}   el   An element which to calc margins.
 * @return   {Object}   Paddings object `{top:n, bottom:n, left:n, right:n}`.
 */
module.exports = function(el){
	if (el === window) return Rect();

	if (!(el instanceof Element)) throw Error('Argument is not an element');

	var style = window.getComputedStyle(el);

	return Rect(
		parse(style.marginLeft),
		parse(style.marginTop),
		parse(style.marginRight),
		parse(style.marginBottom)
	);
};

},{"./parse-value":124,"./rect":126}],122:[function(require,module,exports){
/**
 * Calculate absolute offsets of an element, relative to the document.
 *
 * @module mucss/offsets
 *
 */
var win = window;
var doc = document;
var Rect = require('./rect');
var hasScroll = require('./has-scroll');
var scrollbar = require('./scrollbar');
var isFixedEl = require('./is-fixed');
var getTranslate = require('./translate');


/**
 * Return absolute offsets of any target passed
 *
 * @param    {Element|window}   el   A target. Pass window to calculate viewport offsets
 * @return   {Object}   Offsets object with trbl.
 */
module.exports = offsets;

function offsets (el) {
	if (!el) throw Error('Bad argument');

	//calc client rect
	var cRect, result;

	//return vp offsets
	if (el === win) {
		result = Rect(
			win.pageXOffset,
			win.pageYOffset
		);

		result.width = win.innerWidth - (hasScroll.y() ? scrollbar : 0),
		result.height = win.innerHeight - (hasScroll.x() ? scrollbar : 0)
		result.right = result.left + result.width;
		result.bottom = result.top + result.height;

		return result;
	}

	//return absolute offsets if document requested
	else if (el === doc) {
		var res = offsets(doc.documentElement);
		res.bottom = Math.max(window.innerHeight, res.bottom);
		res.right = Math.max(window.innerWidth, res.right);
		if (hasScroll.y(doc.documentElement)) res.right -= scrollbar;
		if (hasScroll.x(doc.documentElement)) res.bottom -= scrollbar;
		return res;
	}

	//FIXME: why not every element has getBoundingClientRect method?
	try {
		cRect = el.getBoundingClientRect();
	} catch (e) {
		cRect = Rect(
			el.clientLeft,
			el.clientTop
		);
	}

	//whether element is or is in fixed
	var isFixed = isFixedEl(el);
	var xOffset = isFixed ? 0 : win.pageXOffset;
	var yOffset = isFixed ? 0 : win.pageYOffset;

	result = Rect(
		cRect.left + xOffset,
		cRect.top + yOffset,
		cRect.left + xOffset + el.offsetWidth,
		cRect.top + yOffset + el.offsetHeight
	);

	return result;
};
},{"./has-scroll":119,"./is-fixed":120,"./rect":126,"./scrollbar":127,"./translate":129}],123:[function(require,module,exports){
/**
 * Caclulate paddings of an element.
 * @module  mucss/paddings
 */


var Rect = require('./rect');
var parse = require('./parse-value');


/**
 * Return paddings of an element.
 *
 * @param    {Element}   el   An element to calc paddings.
 * @return   {Object}   Paddings object `{top:n, bottom:n, left:n, right:n}`.
 */
module.exports = function(el){
	if (el === window) return Rect();

	if (!(el instanceof Element)) throw Error('Argument is not an element');

	var style = window.getComputedStyle(el);

	return Rect(
		parse(style.paddingLeft),
		parse(style.paddingTop),
		parse(style.paddingRight),
		parse(style.paddingBottom)
	);
};
},{"./parse-value":124,"./rect":126}],124:[function(require,module,exports){
/**
 * Returns parsed css value.
 *
 * @module mucss/parse-value
 *
 * @param {string} str A string containing css units value
 *
 * @return {number} Parsed number value
 */
module.exports = function (str){
	str += '';
	return parseFloat(str.slice(0,-2)) || 0;
};

//FIXME: add parsing units
},{}],125:[function(require,module,exports){
/**
 * Vendor prefixes
 * Method of http://davidwalsh.name/vendor-prefix
 * @module mucss/prefix
 */

var styles = getComputedStyle(document.documentElement, '');

if (!styles) {
	module.exports = {
		dom: '', lowercase: '', css: '', js: ''
	};
}

else {
	var pre = (Array.prototype.slice.call(styles)
		.join('')
		.match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
	)[1];

	var dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];

	module.exports = {
		dom: dom,
		lowercase: pre,
		css: '-' + pre + '-',
		js: pre[0].toUpperCase() + pre.substr(1)
	};
}

},{}],126:[function(require,module,exports){
/**
 * Simple rect constructor.
 * It is just faster and smaller than constructing an object.
 *
 * @module mucss/rect
 *
 * @param {number} l left
 * @param {number} t top
 * @param {number} r right
 * @param {number} b bottom
 *
 * @return {Rect} A rectangle object
 */
module.exports = function Rect (l,t,r,b) {
	if (!(this instanceof Rect)) return new Rect(l,t,r,b);

	this.left=l||0;
	this.top=t||0;
	this.right=r||0;
	this.bottom=b||0;
	this.width=Math.abs(this.right - this.left);
	this.height=Math.abs(this.bottom - this.top);
};
},{}],127:[function(require,module,exports){
/**
 * Calculate scrollbar width.
 *
 * @module mucss/scrollbar
 */

// Create the measurement node
var scrollDiv = document.createElement("div");

var style = scrollDiv.style;

style.width = '100px';
style.height = '100px';
style.overflow = 'scroll';
style.position = 'absolute';
style.top = '-9999px';

document.documentElement.appendChild(scrollDiv);

// the scrollbar width
module.exports = scrollDiv.offsetWidth - scrollDiv.clientWidth;

// Delete fake DIV
document.documentElement.removeChild(scrollDiv);
},{}],128:[function(require,module,exports){
/**
 * Enable/disable selectability of an element
 * @module mucss/selection
 */
var css = require('./css');


/**
 * Disable or Enable any selection possibilities for an element.
 *
 * @param    {Element}   el   Target to make unselectable.
 */
exports.disable = function(el){
	css(el, {
		'user-select': 'none',
		'user-drag': 'none',
		'touch-callout': 'none'
	});
	el.setAttribute('unselectable', 'on');
	el.addEventListener('selectstart', pd);
};
exports.enable = function(el){
	css(el, {
		'user-select': null,
		'user-drag': null,
		'touch-callout': null
	});
	el.removeAttribute('unselectable');
	el.removeEventListener('selectstart', pd);
};


/** Prevent you know what. */
function pd(e){
	e.preventDefault();
}
},{"./css":117}],129:[function(require,module,exports){
/**
 * Parse translate3d
 *
 * @module mucss/translate
 */

var css = require('./css');
var parseValue = require('./parse-value');

module.exports = function (el) {
	var translateStr = css(el, 'transform');

	//find translate token, retrieve comma-enclosed values
	//translate3d(1px, 2px, 2) → 1px, 2px, 2
	//FIXME: handle nested calcs
	var match = /translate(?:3d)?\s*\(([^\)]*)\)/.exec(translateStr);

	if (!match) return [0, 0];
	var values = match[1].split(/\s*,\s*/);

	//parse values
	//FIXME: nested values are not necessarily pixels
	return values.map(function (value) {
		return parseValue(value);
	});
};
},{"./css":117,"./parse-value":124}],130:[function(require,module,exports){
/**
 * Clamp value.
 * Detects proper clamp min/max.
 *
 * @param {number} a Current value to cut off
 * @param {number} min One side limit
 * @param {number} max Other side limit
 *
 * @return {number} Clamped value
 */

module.exports = require('./wrap')(function(a, min, max){
	return max > min ? Math.max(Math.min(a,max),min) : Math.max(Math.min(a,min),max);
});
},{"./wrap":134}],131:[function(require,module,exports){
/**
 * Looping function for any framesize.
 * Like fmod.
 *
 * @module  mumath/loop
 *
 */

module.exports = require('./wrap')(function (value, left, right) {
	//detect single-arg case, like mod-loop or fmod
	if (right === undefined) {
		right = left;
		left = 0;
	}

	//swap frame order
	if (left > right) {
		var tmp = right;
		right = left;
		left = tmp;
	}

	var frame = right - left;

	value = ((value + left) % frame) - left;
	if (value < left) value += frame;
	if (value > right) value -= frame;

	return value;
});
},{"./wrap":134}],132:[function(require,module,exports){
/**
 * @module  mumath/precision
 *
 * Get precision from float:
 *
 * @example
 * 1.1 → 1, 1234 → 0, .1234 → 4
 *
 * @param {number} n
 *
 * @return {number} decimap places
 */

module.exports = require('./wrap')(function(n){
	var s = n + '',
		d = s.indexOf('.') + 1;

	return !d ? 0 : s.length - d;
});
},{"./wrap":134}],133:[function(require,module,exports){
/**
 * Precision round
 *
 * @param {number} value
 * @param {number} step Minimal discrete to round
 *
 * @return {number}
 *
 * @example
 * toPrecision(213.34, 1) == 213
 * toPrecision(213.34, .1) == 213.3
 * toPrecision(213.34, 10) == 210
 */
var precision = require('./precision');

module.exports = require('./wrap')(function(value, step) {
	if (step === 0) return value;
	if (!step) return Math.round(value);
	step = parseFloat(step);
	value = Math.round(value / step) * step;
	return parseFloat(value.toFixed(precision(step)));
});
},{"./precision":132,"./wrap":134}],134:[function(require,module,exports){
/**
 * Get fn wrapped with array/object attrs recognition
 *
 * @return {Function} Target function
 */
module.exports = function(fn){
	return function (a) {
		var args = arguments;
		if (a instanceof Array) {
			var result = new Array(a.length), slice;
			for (var i = 0; i < a.length; i++){
				slice = [];
				for (var j = 0, l = args.length, val; j < l; j++){
					val = args[j] instanceof Array ? args[j][i] : args[j];
					val = val;
					slice.push(val);
				}
				result[i] = fn.apply(this, slice);
			}
			return result;
		}
		else if (typeof a === 'object') {
			var result = {}, slice;
			for (var i in a){
				slice = [];
				for (var j = 0, l = args.length, val; j < l; j++){
					val = typeof args[j] === 'object' ? args[j][i] : args[j];
					val = val;
					slice.push(val);
				}
				result[i] = fn.apply(this, slice);
			}
			return result;
		}
		else {
			return fn.apply(this, args);
		}
	};
};
},{}],135:[function(require,module,exports){
//speedy implementation of `in`
//NOTE: `!target[propName]` 2-3 orders faster than `!(propName in target)`
module.exports = function(a, b){
	if (!a) return false;

	//NOTE: this causes getter fire
	if (a[b]) return true;

	//FIXME: why in is better than hasOwnProperty? Something with prototypes. Show a case.
	return b in a;
	// return a.hasOwnProperty(b);
}

},{}],136:[function(require,module,exports){
/**
* Trivial types checkers.
* Because there’re no common lib for that ( lodash_ is a fatguy)
*/
//TODO: make main use as `is.array(target)`
//TODO: separate by libs, included per-file

module.exports = {
	has: require('./has'),
	isObject: require('./is-object'),
	isFn: require('./is-fn'),
	isString: require('./is-string'),
	isNumber: require('./is-number'),
	isBoolean: require('./is-bool'),
	isPlain: require('./is-plain'),
	isArray: require('./is-array'),
	isArrayLike: require('./is-array-like'),
	isElement: require('./is-element'),
	isPrivateName: require('./is-private-name'),
	isRegExp: require('./is-regex'),
	isEmpty: require('./is-empty')
};

},{"./has":135,"./is-array":138,"./is-array-like":137,"./is-bool":139,"./is-element":140,"./is-empty":141,"./is-fn":143,"./is-number":145,"./is-object":146,"./is-plain":147,"./is-private-name":148,"./is-regex":149,"./is-string":150}],137:[function(require,module,exports){
var isString = require('./is-string');
var isArray = require('./is-array');
var isFn = require('./is-fn');

//FIXME: add tests from http://jsfiddle.net/ku9LS/1/
module.exports = function (a){
	return isArray(a) || (a && !isString(a) && !a.nodeType && (typeof window != 'undefined' ? a != window : true) && !isFn(a) && typeof a.length === 'number');
}
},{"./is-array":138,"./is-fn":143,"./is-string":150}],138:[function(require,module,exports){
module.exports = function(a){
	return a instanceof Array;
}
},{}],139:[function(require,module,exports){
module.exports = function(a){
	return typeof a === 'boolean' || a instanceof Boolean;
}
},{}],140:[function(require,module,exports){
module.exports = function(target){
	return typeof document !== 'undefined' && target instanceof HTMLElement;
};
},{}],141:[function(require,module,exports){
module.exports = function(a){
	if (!a) return true;
	for (var k in a) {
		return false;
	}
	return true;
}
},{}],142:[function(require,module,exports){
module.exports = function(target){
	return typeof Event !== 'undefined' && target instanceof Event;
};
},{}],143:[function(require,module,exports){
module.exports = function(a){
	return !!(a && a.apply);
}
},{}],144:[function(require,module,exports){
module.exports = function(target){
	return typeof document !== 'undefined' && target instanceof Node;
};
},{}],145:[function(require,module,exports){
module.exports = function(a){
	return typeof a === 'number' || a instanceof Number;
}
},{}],146:[function(require,module,exports){
/**
 * @module mutype/is-object
 */

//TODO: add st8 tests

//isPlainObject indeed
module.exports = function(o){
	// return obj === Object(obj);
	return !!o && typeof o === 'object' && o.constructor === Object;
};

},{}],147:[function(require,module,exports){
var isString = require('./is-string'),
	isNumber = require('./is-number'),
	isBool = require('./is-bool');

module.exports = function isPlain(a){
	return !a || isString(a) || isNumber(a) || isBool(a);
};
},{"./is-bool":139,"./is-number":145,"./is-string":150}],148:[function(require,module,exports){
module.exports = function(n){
	return n[0] === '_' && n.length > 1;
}

},{}],149:[function(require,module,exports){
module.exports = function(target){
	return target instanceof RegExp;
}
},{}],150:[function(require,module,exports){
module.exports = function(a){
	return typeof a === 'string' || a instanceof String;
}
},{}],151:[function(require,module,exports){
var sentenceCase = require('sentence-case')

/**
 * Param case a string.
 *
 * @param  {String} string
 * @param  {String} [locale]
 * @return {String}
 */
module.exports = function (string, locale) {
  return sentenceCase(string, locale, '-')
}

},{"sentence-case":168}],152:[function(require,module,exports){
/**
 * @module parenthesis
 */

var parse = require('./parse');
var stringify = require('./stringify');
parse.parse = parse;
parse.stringify = stringify;

module.exports = parse;
},{"./parse":153,"./stringify":154}],153:[function(require,module,exports){
/**
 * @module  parenthesis/parse
 *
 * Parse a string with parenthesis.
 *
 * @param {string} str A string with parenthesis
 *
 * @return {Array} A list with parsed parens, where 0 is initial string.
 */

//TODO: implement sequential parser of this algorithm, compare performance.
module.exports = function(str, bracket){
	//pretend non-string parsed per-se
	if (typeof str !== 'string') return [str];

	var res = [], prevStr;

	bracket = bracket || '()';

	//create parenthesis regex
	var pRE = new RegExp(['\\', bracket[0], '[^\\', bracket[0], '\\', bracket[1], ']*\\', bracket[1]].join(''));

	function replaceToken(token, idx, str){
		//save token to res
		var refId = res.push(token.slice(1,-1));

		return '\\' + refId;
	}

	//replace paren tokens till there’s none
	while (str != prevStr) {
		prevStr = str;
		str = str.replace(pRE, replaceToken);
	}

	//save resulting str
	res.unshift(str);

	return res;
};
},{}],154:[function(require,module,exports){
/**
 * @module parenthesis/stringify
 *
 * Stringify an array/object with parenthesis references
 *
 * @param {Array|Object} arr An array or object where 0 is initial string
 *                           and every other key/value is reference id/value to replace
 *
 * @return {string} A string with inserted regex references
 */

//FIXME: circular references cause recursions here
//TODO: there’s possible a recursive version of this algorithm, so test it & compare
module.exports = function (str, refs, bracket){
	var prevStr;

	//pretend bad string stringified with no parentheses
	if (!str) return '';

	if (typeof str !== 'string') {
		bracket = refs;
		refs = str;
		str = refs[0];
	}

	bracket = bracket || '()';

	function replaceRef(token, idx, str){
		return bracket[0] + refs[token.slice(1)] + bracket[1];
	}

	while (str != prevStr) {
		prevStr = str;
		str = str.replace(/\\[0-9]+/, replaceRef);
	}

	return str;
};
},{}],155:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("+xKvab"))
},{"+xKvab":80}],156:[function(require,module,exports){
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
},{}],157:[function(require,module,exports){
/**
 * @module  queried
 */


var doc = require('get-doc');
var q = require('./lib/');


/**
 * Detect unsupported css4 features, polyfill them
 */

//detect `:scope`
try {
	doc.querySelector(':scope');
}
catch (e) {
	q.registerFilter('scope', require('./lib/pseudos/scope'));
}


//detect `:has`
try {
	doc.querySelector(':has');
}
catch (e) {
	q.registerFilter('has', require('./lib/pseudos/has'));

	//polyfilled :has requires artificial :not to make `:not(:has(...))`.
	q.registerFilter('not', require('./lib/pseudos/not'));
}


//detect `:root`
try {
	doc.querySelector(':root');
}
catch (e) {
	q.registerFilter('root', require('./lib/pseudos/root'));
}


//detect `:matches`
try {
	doc.querySelector(':matches');
}
catch (e) {
	q.registerFilter('matches', require('./lib/pseudos/matches'));
}


/** Helper methods */
q.matches = require('./lib/pseudos/matches');


module.exports = q;
},{"./lib/":158,"./lib/pseudos/has":159,"./lib/pseudos/matches":160,"./lib/pseudos/not":161,"./lib/pseudos/root":162,"./lib/pseudos/scope":163,"get-doc":99}],158:[function(require,module,exports){
/**
 * @module queried/lib/index
 */


var slice = require('sliced');
var unique = require('array-unique');
var getUid = require('get-uid');
var paren = require('parenthesis');
var isString = require('mutype/is-string');
var isArray = require('mutype/is-array');
var isArrayLike = require('mutype/is-array-like');
var arrayify = require('arrayify-compact');
var doc = require('get-doc');


/**
 * Query wrapper - main method to query elements.
 */
function queryMultiple(selector, el) {
	//ignore bad selector
	if (!selector) return [];

	//return elements passed as a selector unchanged (cover params case)
	if (!isString(selector)) {
		if (isArray(selector)) {
			return unique(arrayify(selector.map(function (sel) {
				return queryMultiple(sel, el);
			})));
		} else {
			return [selector];
		}
	}

	//catch polyfillable first `:scope` selector - just erase it, works just fine
	if (pseudos.scope) {
		selector = selector.replace(/^\s*:scope/, '');
	}

	//ignore non-queryable containers
	if (!el) {
		el = [querySingle.document];
	}

	//treat passed list
	else if (isArrayLike(el)) {
		el = arrayify(el);
	}

	//if element isn’t a node - make it q.document
	else if (!el.querySelector) {
		el = [querySingle.document];
	}

	//make any ok element a list
	else {
		el = [el];
	}

	return qPseudos(el, selector);
}


/** Query single element - no way better than return first of multiple selector */
function querySingle(selector, el){
	return queryMultiple(selector, el)[0];
}


/**
 * Return query result based off target list.
 * Parse and apply polyfilled pseudos
 */
function qPseudos(list, selector) {
	//ignore empty selector
	selector = selector.trim();
	if (!selector) return list;

	// console.group(selector);

	//scopify immediate children selector
	if (selector[0] === '>') {
		if (!pseudos.scope) {
			//scope as the first element in selector scopifies current element just ok
			selector = ':scope' + selector;
		}
		else {
			var id = getUid();
			list.forEach(function(el){el.setAttribute('__scoped', id);});
			selector = '[__scoped="' + id + '"]' + selector;
		}
	}

	var pseudo, pseudoFn, pseudoParam, pseudoParamId;

	//catch pseudo
	var parts = paren.parse(selector);
	var match = parts[0].match(pseudoRE);

	//if pseudo found
	if (match) {
		//grab pseudo details
		pseudo = match[1];
		pseudoParamId = match[2];

		if (pseudoParamId) {
			pseudoParam = paren.stringify(parts[pseudoParamId.slice(1)], parts);
		}

		//pre-select elements before pseudo
		var preSelector = paren.stringify(parts[0].slice(0, match.index), parts);

		//fix for query-relative
		if (!preSelector && !mappers[pseudo]) preSelector = '*';
		if (preSelector) list = qList(list, preSelector);


		//apply pseudo filter/mapper on the list
		pseudoFn = function(el) {return pseudos[pseudo](el, pseudoParam); };
		if (filters[pseudo]) {
			list = list.filter(pseudoFn);
		}
		else if (mappers[pseudo]) {
			list = unique(arrayify(list.map(pseudoFn)));
		}

		//shorten selector
		selector = parts[0].slice(match.index + match[0].length);

		// console.groupEnd();

		//query once again
		return qPseudos(list, paren.stringify(selector, parts));
	}

	//just query list
	else {
		// console.groupEnd();
		return qList(list, selector);
	}
}


/** Apply selector on a list of elements, no polyfilled pseudos */
function qList(list, selector){
	return unique(arrayify(list.map(function(el){
		return slice(el.querySelectorAll(selector));
	})));
}


/** Registered pseudos */
var pseudos = {};
var filters = {};
var mappers = {};


/** Regexp to grab pseudos with params */
var pseudoRE;


/**
 * Append a new filtering (classic) pseudo
 *
 * @param {string} name Pseudo name
 * @param {Function} filter A filtering function
 */
function registerFilter(name, filter, incSelf){
	if (pseudos[name]) return;

	//save pseudo filter
	pseudos[name] = filter;
	pseudos[name].includeSelf = incSelf;
	filters[name] = true;

	regenerateRegExp();
}


/**
 * Append a new mapping (relative-like) pseudo
 *
 * @param {string} name pseudo name
 * @param {Function} mapper map function
 */
function registerMapper(name, mapper, incSelf){
	if (pseudos[name]) return;

	pseudos[name] = mapper;
	pseudos[name].includeSelf = incSelf;
	mappers[name] = true;

	regenerateRegExp();
}


/** Update regexp catching pseudos */
function regenerateRegExp(){
	pseudoRE = new RegExp('::?(' + Object.keys(pseudos).join('|') + ')(\\\\[0-9]+)?');
}



/** Exports */
querySingle.all = queryMultiple;
querySingle.registerFilter = registerFilter;
querySingle.registerMapper = registerMapper;

/** Default document representative to use for DOM */
querySingle.document = doc;


module.exports = querySingle;
},{"array-unique":73,"arrayify-compact":74,"get-doc":99,"get-uid":100,"mutype/is-array":138,"mutype/is-array-like":137,"mutype/is-string":150,"parenthesis":152,"sliced":164}],159:[function(require,module,exports){
var q = require('..');

function has(el, subSelector){
	return !!q(subSelector, el);
}

module.exports = has;
},{"..":158}],160:[function(require,module,exports){
/** :matches pseudo */

var q = require('..');

function matches(el, selector){
	if (!el.parentNode) {
		var fragment = q.document.createDocumentFragment();
		fragment.appendChild(el);
	}

	return q.all(selector, el.parentNode).indexOf(el) > -1;
}

module.exports = matches;
},{"..":158}],161:[function(require,module,exports){
var matches = require('./matches');

function not(el, selector){
	return !matches(el, selector);
}

module.exports = not;
},{"./matches":160}],162:[function(require,module,exports){
var q = require('..');

module.exports = function root(el){
	return el === q.document.documentElement;
};
},{"..":158}],163:[function(require,module,exports){
/**
 * :scope pseudo
 * Return element if it has `scoped` attribute.
 *
 * @link http://dev.w3.org/csswg/selectors-4/#the-scope-pseudo
 */

module.exports = function scope(el){
	return el.hasAttribute('scoped');
};
},{}],164:[function(require,module,exports){
module.exports = exports = require('./lib/sliced');

},{"./lib/sliced":165}],165:[function(require,module,exports){

/**
 * An Array.prototype.slice.call(arguments) alternative
 *
 * @param {Object} args something with a length
 * @param {Number} slice
 * @param {Number} sliceEnd
 * @api public
 */

module.exports = function (args, slice, sliceEnd) {
  var ret = [];
  var len = args.length;

  if (0 === len) return ret;

  var start = slice < 0
    ? Math.max(0, slice + len)
    : slice || 0;

  if (sliceEnd !== undefined) {
    len = sliceEnd < 0
      ? sliceEnd + len
      : sliceEnd
  }

  while (len-- > start) {
    ret[len - start] = args[len];
  }

  return ret;
}


},{}],166:[function(require,module,exports){
/**
 * @module  resizable
 */


var Draggable = require('draggy');
var emit = require('emmy/emit');
var on = require('emmy/on');
var isArray = require('mutype/is-array');
var isString = require('mutype/is-string');
var isObject = require('mutype/is-object');
var extend = require('xtend/mutable');
var inherit = require('inherits');
var Emitter = require('events');
var between = require('mumath/clamp');
var splitKeys = require('split-keys');
var css = require('mucss/css');
var paddings = require('mucss/padding');
var borders = require('mucss/border');
var margins = require('mucss/margin');
var offsets = require('mucss/offset');


var doc = document, win = window, root = doc.documentElement;


/**
 * Make an element resizable.
 *
 * Note that we don’t need a container option
 * as arbitrary container is emulatable via fake resizable.
 *
 * @constructor
 */
function Resizable (el, options) {
	var self = this;

	if (!(self instanceof Resizable)) {
		return new Resizable(el, options);
	}

	self.element = el;

	extend(self, options);

	//if element isn’t draggable yet - force it to be draggable, without movements
	if (self.draggable === true) {
		self.draggable = new Draggable(self.element, {
			within: self.within,
			css3: true
		});
	} else if (self.draggable) {
		self.draggable = new Draggable(self.element, self.draggable);
		self.draggable.css3 = true;
	} else {
		self.draggable = new Draggable(self.element, {
			handle: null
		});
	}

	self.createHandles();

	//bind event, if any
	if (self.resize) {
		self.on('resize', self.resize);
	}
}

inherit(Resizable, Emitter);


var proto = Resizable.prototype;


/** Create handles according to options */
proto.createHandles = function () {
	var self = this;

	//init handles
	var handles;

	//parse value
	if (isArray(self.handles)) {
		handles = {};
		for (var i = self.handles.length; i--;){
			handles[self.handles[i]] = null;
		}
	}
	else if (isString(self.handles)) {
		handles = {};
		var arr = self.handles.match(/([swne]+)/g);
		for (var i = arr.length; i--;){
			handles[arr[i]] = null;
		}
	}
	else if (isObject(self.handles)) {
		handles = self.handles;
	}
	//default set of handles depends on position.
	else {
		var position = getComputedStyle(self.element).position;
		var display = getComputedStyle(self.element).display;
		//if display is inline-like - provide only three handles
		//it is position: static or display: inline
		if (/inline/.test(display) || /static/.test(position)){
			handles = {
				s: null,
				se: null,
				e: null
			};

			//ensure position is not static
			css(self.element, 'position', 'relative');
		}
		//else - all handles
		else {
			handles = {
				s: null,
				se: null,
				e: null,
				ne: null,
				n: null,
				nw: null,
				w: null,
				sw: null
			};
		}
	}

	//create proper number of handles
	var handle;
	for (var direction in handles) {
		handles[direction] = self.createHandle(handles[direction], direction);
	}

	//save handles elements
	self.handles = handles;
}


/** Create handle for the direction */
proto.createHandle = function(handle, direction){
	var self = this;

	var el = self.element;

	//make handle element
	if (!handle) {
		handle = document.createElement('div');
		handle.classList.add('resizable-handle');
	}

	//insert handle to the element
	self.element.appendChild(handle);

	//save direction
	handle.direction = direction;

	//detect self.within
	//FIXME: may be painful if resizable is created on detached element
	var within = self.within === 'parent' ? self.element.parentNode : self.within;

	//make handle draggable
	var draggy = new Draggable(handle, {
		within: within,
		//can’t use abs pos, as we engage it in styling
		// css3: false,
		threshold: self.threshold,
		axis: /^[ns]$/.test(direction) ? 'y' : /^[we]$/.test(direction) ? 'x' : 'both'
	});

	draggy.on('dragstart', function (e) {
		self.m = margins(el);
		self.b = borders(el);
		self.p = paddings(el);

		//update draggalbe params
		self.draggable.update(e);

		//save initial dragging offsets
		var s = getComputedStyle(el);
		self.offsets = self.draggable.getCoords();

		//recalc border-box
		if (getComputedStyle(el).boxSizing === 'border-box') {
			self.p.top = 0;
			self.p.bottom = 0;
			self.p.left = 0;
			self.p.right = 0;
			self.b.top = 0;
			self.b.bottom = 0;
			self.b.left = 0;
			self.b.right = 0;
		}

		//save initial size
		self.initSize = [el.offsetWidth - self.b.left - self.b.right - self.p.left - self.p.right, el.offsetHeight - self.b.top - self.b.bottom - self.p.top - self.p.bottom];

		//save initial full size
		self.initSizeFull = [
			el.offsetWidth,
			el.offsetHeight
		];

		//movement prev coords
		self.prevCoords = [0, 0];

		//shift-caused offset
		self.shiftOffset = [0, 0];

		//central initial coords
		self.center = [self.offsets[0] + self.initSize[0]/2, self.offsets[1] + self.initSize[1]/2];

		//calc limits (max height/width from left/right)
		if (self.within) {
			var po = offsets(within);
			var o = offsets(el);
			self.maxSize = [
				o.left - po.left + self.initSize[0],
				o.top - po.top + self.initSize[1],
				po.right - o.right + self.initSize[0],
				po.bottom - o.bottom + self.initSize[1]
			];
		} else {
			self.maxSize = [9999, 9999, 9999, 9999];
		}

		//preset mouse cursor
		css(root, {
			'cursor': direction + '-resize'
		});

		//clear cursors
		for (var h in self.handles){
			css(self.handles[h], 'cursor', null);
		}
	});

	draggy.on('drag', function () {
		var coords = draggy.getCoords();

		var prevSize = [
			el.offsetWidth,
			el.offsetHeight
		];

		//change width/height properly
		if (draggy.shiftKey) {
			switch (direction) {
				case 'se':
				case 's':
				case 'e':
					break;
				case 'nw':
					coords[0] = -coords[0];
					coords[1] = -coords[1];
					break;
				case 'n':
					coords[1] = -coords[1];
					break;
				case 'w':
					coords[0] = -coords[0];
					break;
				case 'ne':
					coords[1] = -coords[1];
					break;
				case 'sw':
					coords[0] = -coords[0];
					break;
			};

			//set placement is relative to initial center line
			css(el, {
				width: Math.min(
					self.initSize[0] + coords[0]*2,
					self.maxSize[2] + coords[0],
					self.maxSize[0] + coords[0]
				),
				height: Math.min(
					self.initSize[1] + coords[1]*2,
					self.maxSize[3] + coords[1],
					self.maxSize[1] + coords[1]
				)
			});

			var difX = prevSize[0] - el.offsetWidth;
			var difY = prevSize[1] - el.offsetHeight;

			//update draggable limits
			self.draggable.updateLimits();

			if (difX) {
				self.draggable.move(self.center[0] - self.initSize[0]/2 - coords[0]);
			}

			if (difY) {
				self.draggable.move(null, self.center[1] - self.initSize[1]/2 - coords[1]);
			}
		}
		else {
			switch (direction) {
				case 'se':
					css(el, {
						width: Math.min(
							self.initSize[0] + coords[0],
							self.maxSize[2]
						),
						height: Math.min(
							self.initSize[1] + coords[1],
							self.maxSize[3]
						)
					});

				case 's':
					css(el, {
						height: Math.min(
							self.initSize[1] + coords[1],
							self.maxSize[3]
						)
					});

				case 'e':
					css(el, {
						width: Math.min(
							self.initSize[0] + coords[0],
							self.maxSize[2]
						)
					});
				case 'se':
				case 's':
				case 'e':
					self.draggable.updateLimits();

					self.draggable.move(
						self.center[0] - self.initSize[0]/2,
						self.center[1] - self.initSize[1]/2
					);

					break;

				case 'nw':
					css(el, {
						width: between(self.initSize[0] - coords[0], 0, self.maxSize[0]),
						height: between(self.initSize[1] - coords[1], 0, self.maxSize[1])
					});
				case 'n':
					css(el, {
						height: between(self.initSize[1] - coords[1], 0, self.maxSize[1])
					});
				case 'w':
					css(el, {
						width: between(self.initSize[0] - coords[0], 0, self.maxSize[0])
					});
				case 'nw':
				case 'n':
				case 'w':
					self.draggable.updateLimits();

					//subtract t/l on changed size
					var deltaX = self.initSizeFull[0] - el.offsetWidth;
					var deltaY = self.initSizeFull[1] - el.offsetHeight;

					self.draggable.move(self.offsets[0] + deltaX, self.offsets[1] + deltaY);
					break;

				case 'ne':
					css(el, {
						width: between(self.initSize[0] + coords[0], 0, self.maxSize[2]),
						height: between(self.initSize[1] - coords[1], 0, self.maxSize[1])
					});

					self.draggable.updateLimits();

					//subtract t/l on changed size
					var deltaY = self.initSizeFull[1] - el.offsetHeight;

					self.draggable.move(null, self.offsets[1] + deltaY);
					break;
				case 'sw':
					css(el, {
						width: between(self.initSize[0] - coords[0], 0, self.maxSize[0]),
						height: between(self.initSize[1] + coords[1], 0, self.maxSize[3])
					});

					self.draggable.updateLimits();

					//subtract t/l on changed size
					var deltaX = self.initSizeFull[0] - el.offsetWidth;

					self.draggable.move(self.offsets[0] + deltaX);
					break;
			};
		}

		//trigger callbacks
		emit(self, 'resize');
		emit(el, 'resize');

		draggy.setCoords(0,0);
	});

	draggy.on('dragend', function(){
		//clear cursor & pointer-events
		css(root, {
			'cursor': null
		});

		//get back cursors
		for (var h in self.handles){
			css(self.handles[h], 'cursor', self.handles[h].direction + '-resize');
		}
	});

	//append styles
	css(handle, handleStyles[direction]);
	css(handle, 'cursor', direction + '-resize');

	//append proper class
	handle.classList.add('resizable-handle-' + direction);

	return handle;
};


/** deconstructor - removes any memory bindings */
proto.destroy = function () {
	//remove all handles
	for (var hName in this.handles){
		this.element.removeChild(this.handles[hName]);
		Draggable.cache.get(this.handles[hName]).destroy();
	}


	//remove references
	this.element = null;
};


var w = 10;


/** Threshold size */
proto.threshold = w;


/** Styles for handles */
var handleStyles = splitKeys({
	'e,w,n,s,nw,ne,sw,se': {
		'position': 'absolute'
	},
	'e,w': {
		'top, bottom':0,
		'width': w
	},
	'e': {
		'left': 'auto',
		'right': -w/2
	},
	'w': {
		'right': 'auto',
		'left': -w/2
	},
	's': {
		'top': 'auto',
		'bottom': -w/2
	},
	'n': {
		'bottom': 'auto',
		'top': -w/2
	},
	'n,s': {
		'left, right': 0,
		'height': w
	},
	'nw,ne,sw,se': {
		'width': w,
		'height': w,
		'z-index': 1
	},
	'nw': {
		'top, left': -w/2,
		'bottom, right': 'auto'
	},
	'ne': {
		'top, right': -w/2,
		'bottom, left': 'auto'
	},
	'sw': {
		'bottom, left': -w/2,
		'top, right': 'auto'
	},
	'se': {
		'bottom, right': -w/2,
		'top, left': 'auto'
	}
}, true);



/**
 * @module resizable
 */
module.exports = Resizable;
},{"draggy":90,"emmy/emit":91,"emmy/on":94,"events":97,"inherits":106,"mucss/border":116,"mucss/css":117,"mucss/margin":121,"mucss/offset":122,"mucss/padding":123,"mumath/clamp":130,"mutype/is-array":138,"mutype/is-object":146,"mutype/is-string":150,"split-keys":185,"xtend/mutable":222}],167:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],168:[function(require,module,exports){
var lowerCase = require('lower-case')

var NON_WORD_REGEXP = require('./vendor/non-word-regexp')
var CAMEL_CASE_REGEXP = require('./vendor/camel-case-regexp')
var TRAILING_DIGIT_REGEXP = require('./vendor/trailing-digit-regexp')

/**
 * Sentence case a string.
 *
 * @param  {String} str
 * @param  {String} locale
 * @param  {String} replacement
 * @return {String}
 */
module.exports = function (str, locale, replacement) {
  if (str == null) {
    return ''
  }

  replacement = replacement || ' '

  function replace (match, index, string) {
    if (index === 0 || index === (string.length - match.length)) {
      return ''
    }

    return replacement
  }

  str = String(str)
    // Support camel case ("camelCase" -> "camel Case").
    .replace(CAMEL_CASE_REGEXP, '$1 $2')
    // Support digit groups ("test2012" -> "test 2012").
    .replace(TRAILING_DIGIT_REGEXP, '$1 $2')
    // Remove all non-word characters and replace with a single space.
    .replace(NON_WORD_REGEXP, replace)

  // Lower case the entire string.
  return lowerCase(str, locale)
}

},{"./vendor/camel-case-regexp":169,"./vendor/non-word-regexp":170,"./vendor/trailing-digit-regexp":171,"lower-case":115}],169:[function(require,module,exports){
module.exports = /([\u0061-\u007A\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0561-\u0587\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7FA\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A])([\u0041-\u005A\u00C0-\u00D6\u00D8-\u00DE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA\uFF21-\uFF3A\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g

},{}],170:[function(require,module,exports){
module.exports = /[^\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]+/g

},{}],171:[function(require,module,exports){
module.exports = /([\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])([^\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g

},{}],172:[function(require,module,exports){
module.exports=require(165)
},{}],173:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

// Note: source-map-resolve.js is generated from source-map-resolve-node.js and
// source-map-resolve-template.js. Only edit the two latter files, _not_
// source-map-resolve.js!

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["source-map-url", "resolve-url"], factory)
  } else if (typeof exports === "object") {
    var sourceMappingURL = require("source-map-url")
    var resolveUrl = require("resolve-url")
    module.exports = factory(sourceMappingURL, resolveUrl)
  } else {
    root.sourceMapResolve = factory(root.sourceMappingURL, root.resolveUrl)
  }
}(this, function(sourceMappingURL, resolveUrl) {

  function callbackAsync(callback, error, result) {
    setImmediate(function() { callback(error, result) })
  }

  function parseMapToJSON(string) {
    return JSON.parse(string.replace(/^\)\]\}'/, ""))
  }



  function resolveSourceMap(code, codeUrl, read, callback) {
    var mapData
    try {
      mapData = resolveSourceMapHelper(code, codeUrl)
    } catch (error) {
      return callbackAsync(callback, error)
    }
    if (!mapData || mapData.map) {
      return callbackAsync(callback, null, mapData)
    }
    read(mapData.url, function(error, result) {
      if (error) {
        return callback(error)
      }
      try {
        mapData.map = parseMapToJSON(String(result))
      } catch (error) {
        return callback(error)
      }
      callback(null, mapData)
    })
  }

  function resolveSourceMapSync(code, codeUrl, read) {
    var mapData = resolveSourceMapHelper(code, codeUrl)
    if (!mapData || mapData.map) {
      return mapData
    }
    mapData.map = parseMapToJSON(String(read(mapData.url)))
    return mapData
  }

  var dataUriRegex = /^data:([^,;]*)(;[^,;]*)*(?:,(.*))?$/
  var jsonMimeTypeRegex = /^(?:application|text)\/json$/

  function resolveSourceMapHelper(code, codeUrl) {
    var url = sourceMappingURL.getFrom(code)
    if (!url) {
      return null
    }

    var dataUri = url.match(dataUriRegex)
    if (dataUri) {
      var mimeType = dataUri[1]
      var lastParameter = dataUri[2]
      var encoded = dataUri[3]
      if (!jsonMimeTypeRegex.test(mimeType)) {
        throw new Error("Unuseful data uri mime type: " + (mimeType || "text/plain"))
      }
      return {
        sourceMappingURL: url,
        url: null,
        sourcesRelativeTo: codeUrl,
        map: parseMapToJSON(lastParameter === ";base64" ? atob(encoded) : decodeURIComponent(encoded))
      }
    }

    var mapUrl = resolveUrl(codeUrl, url)
    return {
      sourceMappingURL: url,
      url: mapUrl,
      sourcesRelativeTo: mapUrl,
      map: null
    }
  }



  function resolveSources(map, mapUrl, read, options, callback) {
    if (typeof options === "function") {
      callback = options
      options = {}
    }
    var pending = map.sources.length
    var errored = false
    var result = {
      sourcesResolved: [],
      sourcesContent:  []
    }

    var done = function(error) {
      if (errored) {
        return
      }
      if (error) {
        errored = true
        return callback(error)
      }
      pending--
      if (pending === 0) {
        callback(null, result)
      }
    }

    resolveSourcesHelper(map, mapUrl, options, function(fullUrl, sourceContent, index) {
      result.sourcesResolved[index] = fullUrl
      if (typeof sourceContent === "string") {
        result.sourcesContent[index] = sourceContent
        callbackAsync(done, null)
      } else {
        read(fullUrl, function(error, source) {
          result.sourcesContent[index] = String(source)
          done(error)
        })
      }
    })
  }

  function resolveSourcesSync(map, mapUrl, read, options) {
    var result = {
      sourcesResolved: [],
      sourcesContent:  []
    }
    resolveSourcesHelper(map, mapUrl, options, function(fullUrl, sourceContent, index) {
      result.sourcesResolved[index] = fullUrl
      if (read !== null) {
        if (typeof sourceContent === "string") {
          result.sourcesContent[index] = sourceContent
        } else {
          result.sourcesContent[index] = String(read(fullUrl))
        }
      }
    })
    return result
  }

  var endingSlash = /\/?$/

  function resolveSourcesHelper(map, mapUrl, options, fn) {
    options = options || {}
    var fullUrl
    var sourceContent
    for (var index = 0, len = map.sources.length; index < len; index++) {
      if (map.sourceRoot && !options.ignoreSourceRoot) {
        // Make sure that the sourceRoot ends with a slash, so that `/scripts/subdir` becomes
        // `/scripts/subdir/<source>`, not `/scripts/<source>`. Pointing to a file as source root
        // does not make sense.
        fullUrl = resolveUrl(mapUrl, map.sourceRoot.replace(endingSlash, "/"), map.sources[index])
      } else {
        fullUrl = resolveUrl(mapUrl, map.sources[index])
      }
      sourceContent = (map.sourcesContent || [])[index]
      fn(fullUrl, sourceContent, index)
    }
  }



  function resolve(code, codeUrl, read, options, callback) {
    if (typeof options === "function") {
      callback = options
      options = {}
    }
    resolveSourceMap(code, codeUrl, read, function(error, mapData) {
      if (error) {
        return callback(error)
      }
      if (!mapData) {
        return callback(null, null)
      }
      resolveSources(mapData.map, mapData.sourcesRelativeTo, read, options, function(error, result) {
        if (error) {
          return callback(error)
        }
        mapData.sourcesResolved = result.sourcesResolved
        mapData.sourcesContent  = result.sourcesContent
        callback(null, mapData)
      })
    })
  }

  function resolveSync(code, codeUrl, read, options) {
    var mapData = resolveSourceMapSync(code, codeUrl, read)
    if (!mapData) {
      return null
    }
    var result = resolveSourcesSync(mapData.map, mapData.sourcesRelativeTo, read, options)
    mapData.sourcesResolved = result.sourcesResolved
    mapData.sourcesContent  = result.sourcesContent
    return mapData
  }



  return {
    resolveSourceMap:     resolveSourceMap,
    resolveSourceMapSync: resolveSourceMapSync,
    resolveSources:       resolveSources,
    resolveSourcesSync:   resolveSourcesSync,
    resolve:              resolve,
    resolveSync:          resolveSync
  }

}));

},{"resolve-url":167,"source-map-url":174}],174:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.sourceMappingURL = factory()
  }
}(this, function() {

  var innerRegex = /[#@] sourceMappingURL=([^\s'"]*)/

  var regex = RegExp(
    "(?:" +
      "/\\*" +
      "(?:\\s*\r?\n(?://)?)?" +
      "(?:" + innerRegex.source + ")" +
      "\\s*" +
      "\\*/" +
      "|" +
      "//(?:" + innerRegex.source + ")" +
    ")" +
    "\\s*$"
  )

  return {

    regex: regex,
    _innerRegex: innerRegex,

    getFrom: function(code) {
      var match = code.match(regex)
      return (match ? match[1] || match[2] || "" : null)
    },

    existsIn: function(code) {
      return regex.test(code)
    },

    removeFrom: function(code) {
      return code.replace(regex, "")
    },

    insertBefore: function(code, string) {
      var match = code.match(regex)
      if (match) {
        return code.slice(0, match.index) + string + code.slice(match.index)
      } else {
        return code + string
      }
    }
  }

}));

},{}],175:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./source-map/source-node').SourceNode;

},{"./source-map/source-map-consumer":181,"./source-map/source-map-generator":182,"./source-map/source-node":183}],176:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet();
    for (var i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var isDuplicate = this.has(aStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set[util.toSetString(aStr)] = idx;
    }
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                util.toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[util.toSetString(aStr)];
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error('No element indexed by ' + aIdx);
  };

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };

  exports.ArraySet = ArraySet;

});

},{"./util":184,"amdefine":71}],177:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64 = require('./base64');

  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
  // length quantities we use in the source map spec, the first bit is the sign,
  // the next four bits are the actual value, and the 6th bit is the
  // continuation bit. The continuation bit tells us whether there are more
  // digits in this value following this digit.
  //
  //   Continuation
  //   |    Sign
  //   |    |
  //   V    V
  //   101011

  var VLQ_BASE_SHIFT = 5;

  // binary: 100000
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

  // binary: 011111
  var VLQ_BASE_MASK = VLQ_BASE - 1;

  // binary: 100000
  var VLQ_CONTINUATION_BIT = VLQ_BASE;

  /**
   * Converts from a two-complement value to a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */
  function toVLQSigned(aValue) {
    return aValue < 0
      ? ((-aValue) << 1) + 1
      : (aValue << 1) + 0;
  }

  /**
   * Converts to a two-complement value from a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative
      ? -shifted
      : shifted;
  }

  /**
   * Returns the base 64 VLQ encoded value.
   */
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;

    var vlq = toVLQSigned(aValue);

    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        // There are still more digits in this value, so we must make sure the
        // continuation bit is marked.
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);

    return encoded;
  };

  /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string via the out parameter.
   */
  exports.decode = function base64VLQ_decode(aStr, aOutParam) {
    var i = 0;
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (i >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charAt(i++));
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    aOutParam.value = fromVLQSigned(result);
    aOutParam.rest = aStr.slice(i);
  };

});

},{"./base64":178,"amdefine":71}],178:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var charToIntMap = {};
  var intToCharMap = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    .split('')
    .forEach(function (ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function base64_encode(aNumber) {
    if (aNumber in intToCharMap) {
      return intToCharMap[aNumber];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 digit to an integer.
   */
  exports.decode = function base64_decode(aChar) {
    if (aChar in charToIntMap) {
      return charToIntMap[aChar];
    }
    throw new TypeError("Not a valid base 64 digit: " + aChar);
  };

});

},{"amdefine":71}],179:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the index of
    //      the next closest element that is less than that element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element which is less than the one we are searching for, so we
    //      return -1.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      // Found the element we are looking for.
      return mid;
    }
    else if (cmp > 0) {
      // aHaystack[mid] is greater than our needle.
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
      }
      // We did not find an exact match, return the next closest one
      // (termination case 2).
      return mid;
    }
    else {
      // aHaystack[mid] is less than our needle.
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
      }
      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (2) or (3) and return the appropriate thing.
      return aLow < 0 ? -1 : aLow;
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the index of next lowest value checked if there is no exact hit. This is
   * because mappings between original and generated line/col pairs are single
   * points, and there is an implicit region between each of them, so a miss
   * just means that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare) {
    if (aHaystack.length === 0) {
      return -1;
    }
    return recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
  };

});

},{"amdefine":71}],180:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * Determine whether mappingB is after mappingA with respect to generated
   * position.
   */
  function generatedPositionAfter(mappingA, mappingB) {
    // Optimized for most common case
    var lineA = mappingA.generatedLine;
    var lineB = mappingB.generatedLine;
    var columnA = mappingA.generatedColumn;
    var columnB = mappingB.generatedColumn;
    return lineB > lineA || lineB == lineA && columnB >= columnA ||
           util.compareByGeneratedPositions(mappingA, mappingB) <= 0;
  }

  /**
   * A data structure to provide a sorted view of accumulated mappings in a
   * performance conscious manner. It trades a neglibable overhead in general
   * case for a large speedup in case of mappings being added in order.
   */
  function MappingList() {
    this._array = [];
    this._sorted = true;
    // Serves as infimum
    this._last = {generatedLine: -1, generatedColumn: 0};
  }

  /**
   * Iterate through internal items. This method takes the same arguments that
   * `Array.prototype.forEach` takes.
   *
   * NOTE: The order of the mappings is NOT guaranteed.
   */
  MappingList.prototype.unsortedForEach =
    function MappingList_forEach(aCallback, aThisArg) {
      this._array.forEach(aCallback, aThisArg);
    };

  /**
   * Add the given source mapping.
   *
   * @param Object aMapping
   */
  MappingList.prototype.add = function MappingList_add(aMapping) {
    var mapping;
    if (generatedPositionAfter(this._last, aMapping)) {
      this._last = aMapping;
      this._array.push(aMapping);
    } else {
      this._sorted = false;
      this._array.push(aMapping);
    }
  };

  /**
   * Returns the flat, sorted array of mappings. The mappings are sorted by
   * generated position.
   *
   * WARNING: This method returns internal data without copying, for
   * performance. The return value must NOT be mutated, and should be treated as
   * an immutable borrow. If you want to take ownership, you must make your own
   * copy.
   */
  MappingList.prototype.toArray = function MappingList_toArray() {
    if (!this._sorted) {
      this._array.sort(util.compareByGeneratedPositions);
      this._sorted = true;
    }
    return this._array;
  };

  exports.MappingList = MappingList;

});

},{"./util":184,"amdefine":71}],181:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - sourcesContent: Optional. An array of contents of the original source files.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: Optional. The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
    // requires the array) to play nice here.
    var names = util.getArg(sourceMap, 'names', []);
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file', null);

    // Once again, Sass deviates from the spec and supplies the version as a
    // string rather than a number, so we use loose equality checking here.
    if (version != this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    sources = sources.map(util.normalize);

    // Pass `true` below to allow duplicate names and sources. While source maps
    // are intended to be compressed and deduplicated, the TypeScript compiler
    // sometimes generates source maps with duplicates in them. See Github issue
    // #72 and bugzil.la/889492.
    this._names = ArraySet.fromArray(names, true);
    this._sources = ArraySet.fromArray(sources, true);

    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this.file = file;
  }

  /**
   * Create a SourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns SourceMapConsumer
   */
  SourceMapConsumer.fromSourceMap =
    function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);

      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                              smc.sourceRoot);
      smc.file = aSourceMap._file;

      smc.__generatedMappings = aSourceMap._mappings.toArray().slice();
      smc.__originalMappings = aSourceMap._mappings.toArray().slice()
        .sort(util.compareByOriginalPositions);

      return smc;
    };

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
      }, this);
    }
  });

  // `__generatedMappings` and `__originalMappings` are arrays that hold the
  // parsed mapping coordinates from the source map's "mappings" attribute. They
  // are lazily instantiated, accessed via the `_generatedMappings` and
  // `_originalMappings` getters respectively, and we only parse the mappings
  // and create these arrays once queried for a source location. We jump through
  // these hoops because there can be many thousands of mappings, and parsing
  // them is expensive, so we only want to do it if we must.
  //
  // Each object in the arrays is of the form:
  //
  //     {
  //       generatedLine: The line number in the generated code,
  //       generatedColumn: The column number in the generated code,
  //       source: The path to the original source file that generated this
  //               chunk of code,
  //       originalLine: The line number in the original source that
  //                     corresponds to this chunk of generated code,
  //       originalColumn: The column number in the original source that
  //                       corresponds to this chunk of generated code,
  //       name: The name of the original symbol which generated this chunk of
  //             code.
  //     }
  //
  // All properties except for `generatedLine` and `generatedColumn` can be
  // `null`.
  //
  // `_generatedMappings` is ordered by the generated positions.
  //
  // `_originalMappings` is ordered by the original positions.

  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
    get: function () {
      if (!this.__generatedMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__generatedMappings;
    }
  });

  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
    get: function () {
      if (!this.__originalMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__originalMappings;
    }
  });

  SourceMapConsumer.prototype._nextCharIsMappingSeparator =
    function SourceMapConsumer_nextCharIsMappingSeparator(aStr) {
      var c = aStr.charAt(0);
      return c === ";" || c === ",";
    };

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var str = aStr;
      var temp = {};
      var mapping;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          base64VLQ.decode(str, temp);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
            // Original source.
            base64VLQ.decode(str, temp);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            base64VLQ.decode(str, temp);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            base64VLQ.decode(str, temp);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
              // Original name.
              base64VLQ.decode(str, temp);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this.__generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this.__originalMappings.push(mapping);
          }
        }
      }

      this.__generatedMappings.sort(util.compareByGeneratedPositions);
      this.__originalMappings.sort(util.compareByOriginalPositions);
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  SourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator) {
      // To return the position we are searching for, we must first find the
      // mapping for the given position and then return the opposite position it
      // points to. Because the mappings are sorted, we can use binary search to
      // find the best mapping.

      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got '
                            + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '
                            + aNeedle[aColumnName]);
      }

      return binarySearch.search(aNeedle, aMappings, aComparator);
    };

  /**
   * Compute the last column for each generated mapping. The last column is
   * inclusive.
   */
  SourceMapConsumer.prototype.computeColumnSpans =
    function SourceMapConsumer_computeColumnSpans() {
      for (var index = 0; index < this._generatedMappings.length; ++index) {
        var mapping = this._generatedMappings[index];

        // Mappings do not contain a field for the last generated columnt. We
        // can come up with an optimistic estimate, however, by assuming that
        // mappings are contiguous (i.e. given two consecutive mappings, the
        // first mapping ends where the second one starts).
        if (index + 1 < this._generatedMappings.length) {
          var nextMapping = this._generatedMappings[index + 1];

          if (mapping.generatedLine === nextMapping.generatedLine) {
            mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
            continue;
          }
        }

        // The last mapping for each line spans the entire line.
        mapping.lastGeneratedColumn = Infinity;
      }
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var index = this._findMapping(needle,
                                    this._generatedMappings,
                                    "generatedLine",
                                    "generatedColumn",
                                    util.compareByGeneratedPositions);

      if (index >= 0) {
        var mapping = this._generatedMappings[index];

        if (mapping.generatedLine === needle.generatedLine) {
          var source = util.getArg(mapping, 'source', null);
          if (source != null && this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
          return {
            source: source,
            line: util.getArg(mapping, 'originalLine', null),
            column: util.getArg(mapping, 'originalColumn', null),
            name: util.getArg(mapping, 'name', null)
          };
        }
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */
  SourceMapConsumer.prototype.sourceContentFor =
    function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }

      if (this.sourceRoot != null) {
        aSource = util.relative(this.sourceRoot, aSource);
      }

      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }

      var url;
      if (this.sourceRoot != null
          && (url = util.urlParse(this.sourceRoot))) {
        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
        // many users. We can help them out when they expect file:// URIs to
        // behave like it would if they were running a local HTTP server. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file"
            && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
        }

        if ((!url.path || url.path == "/")
            && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }

      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);

      if (index >= 0) {
        var mapping = this._originalMappings[index];

        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }

      return {
        line: null,
        column: null,
        lastColumn: null
      };
    };

  /**
   * Returns all generated line and column information for the original source
   * and line provided. The only argument is an object with the following
   * properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *
   * and an array of objects is returned, each with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.allGeneratedPositionsFor =
    function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
      // When there is no exact match, SourceMapConsumer.prototype._findMapping
      // returns the index of the closest mapping less than the needle. By
      // setting needle.originalColumn to Infinity, we thus find the last
      // mapping for the given line, provided such a mapping exists.
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: Infinity
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var mappings = [];

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);
      if (index >= 0) {
        var mapping = this._originalMappings[index];

        while (mapping && mapping.originalLine === needle.originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[--index];
        }
      }

      return mappings.reverse();
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  SourceMapConsumer.prototype.eachMapping =
    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

      var mappings;
      switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
      }

      var sourceRoot = this.sourceRoot;
      mappings.map(function (mapping) {
        var source = mapping.source;
        if (source != null && sourceRoot != null) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };

  exports.SourceMapConsumer = SourceMapConsumer;

});

},{"./array-set":176,"./base64-vlq":177,"./binary-search":179,"./util":184,"amdefine":71}],182:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64VLQ = require('./base64-vlq');
  var util = require('./util');
  var ArraySet = require('./array-set').ArraySet;
  var MappingList = require('./mapping-list').MappingList;

  /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. You may pass an object with the following
   * properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: A root for all relative URLs in this source map.
   */
  function SourceMapGenerator(aArgs) {
    if (!aArgs) {
      aArgs = {};
    }
    this._file = util.getArg(aArgs, 'file', null);
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
    this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = new MappingList();
    this._sourcesContents = null;
  }

  SourceMapGenerator.prototype._version = 3;

  /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */
  SourceMapGenerator.fromSourceMap =
    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function (mapping) {
        var newMapping = {
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }
        };

        if (mapping.source != null) {
          newMapping.source = mapping.source;
          if (sourceRoot != null) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }

          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };

          if (mapping.name != null) {
            newMapping.name = mapping.name;
          }
        }

        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  SourceMapGenerator.prototype.addMapping =
    function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);

      if (!this._skipValidation) {
        this._validateMapping(generated, original, source, name);
      }

      if (source != null && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name != null && !this._names.has(name)) {
        this._names.add(name);
      }

      this._mappings.add({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };

  /**
   * Set the source content for a source file.
   */
  SourceMapGenerator.prototype.setSourceContent =
    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot != null) {
        source = util.relative(this._sourceRoot, source);
      }

      if (aSourceContent != null) {
        // Add the source content to the _sourcesContents map.
        // Create a new _sourcesContents map if the property is null.
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else if (this._sourcesContents) {
        // Remove the source file from the _sourcesContents map.
        // If the _sourcesContents map is empty, set the property to null.
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };

  /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   * @param aSourceMapPath Optional. The dirname of the path to the source map
   *        to be applied. If relative, it is relative to the SourceMapConsumer.
   *        This parameter is needed when the two source maps aren't in the same
   *        directory, and the source map to be applied contains relative source
   *        paths. If so, those relative source paths need to be rewritten
   *        relative to the SourceMapGenerator.
   */
  SourceMapGenerator.prototype.applySourceMap =
    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
      var sourceFile = aSourceFile;
      // If aSourceFile is omitted, we will use the file property of the SourceMap
      if (aSourceFile == null) {
        if (aSourceMapConsumer.file == null) {
          throw new Error(
            'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
            'or the source map\'s "file" property. Both were omitted.'
          );
        }
        sourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      // Make "sourceFile" relative if an absolute Url is passed.
      if (sourceRoot != null) {
        sourceFile = util.relative(sourceRoot, sourceFile);
      }
      // Applying the SourceMap can add and remove items from the sources and
      // the names array.
      var newSources = new ArraySet();
      var newNames = new ArraySet();

      // Find mappings for the "sourceFile"
      this._mappings.unsortedForEach(function (mapping) {
        if (mapping.source === sourceFile && mapping.originalLine != null) {
          // Check if it can be mapped by the source map, then update the mapping.
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source != null) {
            // Copy mapping
            mapping.source = original.source;
            if (aSourceMapPath != null) {
              mapping.source = util.join(aSourceMapPath, mapping.source)
            }
            if (sourceRoot != null) {
              mapping.source = util.relative(sourceRoot, mapping.source);
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name != null) {
              mapping.name = original.name;
            }
          }
        }

        var source = mapping.source;
        if (source != null && !newSources.has(source)) {
          newSources.add(source);
        }

        var name = mapping.name;
        if (name != null && !newNames.has(name)) {
          newNames.add(name);
        }

      }, this);
      this._sources = newSources;
      this._names = newNames;

      // Copy sourcesContents of applied map.
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aSourceMapPath != null) {
            sourceFile = util.join(aSourceMapPath, sourceFile);
          }
          if (sourceRoot != null) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  SourceMapGenerator.prototype._validateMapping =
    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
          && aGenerated.line > 0 && aGenerated.column >= 0
          && !aOriginal && !aSource && !aName) {
        // Case 1.
        return;
      }
      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
               && aGenerated.line > 0 && aGenerated.column >= 0
               && aOriginal.line > 0 && aOriginal.column >= 0
               && aSource) {
        // Cases 2 and 3.
        return;
      }
      else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          original: aOriginal,
          name: aName
        }));
      }
    };

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  SourceMapGenerator.prototype._serializeMappings =
    function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;

      var mappings = this._mappings.toArray();

      for (var i = 0, len = mappings.length; i < len; i++) {
        mapping = mappings[i];

        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generatedColumn
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source != null) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.originalLine - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;

          result += base64VLQ.encode(mapping.originalColumn
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;

          if (mapping.name != null) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }

      return result;
    };

  SourceMapGenerator.prototype._generateSourcesContent =
    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function (source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot != null) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                    key)
          ? this._sourcesContents[key]
          : null;
      }, this);
    };

  /**
   * Externalize the source map.
   */
  SourceMapGenerator.prototype.toJSON =
    function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._file != null) {
        map.file = this._file;
      }
      if (this._sourceRoot != null) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }

      return map;
    };

  /**
   * Render the source map being generated to a string.
   */
  SourceMapGenerator.prototype.toString =
    function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});

},{"./array-set":176,"./base64-vlq":177,"./mapping-list":180,"./util":184,"amdefine":71}],183:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
  var util = require('./util');

  // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
  // operating systems these days (capturing the result).
  var REGEX_NEWLINE = /(\r?\n)/;

  // Newline character code for charCodeAt() comparisons
  var NEWLINE_CODE = 10;

  // Private symbol for identifying `SourceNode`s when multiple versions of
  // the source-map library are loaded. This MUST NOT CHANGE across
  // versions!
  var isSourceNode = "$$$isSourceNode$$$";

  /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   * @param aName The original identifier.
   */
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine == null ? null : aLine;
    this.column = aColumn == null ? null : aColumn;
    this.source = aSource == null ? null : aSource;
    this.name = aName == null ? null : aName;
    this[isSourceNode] = true;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   * @param aRelativePath Optional. The path that relative sources in the
   *        SourceMapConsumer should be relative to.
   */
  SourceNode.fromStringWithSourceMap =
    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
      // The SourceNode we want to fill with the generated code
      // and the SourceMap
      var node = new SourceNode();

      // All even indices of this array are one line of the generated code,
      // while all odd indices are the newlines between two adjacent lines
      // (since `REGEX_NEWLINE` captures its match).
      // Processed fragments are removed from this array, by calling `shiftNextLine`.
      var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
      var shiftNextLine = function() {
        var lineContents = remainingLines.shift();
        // The last line of a file might not have a newline.
        var newLine = remainingLines.shift() || "";
        return lineContents + newLine;
      };

      // We need to remember the position of "remainingLines"
      var lastGeneratedLine = 1, lastGeneratedColumn = 0;

      // The generate SourceNodes we need a code range.
      // To extract it current and last mapping is used.
      // Here we store the last mapping.
      var lastMapping = null;

      aSourceMapConsumer.eachMapping(function (mapping) {
        if (lastMapping !== null) {
          // We add the code from "lastMapping" to "mapping":
          // First check if there is a new line in between.
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            // Associate first line with "lastMapping"
            addMappingWithCode(lastMapping, shiftNextLine());
            lastGeneratedLine++;
            lastGeneratedColumn = 0;
            // The remaining code is added without mapping
          } else {
            // There is no new line in between.
            // Associate the code between "lastGeneratedColumn" and
            // "mapping.generatedColumn" with "lastMapping"
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn -
                                          lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                                lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
            // No more remaining code, continue
            lastMapping = mapping;
            return;
          }
        }
        // We add the generated code until the first mapping
        // to the SourceNode without any mapping.
        // Each line is added as separate string.
        while (lastGeneratedLine < mapping.generatedLine) {
          node.add(shiftNextLine());
          lastGeneratedLine++;
        }
        if (lastGeneratedColumn < mapping.generatedColumn) {
          var nextLine = remainingLines[0];
          node.add(nextLine.substr(0, mapping.generatedColumn));
          remainingLines[0] = nextLine.substr(mapping.generatedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
        }
        lastMapping = mapping;
      }, this);
      // We have processed all mappings.
      if (remainingLines.length > 0) {
        if (lastMapping) {
          // Associate the remaining code in the current line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
        }
        // and add the remaining lines without any mapping
        node.add(remainingLines.join(""));
      }

      // Copy sourcesContent into SourceNode
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aRelativePath != null) {
            sourceFile = util.join(aRelativePath, sourceFile);
          }
          node.setSourceContent(sourceFile, content);
        }
      });

      return node;

      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          var source = aRelativePath
            ? util.join(aRelativePath, mapping.source)
            : mapping.source;
          node.add(new SourceNode(mapping.originalLine,
                                  mapping.originalColumn,
                                  source,
                                  code,
                                  mapping.name));
        }
      }
    };

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function (chunk) {
        this.add(chunk);
      }, this);
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length-1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length; i < len; i++) {
      chunk = this.children[i];
      if (chunk[isSourceNode]) {
        chunk.walk(aFn);
      }
      else {
        if (chunk !== '') {
          aFn(chunk, { source: this.source,
                       line: this.line,
                       column: this.column,
                       name: this.name });
        }
      }
    }
  };

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len-1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild[isSourceNode]) {
      lastChild.replaceRight(aPattern, aReplacement);
    }
    else if (typeof lastChild === 'string') {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    }
    else {
      this.children.push(''.replace(aPattern, aReplacement));
    }
    return this;
  };

  /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */
  SourceNode.prototype.setSourceContent =
    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };

  /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walkSourceContents =
    function SourceNode_walkSourceContents(aFn) {
      for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i][isSourceNode]) {
          this.children[i].walkSourceContents(aFn);
        }
      }

      var sources = Object.keys(this.sourceContents);
      for (var i = 0, len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function (chunk) {
      str += chunk;
    });
    return str;
  };

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function (chunk, original) {
      generated.code += chunk;
      if (original.source !== null
          && original.line !== null
          && original.column !== null) {
        if(lastOriginalSource !== original.source
           || lastOriginalLine !== original.line
           || lastOriginalColumn !== original.column
           || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      for (var idx = 0, length = chunk.length; idx < length; idx++) {
        if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
          generated.line++;
          generated.column = 0;
          // Mappings end at eol
          if (idx + 1 === length) {
            lastOriginalSource = null;
            sourceMappingActive = false;
          } else if (sourceMappingActive) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
        } else {
          generated.column++;
        }
      }
    });
    this.walkSourceContents(function (sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });

    return { code: generated.code, map: map };
  };

  exports.SourceNode = SourceNode;

});

},{"./source-map-generator":182,"./util":184,"amdefine":71}],184:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
  var dataUrlRegexp = /^data:.+\,.+$/;

  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5]
    };
  }
  exports.urlParse = urlParse;

  function urlGenerate(aParsedUrl) {
    var url = '';
    if (aParsedUrl.scheme) {
      url += aParsedUrl.scheme + ':';
    }
    url += '//';
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + '@';
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;

  /**
   * Normalizes a path, or the path portion of a URL:
   *
   * - Replaces consequtive slashes with one slash.
   * - Removes unnecessary '.' parts.
   * - Removes unnecessary '<dir>/..' parts.
   *
   * Based on code in the Node.js 'path' core module.
   *
   * @param aPath The path or url to normalize.
   */
  function normalize(aPath) {
    var path = aPath;
    var url = urlParse(aPath);
    if (url) {
      if (!url.path) {
        return aPath;
      }
      path = url.path;
    }
    var isAbsolute = (path.charAt(0) === '/');

    var parts = path.split(/\/+/);
    for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
      part = parts[i];
      if (part === '.') {
        parts.splice(i, 1);
      } else if (part === '..') {
        up++;
      } else if (up > 0) {
        if (part === '') {
          // The first part is blank if the path is absolute. Trying to go
          // above the root is a no-op. Therefore we can remove all '..' parts
          // directly after the root.
          parts.splice(i + 1, up);
          up = 0;
        } else {
          parts.splice(i, 2);
          up--;
        }
      }
    }
    path = parts.join('/');

    if (path === '') {
      path = isAbsolute ? '/' : '.';
    }

    if (url) {
      url.path = path;
      return urlGenerate(url);
    }
    return path;
  }
  exports.normalize = normalize;

  /**
   * Joins two paths/URLs.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be joined with the root.
   *
   * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
   *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
   *   first.
   * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
   *   is updated with the result and aRoot is returned. Otherwise the result
   *   is returned.
   *   - If aPath is absolute, the result is aPath.
   *   - Otherwise the two paths are joined with a slash.
   * - Joining for example 'http://' and 'www.example.com' is also supported.
   */
  function join(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    if (aPath === "") {
      aPath = ".";
    }
    var aPathUrl = urlParse(aPath);
    var aRootUrl = urlParse(aRoot);
    if (aRootUrl) {
      aRoot = aRootUrl.path || '/';
    }

    // `join(foo, '//www.example.org')`
    if (aPathUrl && !aPathUrl.scheme) {
      if (aRootUrl) {
        aPathUrl.scheme = aRootUrl.scheme;
      }
      return urlGenerate(aPathUrl);
    }

    if (aPathUrl || aPath.match(dataUrlRegexp)) {
      return aPath;
    }

    // `join('http://', 'www.example.com')`
    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
      aRootUrl.host = aPath;
      return urlGenerate(aRootUrl);
    }

    var joined = aPath.charAt(0) === '/'
      ? aPath
      : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

    if (aRootUrl) {
      aRootUrl.path = joined;
      return urlGenerate(aRootUrl);
    }
    return joined;
  }
  exports.join = join;

  /**
   * Make a path relative to a URL or another path.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be made relative to aRoot.
   */
  function relative(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }

    aRoot = aRoot.replace(/\/$/, '');

    // XXX: It is possible to remove this block, and the tests still pass!
    var url = urlParse(aRoot);
    if (aPath.charAt(0) == "/" && url && url.path == "/") {
      return aPath.slice(1);
    }

    return aPath.indexOf(aRoot + '/') === 0
      ? aPath.substr(aRoot.length + 1)
      : aPath;
  }
  exports.relative = relative;

  /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  function toSetString(aStr) {
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  function strcmp(aStr1, aStr2) {
    var s1 = aStr1 || "";
    var s2 = aStr2 || "";
    return (s1 > s2) - (s1 < s2);
  }

  /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp;

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp || onlyCompareOriginal) {
      return cmp;
    }

    cmp = strcmp(mappingA.name, mappingB.name);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    return mappingA.generatedColumn - mappingB.generatedColumn;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings where the generated positions are
   * compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
    var cmp;

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp || onlyCompareGenerated) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositions = compareByGeneratedPositions;

});

},{"amdefine":71}],185:[function(require,module,exports){
var type = require('mutype');
var extend = require('xtend/mutable');

module.exports = splitKeys;


/**
 * Disentangle listed keys
 *
 * @param {Object} obj An object with key including listed declarations
 * @example {'a,b,c': 1}
 *
 * @param {boolean} deep Whether to flatten nested objects
 *
 * @todo Think to provide such method on object prototype
 *
 * @return {oblect} Source set passed {@link set}
 */
function splitKeys(obj, deep, separator){
	//swap args, if needed
	if ((deep || separator) && (type.isBoolean(separator) || type.isString(deep) || type.isRegExp(deep))) {
		var tmp = deep;
		deep = separator;
		separator = tmp;
	}

	//ensure separator
	separator = separator === undefined ? splitKeys.separator : separator;

	var list, value;

	for(var keys in obj){
		value = obj[keys];

		if (deep && type.isObject(value)) splitKeys(value, deep, separator);

		list = keys.split(separator);

		if (list.length > 1){
			delete obj[keys];
			list.forEach(setKey);
		}
	}

	function setKey(key){
		//if existing key - extend, if possible
		//FIXME: obj[key] might be not an object, but function, for example
		if (value !== obj[key] && type.isObject(value) && type.isObject(obj[key])) {
			obj[key] = extend({}, obj[key], value);
		}
		//or replace
		else {
			obj[key] = value;
		}
	}

	return obj;
}


/** default separator */
splitKeys.separator = /\s?,\s?/;
},{"mutype":136,"xtend/mutable":222}],186:[function(require,module,exports){
/**
 * @module  st8
 *
 * Micro state machine.
 */


var Emitter = require('events');
var isObject = require('is-plain-object');


/** Defaults */

State.options = {
	leaveCallback: 'after',
	enterCallback: 'before',
	changeCallback: 'change',
	remainderState: '_'
};


/**
 * Create a new state controller based on states passed
 *
 * @constructor
 *
 * @param {object} settings Initial states
 */

function State(states, context){
	//ignore existing state
	if (states instanceof State) return states;

	//ensure new state instance is created
	if (!(this instanceof State)) return new State(states);

	//save states object
	this.states = states || {};

	//save context
	this.context = context || this;

	//initedFlag
	this.isInit = false;
}


/** Inherit State from Emitter */

var proto = State.prototype = Object.create(Emitter.prototype);


/**
 * Go to a state
 *
 * @param {*} value Any new state to enter
 */

proto.set = function (value) {
	var oldValue = this.state, states = this.states;
	// console.group('set', value, oldValue);

	//leave old state
	var oldStateName = states[oldValue] !== undefined ? oldValue : State.options.remainderState;
	var oldState = states[oldStateName];

	var leaveResult, leaveFlag = State.options.leaveCallback + oldStateName;

	if (this.isInit) {
		if (isObject(oldState)) {
			if (!this[leaveFlag]) {
				this[leaveFlag] = true;

				//if oldstate has after method - call it
				leaveResult = getValue(oldState, State.options.leaveCallback, this.context);

				//ignore changing if leave result is falsy
				if (leaveResult === false) {
					this[leaveFlag] = false;
					// console.groupEnd();
					return false;
				}

				//redirect, if returned anything
				else if (leaveResult !== undefined && leaveResult !== value) {
					this.set(leaveResult);
					this[leaveFlag] = false;
					// console.groupEnd();
					return false;
				}

				this[leaveFlag] = false;

				//ignore redirect
				if (this.state !== oldValue) {
					return;
				}
			}

		}

		//ignore not changed value
		if (value === oldValue) return false;
	}
	else {
		this.isInit = true;
	}


	//set current value
	this.state = value;


	//try to enter new state
	var newStateName = states[value] !== undefined ? value : State.options.remainderState;
	var newState = states[newStateName];
	var enterFlag = State.options.enterCallback + newStateName;
	var enterResult;

	if (!this[enterFlag]) {
		this[enterFlag] = true;

		if (isObject(newState)) {
			enterResult = getValue(newState, State.options.enterCallback, this.context);
		} else {
			enterResult = getValue(states, newStateName, this.context);
		}

		//ignore entering falsy state
		if (enterResult === false) {
			this.set(oldValue);
			this[enterFlag] = false;
			// console.groupEnd();
			return false;
		}

		//redirect if returned anything but current state
		else if (enterResult !== undefined && enterResult !== value) {
			this.set(enterResult);
			this[enterFlag] = false;
			// console.groupEnd();
			return false;
		}

		this[enterFlag] = false;
	}



	//notify change
	if (value !== oldValue)	{
		this.emit(State.options.changeCallback, value, oldValue);
	}


	// console.groupEnd();

	//return context to chain calls
	return this.context;
};


/** Get current state */

proto.get = function(){
	return this.state;
};


/** Return value or fn result */
function getValue(holder, meth, ctx){
	if (typeof holder[meth] === 'function') {
		return holder[meth].call(ctx);
	}

	return holder[meth];
}


module.exports = State;
},{"events":97,"is-plain-object":109}],187:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var path = require("path")

"use strict"

function urix(aPath) {
  if (path.sep === "\\") {
    return aPath
      .replace(/\\/g, "/")
      .replace(/^[a-z]:\/?/i, "/")
  }
  return aPath
}

module.exports = urix

},{"path":155}],188:[function(require,module,exports){
var escape = require('escape-html');
var propConfig = require('./property-config');
var types = propConfig.attributeTypes;
var properties = propConfig.properties;
var attributeNames = propConfig.attributeNames;

var prefixAttribute = memoizeString(function (name) {
  return escape(name) + '="';
});

module.exports = createAttribute;

/**
 * Create attribute string.
 *
 * @param {String} name The name of the property or attribute
 * @param {*} value The value
 * @param {Boolean} [isAttribute] Denotes whether `name` is an attribute.
 * @return {?String} Attribute string || null if not a valid property or custom attribute.
 */

function createAttribute(name, value, isAttribute) {
  if (properties.hasOwnProperty(name)) {
    if (shouldSkip(name, value)) return '';
    name = (attributeNames[name] || name).toLowerCase();
    var attrType = properties[name];
    // for BOOLEAN `value` only has to be truthy
    // for OVERLOADED_BOOLEAN `value` has to be === true
    if ((attrType === types.BOOLEAN) ||
        (attrType === types.OVERLOADED_BOOLEAN && value === true)) {
      return escape(name);
    }
    return prefixAttribute(name) + escape(value) + '"';
  } else if (isAttribute) {
    if (value == null) return '';
    return prefixAttribute(name) + escape(value) + '"';
  }
  // return null if `name` is neither a valid property nor an attribute
  return null;
}

/**
 * Should skip false boolean attributes.
 */

function shouldSkip(name, value) {
  var attrType = properties[name];
  return value == null ||
    (attrType === types.BOOLEAN && !value) ||
    (attrType === types.OVERLOADED_BOOLEAN && value === false);
}

/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */

function memoizeString(callback) {
  var cache = {};
  return function(string) {
    if (cache.hasOwnProperty(string)) {
      return cache[string];
    } else {
      return cache[string] = callback.call(this, string);
    }
  };
}
},{"./property-config":190,"escape-html":95}],189:[function(require,module,exports){
var escape = require('escape-html');
var extend = require('xtend');
var isVNode = require('virtual-dom/vnode/is-vnode');
var isVText = require('virtual-dom/vnode/is-vtext');
var isThunk = require('virtual-dom/vnode/is-thunk');
var isWidget = require('virtual-dom/vnode/is-widget');
var softHook = require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');
var attrHook = require('virtual-dom/virtual-hyperscript/hooks/attribute-hook');
var paramCase = require('param-case');
var createAttribute = require('./create-attribute');
var voidElements = require('./void-elements');

module.exports = toHTML;

function toHTML(node, parent) {
  if (!node) return '';

  if (isThunk(node)) {
    node = node.render();
  }

  if (isWidget(node) && node.render) {
    node = node.render();
  }

  if (isVNode(node)) {
    return openTag(node) + tagContent(node) + closeTag(node);
  } else if (isVText(node)) {
    if (parent && parent.tagName.toLowerCase() === 'script') return String(node.text);
    return escape(String(node.text));
  }

  return '';
}

function openTag(node) {
  var props = node.properties;
  var ret = '<' + node.tagName.toLowerCase();

  for (var name in props) {
    var value = props[name];
    if (value == null) continue;

    if (name == 'attributes') {
      value = extend({}, value);
      for (var attrProp in value) {
        ret += ' ' + createAttribute(attrProp, value[attrProp], true);
      }
      continue;
    }

    if (name == 'style') {
      var css = '';
      value = extend({}, value);
      for (var styleProp in value) {
        css += paramCase(styleProp) + ': ' + value[styleProp] + '; ';
      }
      value = css.trim();
    }

    if (value instanceof softHook || value instanceof attrHook) {
      ret += ' ' + createAttribute(name, value.value, true);
      continue;
    }

    var attr = createAttribute(name, value);
    if (attr) ret += ' ' + attr;
  }

  return ret + '>';
}

function tagContent(node) {
  var innerHTML = node.properties.innerHTML;
  if (innerHTML != null) return innerHTML;
  else {
    var ret = '';
    if (node.children && node.children.length) {
      for (var i = 0, l = node.children.length; i<l; i++) {
        var child = node.children[i];
        ret += toHTML(child, node);
      }
    }
    return ret;
  }
}

function closeTag(node) {
  var tag = node.tagName.toLowerCase();
  return voidElements[tag] ? '' : '</' + tag + '>';
}
},{"./create-attribute":188,"./void-elements":191,"escape-html":95,"param-case":151,"virtual-dom/virtual-hyperscript/hooks/attribute-hook":203,"virtual-dom/virtual-hyperscript/hooks/soft-set-hook":205,"virtual-dom/vnode/is-thunk":209,"virtual-dom/vnode/is-vnode":211,"virtual-dom/vnode/is-vtext":212,"virtual-dom/vnode/is-widget":213,"xtend":221}],190:[function(require,module,exports){
/**
 * Attribute types.
 */

var types = {
  BOOLEAN: 1,
  OVERLOADED_BOOLEAN: 2
};

/**
 * Properties.
 *
 * Taken from https://github.com/facebook/react/blob/847357e42e5267b04dd6e297219eaa125ab2f9f4/src/browser/ui/dom/HTMLDOMPropertyConfig.js
 *
 */

var properties = {
  /**
   * Standard Properties
   */
  accept: true,
  acceptCharset: true,
  accessKey: true,
  action: true,
  allowFullScreen: types.BOOLEAN,
  allowTransparency: true,
  alt: true,
  async: types.BOOLEAN,
  autocomplete: true,
  autofocus: types.BOOLEAN,
  autoplay: types.BOOLEAN,
  cellPadding: true,
  cellSpacing: true,
  charset: true,
  checked: types.BOOLEAN,
  classID: true,
  className: true,
  cols: true,
  colSpan: true,
  content: true,
  contentEditable: true,
  contextMenu: true,
  controls: types.BOOLEAN,
  coords: true,
  crossOrigin: true,
  data: true, // For `<object />` acts as `src`.
  dateTime: true,
  defer: types.BOOLEAN,
  dir: true,
  disabled: types.BOOLEAN,
  download: types.OVERLOADED_BOOLEAN,
  draggable: true,
  enctype: true,
  form: true,
  formAction: true,
  formEncType: true,
  formMethod: true,
  formNoValidate: types.BOOLEAN,
  formTarget: true,
  frameBorder: true,
  headers: true,
  height: true,
  hidden: types.BOOLEAN,
  href: true,
  hreflang: true,
  htmlFor: true,
  httpEquiv: true,
  icon: true,
  id: true,
  label: true,
  lang: true,
  list: true,
  loop: types.BOOLEAN,
  manifest: true,
  marginHeight: true,
  marginWidth: true,
  max: true,
  maxLength: true,
  media: true,
  mediaGroup: true,
  method: true,
  min: true,
  multiple: types.BOOLEAN,
  muted: types.BOOLEAN,
  name: true,
  noValidate: types.BOOLEAN,
  open: true,
  pattern: true,
  placeholder: true,
  poster: true,
  preload: true,
  radiogroup: true,
  readOnly: types.BOOLEAN,
  rel: true,
  required: types.BOOLEAN,
  role: true,
  rows: true,
  rowSpan: true,
  sandbox: true,
  scope: true,
  scrolling: true,
  seamless: types.BOOLEAN,
  selected: types.BOOLEAN,
  shape: true,
  size: true,
  sizes: true,
  span: true,
  spellcheck: true,
  src: true,
  srcdoc: true,
  srcset: true,
  start: true,
  step: true,
  style: true,
  tabIndex: true,
  target: true,
  title: true,
  type: true,
  useMap: true,
  value: true,
  width: true,
  wmode: true,

  /**
   * Non-standard Properties
   */
  // autoCapitalize and autoCorrect are supported in Mobile Safari for
  // keyboard hints.
  autocapitalize: true,
  autocorrect: true,
  // itemProp, itemScope, itemType are for Microdata support. See
  // http://schema.org/docs/gs.html
  itemProp: true,
  itemScope: types.BOOLEAN,
  itemType: true,
  // property is supported for OpenGraph in meta tags.
  property: true
};

/**
 * Properties to attributes mapping.
 *
 * The ones not here are simply converted to lower case.
 */

var attributeNames = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv'
};

/**
 * Exports.
 */

module.exports = {
  attributeTypes: types,
  properties: properties,
  attributeNames: attributeNames
};
},{}],191:[function(require,module,exports){

/**
 * Void elements.
 *
 * https://github.com/facebook/react/blob/v0.12.0/src/browser/ui/ReactDOMComponent.js#L99
 */

module.exports = {
  'area': true,
  'base': true,
  'br': true,
  'col': true,
  'embed': true,
  'hr': true,
  'img': true,
  'input': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
};
},{}],192:[function(require,module,exports){
var BaseElement = require('base-element')
var xtend = require('xtend/mutable')
var inherits = require('inherits')
var attachCSS = require('attach-css')

function ViewList (params) {
  var self = this
  if (!(self instanceof ViewList)) return new ViewList(params)
  params = params || {}
  BaseElement.call(self, params.appendTo)

  // Calculate height outside of the style.height
  this.addEventListener('load', function (node) {
    self.height = node.offsetHeight
  })

  // The last data rendered
  self._lastData = []

  xtend(this, {
    tagName: 'ul',
    childTagName: 'li',
    className: 'view-list',
    topClassName: 'top',
    bottomClassName: 'bottom',
    onscroll: function () {
      self._scrollTop = this.scrollTop
      self.render(self._lastData)
      self.send('scroll', this)
    },
    eachrow: function (row) {
      return this.html(self.childTagName, {
        style: { height: self.rowHeight }
      }, [row])
    },
    height: 500,
    rowHeight: 30,
    _scrollTop: 0,
    _visibleStart: 0,
    _visibleEnd: 0,
    _displayStart: 0,
    _displayEnd: 0
  }, params)
}
inherits(ViewList, BaseElement)
module.exports = ViewList

// Calculate the view of the total data on scroll
ViewList.prototype._calculateScroll = function (data) {
  var total = data.length
  var rowsPerBody = Math.floor((this.height - 2) / this.rowHeight)
  this._visibleStart = Math.round(Math.floor(this._scrollTop / this.rowHeight))
  this._visibleEnd = Math.round(Math.min(this._visibleStart + rowsPerBody))
  this._displayStart = Math.round(Math.max(0, Math.floor(this._scrollTop / this.rowHeight) - rowsPerBody * 1.5))
  this._displayEnd = Math.round(Math.min(this._displayStart + 4 * rowsPerBody, total))
}

ViewList.prototype.render = function (data) {
  var self = this
  this._lastData = data
  this._calculateScroll(data)

  // Slice off rows and create elements for each
  var rows = data.slice(this._displayStart, this._displayEnd)
  rows = rows.map(function (row) {
    return self.eachrow(row)
  })

  // Calculate top row
  rows.unshift(this.html(this.childTagName, {
    className: this.topClassName,
    style: {
      height: this._displayStart * this.rowHeight + 'px',
      padding: 0,
      margin: 0
    }
  }))

  // Calculate bottom row
  rows.push(this.html(this.childTagName, {
    className: this.bottomClassName,
    style: {
      height: (data.length - this._displayEnd) * this.rowHeight + 'px',
      padding: 0,
      margin: 0
    }
  }))

  return this.afterRender(this.html(this.tagName, this, rows))
}

ViewList.prototype.css = function () {
  var tagName = this.tagName
  var childTagName = this.childTagName
  return attachCSS([
    tagName + ' {',
    'margin: 0;',
    'padding: 0;',
    'overflow: auto;',
    '}',
    tagName + ' ' + childTagName + ' {',
    'list-style: none;',
    '}'
  ].join('\n'), this.vtree)
}

},{"attach-css":75,"base-element":76,"inherits":106,"xtend/mutable":222}],193:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":198}],194:[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":219}],195:[function(require,module,exports){
var h = require("./virtual-hyperscript/index.js")

module.exports = h

},{"./virtual-hyperscript/index.js":206}],196:[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":201}],197:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":210,"is-object":108}],198:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":208,"../vnode/is-vnode.js":211,"../vnode/is-vtext.js":212,"../vnode/is-widget.js":213,"./apply-properties":197,"global/document":101}],199:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],200:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = renderOptions.render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = renderOptions.render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":213,"../vnode/vpatch.js":216,"./apply-properties":197,"./update-widget":202}],201:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var render = require("./create-element")
var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches, renderOptions) {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
        ? renderOptions.patch
        : patchRecursive
    renderOptions.render = renderOptions.render || render

    return renderOptions.patch(rootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./create-element":198,"./dom-index":199,"./patch-op":200,"global/document":101,"x-is-array":220}],202:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":213}],203:[function(require,module,exports){
'use strict';

module.exports = AttributeHook;

function AttributeHook(namespace, value) {
    if (!(this instanceof AttributeHook)) {
        return new AttributeHook(namespace, value);
    }

    this.namespace = namespace;
    this.value = value;
}

AttributeHook.prototype.hook = function (node, prop, prev) {
    if (prev && prev.type === 'AttributeHook' &&
        prev.value === this.value &&
        prev.namespace === this.namespace) {
        return;
    }

    node.setAttributeNS(this.namespace, prop, this.value);
};

AttributeHook.prototype.unhook = function (node, prop, next) {
    if (next && next.type === 'AttributeHook' &&
        next.namespace === this.namespace) {
        return;
    }

    var colonPosition = prop.indexOf(':');
    var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
    node.removeAttributeNS(this.namespace, localName);
};

AttributeHook.prototype.type = 'AttributeHook';

},{}],204:[function(require,module,exports){
'use strict';

var EvStore = require('ev-store');

module.exports = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function(node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

},{"ev-store":96}],205:[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],206:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var VNode = require('../vnode/vnode.js');
var VText = require('../vnode/vtext.js');
var isVNode = require('../vnode/is-vnode');
var isVText = require('../vnode/is-vtext');
var isWidget = require('../vnode/is-widget');
var isHook = require('../vnode/is-vhook');
var isVThunk = require('../vnode/is-thunk');

var parseTag = require('./parse-tag.js');
var softSetHook = require('./hooks/soft-set-hook.js');
var evHook = require('./hooks/ev-hook.js');

module.exports = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }


    return new VNode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new VText(c));
    } else if (typeof c === 'number') {
        childNodes.push(new VText(String(c)));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isHook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' +
        'Expected a VNode / Vthunk / VWidget / string but:\n' +
        'got:\n' +
        errorString(data.foreignObject) +
        '.\n' +
        'The parent vnode is:\n' +
        errorString(data.parentVnode)
        '\n' +
        'Suggested fix: change your `h(..., [ ... ])` callsite.';
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}

},{"../vnode/is-thunk":209,"../vnode/is-vhook":210,"../vnode/is-vnode":211,"../vnode/is-vtext":212,"../vnode/is-widget":213,"../vnode/vnode.js":215,"../vnode/vtext.js":217,"./hooks/ev-hook.js":204,"./hooks/soft-set-hook.js":205,"./parse-tag.js":207,"x-is-array":220}],207:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

},{"browser-split":78}],208:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":209,"./is-vnode":211,"./is-vtext":212,"./is-widget":213}],209:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],210:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],211:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":214}],212:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":214}],213:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],214:[function(require,module,exports){
module.exports = "2"

},{}],215:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":209,"./is-vhook":210,"./is-vnode":211,"./is-widget":213,"./version":214}],216:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":214}],217:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":214}],218:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":210,"is-object":108}],219:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":208,"../vnode/is-thunk":209,"../vnode/is-vnode":211,"../vnode/is-vtext":212,"../vnode/is-widget":213,"../vnode/vpatch":216,"./diff-props":218,"x-is-array":220}],220:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],221:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],222:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[12])}(window.BetterTTV = window.BetterTTV || {}));