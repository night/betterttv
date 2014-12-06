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
/** @license
 * Jade
 * https://github.com/visionmedia/jade
 *
 * Copyright (c) 2009-2014 TJ Holowaychuk (tj@vision-media.ca)
 * Licensed under the MIT license.
 */
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jade=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
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
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
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

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
    str = str || _dereq_('fs').readFileSync(filename, 'utf8')
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

},{"fs":2}],2:[function(_dereq_,module,exports){

},{}]},{},[1])
(1)
});(function(bttv) {(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    log: function(string) {
        if(window.console && console.log && bttv.settings.get('consoleLog') === true) console.log("BTTV: " + string);
    }
};
},{}],2:[function(require,module,exports){
exports.remove = function (e) {
    // Removes all of an element
    $(e).each(function () {
        $(this).hide();
    });
};
exports.display = function (e) {
    // Displays all of an element
    $(e).each(function () {
        $(this).show();
    });
};
},{}],3:[function(require,module,exports){
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

},{"./debug":1,"./element":2,"./features/beta-chat":4,"./features/brand":5,"./features/channel-reformat":7,"./features/chat-load-settings":10,"./features/check-broadcast-info":11,"./features/check-following":12,"./features/check-messages":13,"./features/clear-clutter":14,"./features/create-settings":15,"./features/css-loader":16,"./features/darken-page":17,"./features/dashboard-channelinfo":18,"./features/directory-functions":19,"./features/embedded-polling":20,"./features/flip-dashboard":21,"./features/format-dashboard":22,"./features/giveaway-compatibility":23,"./features/handle-background":24,"./features/handle-twitchchat-emotes":25,"./features/highlight-feedback":26,"./features/make-card":27,"./features/override-emotes":28,"./features/split-chat":29,"./keycodes":30,"./legacy-tags":31,"./settings-list":32,"./templates/moderation-card":35,"./templates/setting-switch":36,"./vars":38}],4:[function(require,module,exports){
var debug = require('../debug'),
    vars = require('../vars');

module.exports = function () {
    if (bttv.settings.get("bttvChat") === true && vars.userData.isLoggedIn) {

        if($("body#chat").length || $('body[data-page="ember#chat"]').length) return;

        debug.log("Running Beta Chat");

        if(!vars.betaChatLoaded) {
            vars.betaChatLoaded = true;
            $.getJSON("//chat.betterttv.net/login.php?onsite=true&verify=true&callback=?", function(d) {
                if(d.status === true) {
                    debug.log("Logged into BTTV Chat");
                } else {
                    $.getJSON("//chat.betterttv.net/login.php?onsite=true&user="+vars.userData.login+"&callback=?");
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
        $('body').append("<style>.ember-chat .chat-interface { height: 140px !important; } .ember-chat .chat-messages { bottom: 140px; } .ember-chat .chat-settings { bottom: 80px; } .ember-chat .emoticon-selector { bottom: 142px !important; }</style>");
    }
}
},{"../debug":1,"../vars":38}],5:[function(require,module,exports){
var debug = require('../debug');
var betaChat = require('./beta-chat');

module.exports = function () {
    debug.log("Branding Site with Better & Importing Styles");

    // Old Site Header Logo Branding
    if ($("#header_logo").length) {
        $("#header_logo").html("<img alt=\"TwitchTV\" src=\"//cdn.betterttv.net/style/logos/black_twitch_logo.png\">");
        var $watermark = $('<img />');
        $watermark.attr('src', '//cdn.betterttv.net/style/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'margin-left': '-82px',
            'margin-top': '-10px',
            'float': 'left',
            'height': 18,
            'position': 'absolute'
        });
        $("#header_logo").append($watermark);
    }

    // New Site Logo Branding
    if ($("#large_nav #logo").length) {
        var $watermark = $('<img />');
        $watermark.attr('src', '//cdn.betterttv.net/style/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'margin-left': '-76px',
            'margin-top': '-16px',
            'float': 'left',
            'position': 'absolute'

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

    // Small Popout/Embed Chat Fixes
    $("body#chat").css("overflow-y", "hidden");
    $('#chat_loading_spinner').attr('src', "data:image/gif;base64,R0lGODlhFgAWAPMGANfX1wAAADc3N1tbW6Ojo39/f2tra8fHx9nZ2RsbG+np6SwsLEtLS4eHh7q6ugAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hoiQ3JlYXRlZCB3aXRoIENoaW1wbHkuY29tIgAh+QQJCgAGACwAAAAAFgAWAAAEbNCESY29OEvBRdDgFXReGI7dZ2oop65YWypIjSgGbSOW/CGAIICnEAIOPdLPSDQiNykDUNgUPn1SZs6ZjE6D1eBVmaVurV1XGXwWp0vfYfv4XpqLaKg6HqbrZzs4OjZ1MBlYhiJkiYWMfy+GEQAh+QQJCgAGACwAAAAAFgAWAAAEctDIKYO9NKe9lwlCKAQZlQzo4IEiWUpnuorjC6fqR7tvjM4tgwJBJN5kuqACwGQef8kQadkEPHMsqbBqNfiwu231CtRSm+Ro7ez04sprbjobH7uR9Kn8Ds2L0XxgSkVGgXA8JV+HNoZqiBocCYuMJX4vEQAh+QQJCgAAACwAAAAAFgAWAAAEcxDISWu4uNLEOwhCKASSGA5AMqxD8pkkIBR0gaqsC4rxXN+s1otXqtlSQR2s+EPmhqGeEfjcRZk06kpJlE2dW+gIe8SFrWNv0yxES9dJ8TsLbi/VdDb3ii/H3WRadl0+eX93hX5ViCaCe2kaKR0ccpGWlREAIfkECQoAAQAsAAAAABYAFgAABHUwyEmrvTisxHlmQigw2mAOiWSsaxMwRVyQy4mqRE64sEzbqYBBt3vJZqVTcKjjHX9KXNPoS5qWRGe1FhVmqTHoVZrThq0377R35o7VZTDSnWbG2XMguYgX1799aFhrT4J7ZnldLC1yfkEXICKOGRcbHY+UlBEAIfkECQoAAQAsAAAAABYAFgAABHIwyEmrvThrOoQXTFYYpFEEQ6EWgkS8rxMUMHGmaxsQR3/INNhtxXL5frPaMGf0AZUooo7nTAqjzN3xecWpplvra/lt9rhjbFlbDaa9RfZZbFPHqXN3HQ5uQ/lmSHpkdzVoe1IiJSZ2OhsTHR8hj5SVFREAIfkECQoAAQAsAAAAABYAFgAABGowyEmrvTjrzWczIJg5REk4QWMShoQAMKAExGEfRLq2QQzPtVtOZeL5ZLQbTleUHIHK4c7pgwqZJWM1eSVmqTGrTdrsbYNjLAv846a9a3PYvYRr5+j6NPDCR9U8FyQmKHYdHiEih4uMjRQRACH5BAkKAAEALAAAAAAWABYAAARkMMhJq7046807d0QYSkhZKoFiIqhzvAchATSNIjWABC4sBznALbfrvX7BYa0Ii81yShrT96xFdbwmEhrALbNUINcrBR+rti7R7BRb1V9jOwkvy38rVmrV0nokICI/f4SFhocSEQAh+QQJCgABACwAAAAAFgAWAAAEWjDISau9OOvNu7dIGCqBIiKkeUoH4AIk8gJIOR/sHM+1cuev3av3C7SCAdnQ9sIZdUke0+U8uoQuYhN4jS592ydSmZ0CqlAyzYweS8FUyQlVOqXmn7x+z+9bIgA7");

    // Run Beta Chat After BTTV CSS
    betaChat();
};
},{"../debug":1,"./beta-chat":4}],6:[function(require,module,exports){
var debug = require('../../debug'),
    vars = require('../../vars');

var handleResize = module.exports = function () {
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

    if(!$('#bttvPlayerStyle').length) {
        $('<style></style>').attr('id', 'bttvPlayerStyle').appendTo('body');
    }

    if($('#hostmode').length) {
        var h = 0.5625 * $("#main_col").width() - 4;
        var calcH = $(window).height() - $(".hostmode-title-container").outerHeight(true) - $(".target-meta").outerHeight(true) - $(".close-hostmode").outerHeight(true);
        if (h > calcH) {
            $('#bttvPlayerStyle').html('#player, .dynamic-player, .dynamic-player object, .dynamic-player video, #hostmode .target-player object { width: 100% !important; height: '+ ($(window).height() - $(".hostmode-title-container").outerHeight(true) - $(".target-meta").outerHeight(true) - $(".close-hostmode").outerHeight(true)) + 'px !important; }');
        } else {
            $('#bttvPlayerStyle').html('#player, .dynamic-player, .dynamic-player object, .dynamic-player video, #hostmode .target-player object { width: 100% !important; height: '+ h.toFixed(0) + 'px !important; }');
        }
        $('.target-frame').css('height',$(window).height());
    } else {
        var h = 0.5625 * $("#main_col").width() - 4;
        var calcH = $(window).height() - $("#broadcast-meta").outerHeight(true) - $(".stats-and-actions").outerHeight();
        if (h > calcH) {
            $('#bttvPlayerStyle').html('#player, .dynamic-player, .dynamic-player object, .dynamic-player video { width: 100% !important; height: '+ ($(window).height() - $(".stats-and-actions").outerHeight()) + 'px !important; }');

            if($("#main_col .tse-scroll-content").scrollTop() === 0) {
                $("#main_col .tse-scroll-content").animate({
                    scrollTop: $("#broadcast-meta").outerHeight(true) - 10
                }, 150, "swing");
            }
        } else {
            $('#bttvPlayerStyle').html('#player, .dynamic-player, .dynamic-player object, .dynamic-player video { width: 100% !important; height: '+ h.toFixed(0) + 'px !important; }');
        }
    }

    $('#bttvPlayerStyle').append('#hostmode .target-player, #hostmode .target-player object, #hostmode .target-player video { width: 100% !important; }');

    var d = $("#broadcast-meta .info .title").width();
    $("#broadcast-meta .info .title .real_title").width() > d ? $("#broadcast-meta .info").addClass("long_title") : $("#broadcast-meta .info").removeClass("long_title");
    $("#channel_panels_contain").masonry("reload");
};
},{"../../debug":1,"../../vars":38}],7:[function(require,module,exports){
var debug = require('../../debug'),
    keyCodes = require('../../keycodes'),
    vars = require('../../vars');
var linkifyTitle = require('./linkify-title'),
    handleResize = require('./handle-resize'),
    twitchcast = require('./twitchcast');

module.exports = function () {
    if ($('body.ember-application').length === 0 || $('.ember-chat').length === 0 || $("#right_col").length === 0) return;

    debug.log("Reformatting Channel Page");

    linkifyTitle();
    twitchcast();

    if(!vars.loadedChannelResize) {
        vars.loadedChannelResize = true;

        var resize = false;

        $(document).keydown(function (event) {
            if (event.keyCode === keyCodes.r && event.altKey) {
                $(window).trigger('resize');
            }
        });

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
},{"../../debug":1,"../../keycodes":30,"../../vars":38,"./handle-resize":6,"./linkify-title":8,"./twitchcast":9}],8:[function(require,module,exports){
var debug = require('../../debug'),
    vars = require('../../vars');

module.exports = function () {
    if($('#broadcast-meta .title .real').length) {
        if(vars.linkifyTimer) clearInterval(vars.linkifyTimer);

        var $title = $('#broadcast-meta .title .real');

        var linkifyTitle = function() {
            var originalTitle = $title.text().replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var linkifiedTitle = bttv.chat.templates.linkify(originalTitle);

            $('#broadcast-meta .title span').each(function() {
                $(this).html(linkifiedTitle);
            });
        }

        linkifyTitle();

        vars.linkifyTimer = setInterval(function() {
            if(!vars.channelTitle) vars.channelTitle = "";
            if($title.html() !== vars.channelTitle) {
                vars.channelTitle = $title.html();
                linkifyTitle();
            }
        }, 1000);
    }
}
},{"../../debug":1,"../../vars":38}],9:[function(require,module,exports){
module.exports = function() {
    var template = '<iframe id="twitchcast" src="https://nightdev.com/twitchcast/?ontwitch={{hostname}}&channel={{channel}}" width="100%" height="100%" style="position: absolute;top: 0px;left: 0px;border: none;"></iframe>';

    var openTwitchCast = function() {
        // For some reason Twitch's built-in Twitch.player.ready *doesn't work* with their new player.
        if($('#player object').length) {
            try {
                $('#player object')[0].pauseVideo();
            } catch(e) {
                // Twitch's player doesn't support pauseVideo anymore.
            }
        }

        $('#player').append(template.replace('{{hostname}}', encodeURIComponent(window.location.protocol+'//'+window.location.host)).replace('{{channel}}', bttv.getChannel()));

        var close = function() {
            $('#twitchcast').remove();
            window.removeEventListener("message", close, false);
        }
        window.addEventListener("message", close, false);
    }
    
    var placeButton = function() {
        if($('#twitchcast_button').length) return;

        var $button = $('<div/>');
        $button.attr('id', 'twitchcast_button');
        $button.click(openTwitchCast);
        $('#player').append($button);
    }

    var castAvailable = function(callback) {
        if(!window.chrome) return callback(true);

        if(window.chrome.cast && window.chrome.cast.isAvailable) {
            return callback(false);
        }
        
        setTimeout(function() {
            castAvailable(callback);
        }, 1000);
    }

    if(bttv.settings.get('twitchCast')) {
        if(!$('#chromecast_sender').length) {
            var $senderjs = $('<script/>');
            $senderjs.attr('id', 'chromecast_sender');
            $senderjs.attr('src', 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js');
            $('head').append($senderjs);
        }
        castAvailable(function(error) {
            if(!error) placeButton();
        });
    } else {
        $('#chromecast_sender').remove();
        $('#twitchcast_button').remove();
    }
}
},{}],10:[function(require,module,exports){
var debug = require('../debug'),
    vars = require('../vars');
var darkenPage = require('./darken-page'),
    splitChat = require('./split-chat');
var removeElement = require('../element').remove;

module.exports = function() {
    if(!$('.ember-chat .chat-settings').length || $('.ember-chat .chat-settings .bttvChatSettings').length) return;

    debug.log("Loading BetterTTV Chat Settings");

    $('.ember-chat .chat-settings .clear-chat').remove();

    var settings = require('../templates/chat-settings')();

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
};
},{"../debug":1,"../element":2,"../templates/chat-settings":33,"../vars":38,"./darken-page":17,"./split-chat":29}],11:[function(require,module,exports){
var debug = require('../debug');

var checkBroadcastInfo = module.exports = function() {
    var channel = bttv.getChannel();

    if(!channel) return setTimeout(checkBroadcastInfo, 60000);

    debug.log("Check Channel Title/Game");

    Twitch.api.get("channels/"+channel).done(function(d) {
        if(d.game) {
        	if($('#broadcast-meta .channel .playing').length) {
        		$('#broadcast-meta .channel a:eq(1)').text(d.game).attr("href",Twitch.uri.game(d.game));
        	}
        }
        if(d.status) {
        	$('#broadcast-meta .title .real').text(d.status);
        	$('#broadcast-meta .title .over').text(d.status);
        }
        setTimeout(checkBroadcastInfo, 60000);
    });
}
},{"../debug":1}],12:[function(require,module,exports){
var debug = require('../debug'),
    vars = require('../vars');

var checkFollowing = module.exports = function () {
    debug.log("Check Following List");

    if($("body#chat").length || $('body[data-page="ember#chat"]').length || !vars.userData.isLoggedIn) return;

    var fetchFollowing = function(callback, followingList, followingNames, offset) {
        var followingList = followingList || [],
            followingNames = followingNames || [],
            offset = offset || 0;

        Twitch.api.get("streams/followed?limit=100&offset="+offset).done(function (d) {
            if (d.streams && d.streams.length > 0) {
                d.streams.forEach(function(stream) {
                    // Temporary fix for bad streams being included in the list
                    if(stream.viewers === null) {
                        var error = {
                            date: new Date(),
                            type: 'viewers null',
                            stream: stream
                        }
                        $.get('//nightdev.com/betterttv/errors/?obj='+encodeURIComponent(JSON.stringify(error)));
                        return;
                    }

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
},{"../debug":1,"../vars":38}],13:[function(require,module,exports){
var debug = require('../debug'),
    vars = require('../vars');

module.exports = function () {
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

    // Twitch doesn't tell us when messages from /messages/other show up.
    if(bttv.settings.get('alertOtherMessages') === false) return;
    var seenMessages = [];
    var recentMessageTimes = ['less than a minute ago', '1 minute ago'];

    var checkOther = function() {
        $.get('/messages/other', function (data) {
            var $messages = $(data).find("#message-list .unread");

            $messages.each(function() {
                var $message = $(this),
                    $senderData = $message.children("div.from_to_user"),
                    $messageData = $message.children("div.message_data"),
                    url = location.protocol+'//'+location.host+$message.data('url'),
                    messageId = $message.data('url').match(/\/message\/show\/([a-z0-9]+)/)[1],
                    avatar = $senderData.children(".prof").children("img").attr("src"),
                    sender = $senderData.children(".capital").text().trim().capitalize(),
                    time = $messageData.children(".time_ago").text().trim();

                if(seenMessages.indexOf(url) !== -1 || recentMessageTimes.indexOf(time) === -1) return;
                seenMessages.push(url);
                bttv.notify(sender+' just sent you a Message!\nClick here to view it.', 'Twitch Message Received', url, avatar, 'new_message_'+messageId);
            });
        });
    }

    setInterval(checkOther, 30000);
    checkOther();
}
},{"../debug":1,"../vars":38}],14:[function(require,module,exports){
var debug = require('../debug'),
	removeElement = require('../element').remove;

module.exports = function () {
    debug.log("Clearing Clutter");

    // Sidebar is so cluttered
    removeElement('li[data-name="kabam"]');
    removeElement('#nav_advertisement');
    if (bttv.settings.get("showFeaturedChannels") !== true) {
        removeElement('#nav_games');
        removeElement('#nav_streams');
        removeElement('#nav_related_streams');
        $('body').append('<style>#nav_games, #nav_streams, #nav_related_streams { display: none; }</style>');
    }
}
},{"../debug":1,"../element":2}],15:[function(require,module,exports){
var debug = require('../debug'),
    vars = require('../vars');
var darkenPage = require('./darken-page'),
    splitChat = require('./split-chat'),
    settingsPanelTemplate = require('../templates/settings-panel');
var removeElement = require('../element').remove;

module.exports = function () {
    var settingsPanel = document.createElement("div");
    settingsPanel.setAttribute("id", "bttvSettingsPanel");
    settingsPanel.style.display = "none";
    settingsPanel.innerHTML = settingsPanelTemplate();
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
};
},{"../debug":1,"../element":2,"../templates/settings-panel":37,"../vars":38,"./darken-page":17,"./split-chat":29}],16:[function(require,module,exports){
var debug = require('../debug');

function load(file, key){
    if(!bttv.settings.get(key)) return;
    
    var css = document.createElement("link");
    css.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-"+file+".css?"+bttv.info.versionString());
    css.setAttribute("type", "text/css");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("id", key);
    $('body').append(css);
}
function unload(key){
    $('#'+key).remove();
}

module.exports.load = load;
module.exports.unload = unload; 
},{"../debug":1}],17:[function(require,module,exports){
var debug = require('../debug'),
    handleBackground = require('./handle-background');

module.exports = function () {
    var $body = $('body');

    /* Twitch broke BGs */
    setTimeout(handleBackground, 1000);

    if(bttv.settings.get("darkenedMode") !== true || !$body.attr('data-page')) return;

    debug.log("Darkening Page");

    var pageKind = $('body').data('page').split('#')[0],
        pageType = $('body').data('page').split('#')[1] || "none",
        allowedPages = ['ember', 'message', 'dashboards', 'chat', 'chapter', 'archive', 'channel', 'user', 'bookmark'];

    if(allowedPages.indexOf(pageKind) !== -1) {

        if(pageKind === "dashboards" && pageType !== "show" || pageType === "legal") return;

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
},{"../debug":1,"./handle-background":24}],18:[function(require,module,exports){
var debug = require('../debug'),
    vars = require('../vars');

module.exports = function dashboardChannelInfo() {
    if ($("#dash_main").length) {
        debug.log("Updating Dashboard Channel Info");

        Twitch.api.get("streams/" + bttv.getChannel()).done(function (a) {
            if (a.stream) {
                $("#channel_viewer_count").text(Twitch.display.commatize(a.stream.viewers));
                if(a.stream.channel.views) $("#views_count span").text(Twitch.display.commatize(a.stream.channel.views));
                if(a.stream.channel.followers) $("#followers_count span").text(Twitch.display.commatize(a.stream.channel.followers));
            } else {
                $("#channel_viewer_count").text("Offline");
            }
        });
        Twitch.api.get("channels/" + bttv.getChannel() + "/follows?limit=1").done(function (a) {
            if (a["_total"]) {
                $("#followers_count span").text(Twitch.display.commatize(a["_total"]));
            }
        });
        if(!$("#chatters_count").length) {
            var $chattersContainer = $("<div/>");
            var $chatters = $("<span/>");

            $chattersContainer.attr("class", "stat");
            $chattersContainer.attr("id", "chatters_count");

            $chatters.text("0");
            $chatters.attr("tooltipdata", "Chatters");

            $chattersContainer.append($chatters);
            $("#followers_count").after($chattersContainer);
        }

        $.getJSON('http://tmi.twitch.tv/group/user/' + bttv.getChannel() + '/chatters?callback=?', function(data) {
            if(data.data && data.data.chatter_count) $("#chatters_count span").text(Twitch.display.commatize(data.data.chatter_count));
        });

        if(vars.dontCheckSubs !== true) {
            $.get('/broadcast/dashboard/partnership', function (data) {
                var $subsContainer = $(data).find("div.wrapper"),
                    subsRegex = /Your channel currently has ([0-9,]+) paying subscribers and ([0-9,]+) total active subscribers/;

                if ($subsContainer) {
                    var containerText = $subsContainer.text();

                    if(containerText.match(subsRegex)) {
                        var subAmounts = subsRegex.exec(containerText),
                            activeSubs = subAmounts[2];

                        if(!$("#subs_count").length) {
                            var $subsContainer = $("<div/>");
                            var $subs = $("<span/>");

                            $subsContainer.attr("class", "stat");
                            $subsContainer.attr("id", "subs_count");

                            $subs.text("0");
                            $subs.attr("tooltipdata", "Active Subscribers");

                            $subsContainer.append($subs);
                            $("#chatters_count").after($subsContainer);

                            Twitch.api.get("chat/" + bttv.getChannel() + "/badges").done(function(a) {
                                if(a.subscriber) {
                                    $("#subs_count").css("background-image", "url("+a.subscriber.image+")");
                                }
                            });
                        }

                        $("#subs_count span").text(Twitch.display.commatize(activeSubs));
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
};
},{"../debug":1,"../vars":38}],19:[function(require,module,exports){
var debug = require('../debug'),
    vars = require('../vars');

module.exports = function () {
    if(bttv.settings.get("showDirectoryLiveTab") === true && $('h2.title:contains("Following")').length && $('a.active:contains("Overview")').length) {
        debug.log("Changing Directory View");

        $('a[href="/directory/following/live"]').click();
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
},{"../debug":1,"../vars":38}],20:[function(require,module,exports){
var debug = require('../debug');
var pollTemplate = require('../templates/embedded-poll');

var frameTimeout = null;

module.exports = function (pollId) {
    if(!bttv.settings.get('embeddedPolling')) return;

    var $poll = $('#bttv-poll-contain');
    
    // If poll exists and there's an iframe open, don't do anything.
    if($poll.length && $poll.children('.frame').is(':visible')) return;

    // Otherwise, if the poll exists delete the poll
    if($poll.length) $poll.remove();

    // Push new poll to DOM
    $('.ember-chat .chat-room').append(pollTemplate({ pollId: pollId }));

    // Reset $poll to newly created poll
    $poll = $('#bttv-poll-contain');
    
    // If timeout exists already, clear it
    if(frameTimeout !== null) {
        clearTimeout(frameTimeout);
    }
    
    // After 30 seconds, remove poll if user doesn't open it
    frameTimeout = setTimeout(function() {
        if($poll && !$poll.children('.frame').is(':visible')) $poll.remove();
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
}

},{"../debug":1,"../templates/embedded-poll":34}],21:[function(require,module,exports){
var debug = require('../debug');

module.exports = function () {
    if(!$("#dash_main").length) return;

    if(bttv.settings.get("flipDashboard") === true) {
        debug.log("Flipping Dashboard");

        // We want to move the chat to the left, and the dashboard controls to the right.
        $("#dash_main .dash-chat-column").css({
            float: "left",
            right: "initial"
        });
        $("#dash_main #controls_column").css({
            float: "right",
            left: "20px"
        });
    } else {
        $("#dash_main .dash-chat-column").css({
            float: "none",
            right: "0px"
        });
        $("#dash_main #controls_column").css({
            float: "left",
            left: "0px"
        });
    }
}

},{"../debug":1}],22:[function(require,module,exports){
var debug = require('../debug');

module.exports = function () {
    if ($("#dash_main").length) {
        debug.log("Formatting Dashboard");

        // reorder left column
        $("#dash_main #controls_column .dash-hostmode-contain").appendTo("#dash_main #controls_column");
        $("#dash_main #controls_column .dash-player-contain").appendTo("#dash_main #controls_column");

        // In order to properly style chat within iframe, we pass messages between frames. This enabled that.
        if($("#dash_main iframe").length) {
            $("#dash_main iframe")[0].src = $("#dash_main iframe")[0].src+"?bttvDashboard=true";
        }

        // We move the commercial button inside the box with other dash control.
        $("#dash_main #commercial_buttons").appendTo("#dash_main .dash-broadcast-contain");

        // Small Dashboard Fixes
        $("#commercial_options .dropmenu_action[data-length=150]").text("2m 30s");
        $("#controls_column #form_submit button").attr("class", "primary_button");
    }
}

},{"../debug":1}],23:[function(require,module,exports){
var debug = require('../debug');

module.exports = function () {
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
};
},{"../debug":1}],24:[function(require,module,exports){
module.exports = function handleBackground(tiled) {
    var tiled = tiled || false;
    
    var canvasID = 'custom-bg';

    if($("#"+canvasID).length === 0) {
        var $bg = $('<canvas />');
            $bg.attr('id', canvasID);
        $('#channel').prepend($bg);
    }

    if(!window.App) return;
    App.Panel.find("user", { user: bttv.getChannel() } ).get('content').forEach(function(panel) {
        var url = panel.get('data').link;
        var safeRegex = /^https?:\/\/cdn.betterttv.net\//;
        if(url && url.indexOf('#BTTV#') !== -1) {
            var options = {};
            var queryString = url.split('#BTTV#')[1];
            var list = queryString.split('=');

            for(var i=0; i<list.length; i+=2) {
                if(list[i+1] && safeRegex.test(list[i+1])) {
                    options[list[i]] = list[i+1];
                }
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
}
},{}],25:[function(require,module,exports){
var debug = require('../debug');

module.exports = function () {
    if(bttv.settings.get("clickTwitchEmotes") === true) {
        debug.log("Injecting Twitch Chat Emotes Script");

        var emotesJSInject = document.createElement("script");
        emotesJSInject.setAttribute("src", "//cdn.betterttv.net/js/twitchemotes.js?"+bttv.info.versionString());
        emotesJSInject.setAttribute("type", "text/javascript");
        emotesJSInject.setAttribute("id", "clickTwitchEmotes");
        $("body").append(emotesJSInject);
    }
}
},{"../debug":1}],26:[function(require,module,exports){
var debug = require('../debug');

var ts_tink;

module.exports = function () {
    if (bttv.settings.get('highlightFeedback') === true) {
        if (!ts_tink) {
            debug.log('loading audio feedback sound');

            ts_tink = new Audio('//cdn.betterttv.net/style/sounds/ts-tink.ogg'); // btw ogg does not work in ie
        }

        ts_tink.load(); // needed to play sound more then once
        ts_tink.play();
    };
};

},{"../debug":1}],27:[function(require,module,exports){
module.exports = function(user, $event) {
    var template = bttv.chat.templates.moderationCard(user, $event.offset().top, $('.chat-line:last').offset().left);
    $('.ember-chat .moderation-card').remove();
    $('.ember-chat').append(template);

    var $modCard = $('.ember-chat .moderation-card[data-user="'+user.name+'"]');

    $modCard.find('.close-button').click(function() {
        $modCard.remove();
    });
    $modCard.find('.permit').click(function() {
        bttv.chat.helpers.sendMessage('!permit '+user.name);
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
        window.open(Twitch.url.profile(user.name),'_blank');
    });
    $modCard.find('.mod-card-message').click(function() {
        window.open(Twitch.url.compose(user.name),'_blank');
    });
    $modCard.find('.mod-card-edit').click(function() {
        var nickname = prompt("Enter the new nickname for "+user.display_name + '. (Leave blank to reset...)');
        if(nickname.length) {
            nickname = nickname.trim();
            if(!nickname.length) return;

            bttv.storage.pushObject("nicknames", user.name, nickname);
            $modCard.find('h3.name a').text(nickname);
            $('.chat-line[data-sender="'+user.name+'"] .from').text(nickname);
        } else {
            bttv.storage.spliceObject("nicknames", user.name);
            $modCard.find('h3.name a').text(user.display_name);
            $('.chat-line[data-sender="'+user.name+'"] .from').text(user.display_name);
        }
    });

    if(bttv.chat.helpers.isIgnored(user.name)) {
        $modCard.find('.mod-card-ignore .svg-ignore').hide();
        $modCard.find('.mod-card-ignore .svg-unignore').show();
    }
    $modCard.find('.mod-card-ignore').click(function() {
        if($modCard.find('.mod-card-ignore .svg-unignore').css('display') !== 'none') {
            bttv.chat.helpers.sendMessage('/unignore '+user.name);
            $modCard.find('.mod-card-ignore .svg-ignore').show();
            $modCard.find('.mod-card-ignore .svg-unignore').hide();
        } else {
            bttv.chat.helpers.sendMessage('/ignore '+user.name);
            $modCard.find('.mod-card-ignore .svg-ignore').hide();
            $modCard.find('.mod-card-ignore .svg-unignore').show();
        }
    });

    if(bttv.chat.helpers.isModerator(user.name)) {
        $modCard.find('.mod-card-mod .svg-add-mod').hide();
        $modCard.find('.mod-card-mod .svg-remove-mod').show();
    }
    $modCard.find('.mod-card-mod').click(function() {
        if($modCard.find('.mod-card-mod .svg-remove-mod').css('display') !== 'none') {
            bttv.chat.helpers.sendMessage('/unmod '+user.name);
            $modCard.find('.mod-card-mod .svg-add-mod').show();
            $modCard.find('.mod-card-mod .svg-remove-mod').hide();
        } else {
            bttv.chat.helpers.sendMessage('/mod '+user.name);
            $modCard.find('.mod-card-mod .svg-add-mod').hide();
            $modCard.find('.mod-card-mod .svg-remove-mod').show();
        }
    });

    Twitch.api.get('users/:login/follows/channels/'+user.name).done(function() {
        $modCard.find('.mod-card-follow').text('Unfollow');
    }).fail(function() {
        $modCard.find('.mod-card-follow').text('Follow');
    });
    $modCard.find('.mod-card-follow').text('Unfollow').click(function() {
        if ($modCard.find('.mod-card-follow').text() === 'Unfollow') {
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
},{}],28:[function(require,module,exports){
var debug = require('../debug'),
    vars = require('../vars');

module.exports = function () {
    if (vars.emotesLoaded) return;

    debug.log("Overriding Twitch Emoticons");

    var generate = function(bttvEmotes) {
        var twitchDefaultEmotes = [
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

        var jtvDefaultEmotes = [
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
                    if(twitchDefaultEmotes.indexOf(image.url.replace("http://","https://")) !== -1 && bttv.settings.get("showDefaultEmotes") !== true) {
                        image.url = jtvDefaultEmotes[twitchDefaultEmotes.indexOf(image.url.replace("http://","https://"))];
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
            bttvEmotes.forEach(function (b) {
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
                if(b.restriction) {
                    if(b.restriction.channels && b.restriction.channels.indexOf(bttv.getChannel()) === -1) return;
                    if(b.restriction.games && b.restriction.games.indexOf(App.Channel.findOne(bttv.getChannel()).get('game')) === -1) return;
                }
                if(b.channel === "Night" && user && userEmoteSets.indexOf('night') !== -1) {
                    a.hidden = false;
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
                        if(c.emoticon_set) {
                          if(!emoticonSets[c.emoticon_set]) emoticonSets[c.emoticon_set] = [];
                          emoticonSets[c.emoticon_set].push(imageObject);
                        } else {
                          emoticonSets['default'].push(imageObject);
                        }
                    }
                });
                emoticons.push(a);
            });
        }
        $("body").on('mouseover', '.chat-line span.emoticon', function() {
            vars.hoveringEmote = $(this);
            $(this).tipsy({
                trigger: 'manual',
                gravity: "se",
                live: false,
                html: true,
                fallback: function() {
                    var $emote = vars.hoveringEmote;
                    if($emote && $emote.data('regex')) {
                        var raw = decodeURIComponent($emote.data('regex'));
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
            $('div.tipsy').remove();
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
    };

    $.getJSON('https://cdn.betterttv.net/emotes/emotes.json').done(function(emotes) {
        generate(emotes);
    }).fail(function() {
        generate([]);
    });
};
},{"../debug":1,"../vars":38}],29:[function(require,module,exports){
var debug = require('../debug');

module.exports = function () {
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
},{"../debug":1}],30:[function(require,module,exports){
module.exports = {
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
},{}],31:[function(require,module,exports){
module.exports = function (data) {
    return {
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
        "jagrawr": { mod: true, tagType: "admin", tagName: "Jag" },
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
        "mmjc": { mod: true, tagType: "admin", tagName: "m&m" },
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
    };
};
},{}],32:[function(require,module,exports){
/** BTTV :
 * cssBlueButtons
 * handleTwitchChatEmotesScript
 */

var chat = bttv.chat, vars = bttv.vars;
var betaChat = require('./features/beta-chat'),
    channelReformat = require('./features/channel-reformat'),
    splitChat = require('./features/split-chat'),
    darkenPage = require('./features/darken-page'),
    handleBackground = require('./features/handle-background'),
    flipDashboard = require('./features/flip-dashboard'),
    cssLoader = require('./features/css-loader');
var displayElement = require('./element').display,
    removeElement = require('./element').remove;

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
        name: 'Blue Buttons',
        description: 'BetterTTV replaces Twitch\'s purple with blue by default',
        default: true,
        storageKey: 'showBlueButtons',
        toggle: function(value) {
            if(value === true) {
                cssLoader.load("blue-buttons", "showBlueButtons");
            } else {
                cssLoader.unload("showBlueButtons");   
            }
        },
        load: function() {
            cssLoader.load("blue-buttons", "showBlueButtons");
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
                    $('div.tipsy').remove();
                });
            } else {
                $('body').unbind("dblclick");
            }
        }
    },
    {
        name: 'Embedded Polling',
        description: 'See polls posted by the broadcaster embedded right into chat',
        default: true,
        storageKey: 'embeddedPolling'
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
        name: 'Hide Group Chat',
        description: 'Hides the group chat bar above chat',
        default: false,
        storageKey: 'groupChatRemoval',
        toggle: function(value) {
            if(value === true) {
                cssLoader.load("hide-group-chat", "groupChatRemoval");
            } else {
                cssLoader.unload("groupChatRemoval");   
            }
        },
        load: function() {
            cssLoader.load("hide-group-chat", "groupChatRemoval");
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
        name: 'Other Messages Alert',
        description: 'BetterTTV can alert you when you receive a message to your "Other" messages folder',
        default: false,
        storageKey: 'alertOtherMessages',
        toggle: function() {
            window.location.reload();
        }
    },
    {
        name: 'Play Sound on Highlight',
        description: 'Get audio feedback when any message is highlighted (BETA)',
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
        name: 'TwitchCast',
        description: 'Watch a Twitch stream via Chromecast (Google Chrome only)',
        default: false,
        storageKey: 'twitchCast',
        toggle: function(value) {
            channelReformat();
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
        storageKey: 'consoleLog'
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
                flipDashboard();
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
},{"./element":2,"./features/beta-chat":4,"./features/channel-reformat":7,"./features/css-loader":16,"./features/darken-page":17,"./features/flip-dashboard":21,"./features/handle-background":24,"./features/split-chat":29}],33:[function(require,module,exports){
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
if ( $("#dash_main").length || /\?bttvDashboard=true/.test(window.location))
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
buf.push("<p><a href=\"#\" class=\"g18_gear-00000080 setBlacklistKeywords\">Set Blacklist Keywords</a></p><p><a href=\"#\" class=\"g18_gear-00000080 setHighlightKeywords\">Set Highlight Keywords</a></p><p><a href=\"#\" class=\"g18_gear-00000080 setScrollbackAmount\">Set Scrollback Amount</a></p><p><a href=\"#\" class=\"g18_trash-00000080 clearChat\">Clear My Chat</a></p><p><a href=\"#\" style=\"display: block;margin-top: 8px;text-align: center;\" class=\"button-simple dark openSettings\">BetterTTV Settings</a></p></div>");}.call(this,"$" in locals_for_with?locals_for_with.$:typeof $!=="undefined"?$:undefined,"window" in locals_for_with?locals_for_with.window:typeof window!=="undefined"?window:undefined,"bttv" in locals_for_with?locals_for_with.bttv:typeof bttv!=="undefined"?bttv:undefined));;return buf.join("");
};module.exports=template;
},{}],34:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (pollId) {
buf.push("<div id=\"bttv-poll-contain\"><div class=\"title\">New poll available! <span style=\"text-decoration: underline;\">Vote now!</span></div><div class=\"close\"><svg height=\"16px\" version=\"1.1\" viewbox=\"0 0 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-close\"><path clip-rule=\"evenodd\" d=\"M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z\" fill-rule=\"evenodd\"></path></svg></div><iframe" + (jade.attr("src", 'http://strawpoll.me/embed_2/' + (pollId) + '', true, false)) + " class=\"frame\"></iframe></div>");}.call(this,"pollId" in locals_for_with?locals_for_with.pollId:typeof pollId!=="undefined"?pollId:undefined));;return buf.join("");
};module.exports=template;
},{}],35:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (require, user, top, left, Twitch, bttv) {
var vars = require('../vars')
buf.push("<div" + (jade.attr("data-user", user.name, true, false)) + (jade.attr("style", "top: " + (top) + "px;left: " + (left) + "px;", true, false)) + " class=\"bttv-mod-card ember-view moderation-card\"><div class=\"close-button\"><svg height=\"16px\" version=\"1.1\" viewbox=\"0 0 16 16\" width=\"16px\" x=\"0px\" y=\"0px\" class=\"svg-close\"><path clip-rule=\"evenodd\" d=\"M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z\" fill-rule=\"evenodd\"></path></svg></div><div" + (jade.attr("style", "background-color: " + (user.profile_banner_background_color?user.profile_banner_background_color:'#000') + "", true, false)) + " class=\"card-header\"><img" + (jade.attr("src", user.logo?user.logo:'https://www-cdn.jtvnw.net/images/xarth/404_user_300x300.png', true, false)) + " class=\"channel_logo\"/><div class=\"drag-handle\"></div><h3 class=\"name\"><a" + (jade.attr("href", Twitch.url.profile(user.name), true, false)) + " target=\"_blank\">" + (jade.escape(null == (jade_interp = bttv.storage.getObject("nicknames")[user.name.toLowerCase()] || user.display_name) ? "" : jade_interp)) + "</a><svg style=\"margin-left: 5px;\" height=\"10px\" width=\"10px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-edit mod-card-edit\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M6.414,12.414L3.586,9.586l8-8l2.828,2.828L6.414,12.414z M4.829,14H2l0,0v-2.828l0.586-0.586l2.828,2.828L4.829,14z\"></path></svg></h3>");
if ( bttv.storage.getObject("nicknames")[user.name.toLowerCase()])
{
buf.push("<h4 class=\"real-name\">" + (jade.escape(null == (jade_interp = user.display_name) ? "" : jade_interp)) + "</h4>");
}
buf.push("<div class=\"channel_background_cover\"></div>");
if ( user.profile_banner)
{
buf.push("<img" + (jade.attr("src", user.profile_banner, true, false)) + " class=\"channel_background\"/>");
}
buf.push("</div>");
if ( user.name != vars.userData.login)
{
buf.push("<div class=\"interface\"><button class=\"button-simple primary mod-card-follow\">Follow</button><button style=\"height: 30px;vertical-align: top;\" title=\"View user's profile\" class=\"button-simple dark mod-card-profile\"><img src=\"https://www-cdn.jtvnw.net/images/xarth/g/g18_person-00000080.png\" style=\"margin-top: 6px;\"/></button><button style=\"height: 30px;vertical-align: top;\" title=\"Send user a message\" class=\"button-simple dark mod-card-message\"><img src=\"https://www-cdn.jtvnw.net/images/xarth/g/g18_mail-00000080.png\" style=\"margin-top: 6px;\"/></button><button title=\"Add/Remove user from ignores\" class=\"button-simple dark mod-card-ignore\"><svg height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-ignore\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M13,11.341V16l-3.722-3.102C8.863,12.959,8.438,13,8,13c-3.866,0-7-2.462-7-5.5C1,4.462,4.134,2,8,2s7,2.462,7,5.5C15,8.996,14.234,10.35,13,11.341z M11,7H5v1h6V7z\"></path></svg><svg style=\"display: none;\" height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-unignore\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M13,11.341V16l-3.722-3.102C8.863,12.959,8.438,13,8,13c-3.866,0-7-2.462-7-5.5C1,4.462,4.134,2,8,2s7,2.462,7,5.5C15,8.996,14.234,10.35,13,11.341z\"></path></svg></button>");
if ( vars.userData.isLoggedIn && bttv.chat.helpers.isOwner(vars.userData.login))
{
buf.push("<button title=\"Add/Remove this user as a moderator\" class=\"button-simple dark mod-card-mod\"><svg height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-add-mod\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M15,7L1,16l4.666-7H1l14-9l-4.667,7H15z\"></path></svg><svg style=\"display: none;\" height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-remove-mod\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M 1.7692223,7.3226542 14.725057,7.3226542 14.725057,8.199533 1.7692223,8.199533 z M 15,0 5.4375,6.15625 10.90625,6.15625 15,0 z M 5.375,9.40625 1,16 11.25,9.40625 5.375,9.40625 z\"></path></svg></button>");
}
if ( vars.userData.isLoggedIn && bttv.chat.helpers.isModerator(vars.userData.login) && (!bttv.chat.helpers.isModerator(user.name) || vars.userData.login === bttv.getChannel()))
{
buf.push("<span class=\"mod-controls\"><button title=\"!permit this user\" class=\"permit button-simple light\"><svg height=\"16px\" width=\"16px\" version=\"1.1\" viewBox=\"0 0 16 16\" x=\"0px\" y=\"0px\" class=\"svg-permit\"><path clip-rule=\"evenodd\" fill-rule=\"evenodd\" d=\"M 13.71875,3.75 A 0.750075,0.750075 0 0 0 13.28125,4 L 5.71875,11.90625 3.59375,9.71875 A 0.750075,0.750075 0 1 0 2.53125,10.75 L 5.21875,13.53125 A 0.750075,0.750075 0 0 0 6.28125,13.5 L 14.34375,5.03125 A 0.750075,0.750075 0 0 0 13.71875,3.75 z M 4.15625,5.15625 C 2.1392444,5.1709094 0.53125,6.2956115 0.53125,7.6875 0.53125,8.1957367 0.75176764,8.6679042 1.125,9.0625 A 1.60016,1.60016 0 0 1 2.15625,8.25 C 2.0893446,8.0866555 2.0625,7.9078494 2.0625,7.71875 2.0625,6.9200694 2.7013192,6.25 3.5,6.25 L 7.15625,6.25 C 7.1438569,5.1585201 6.6779611,5.1379224 4.15625,5.15625 z M 9.625,5.15625 C 8.4334232,5.1999706 8.165545,5.4313901 8.15625,6.25 L 9.96875,6.25 11.03125,5.15625 C 10.471525,5.1447549 9.9897684,5.1428661 9.625,5.15625 z M 14.28125,6.40625 13.3125,7.40625 C 13.336036,7.5094042 13.34375,7.6089314 13.34375,7.71875 13.34375,8.5174307 12.67368,9.125 11.875,9.125 L 11.65625,9.125 10.65625,10.1875 C 10.841425,10.189327 10.941084,10.186143 11.15625,10.1875 13.17327,10.200222 14.78125,9.0793881 14.78125,7.6875 14.78125,7.2160918 14.606145,6.7775069 14.28125,6.40625 z M 4.40625,7.1875 C 4.0977434,7.1875 3.84375,7.4414933 3.84375,7.75 3.84375,8.0585065 4.0977434,8.3125 4.40625,8.3125 L 8,8.3125 9.0625,7.1875 4.40625,7.1875 z M 4.125,9.125 5.15625,10.1875 C 5.5748133,10.180859 5.9978157,10.155426 6.25,10.125 L 7.15625,9.1875 C 7.1572971,9.1653754 7.1553832,9.1481254 7.15625,9.125 L 4.125,9.125 z\"></path></svg></button></span><br/><span class=\"mod-controls\"><button style=\"width:44px;\" data-time=\"1\" title=\"Clear this user's chat\" class=\"timeout button-simple light\">Purge</button><button data-time=\"600\" title=\"Temporary 10 minute ban\" class=\"timeout button-simple light\"><img src=\"/images/xarth/g/g18_timeout-00000080.png\"/></button><button style=\"width:30px;\" data-time=\"3600\" title=\"Temporary 1 hour ban\" class=\"timeout button-simple light\">1hr</button><button style=\"width:30px;\" data-time=\"28800\" title=\"Temporary 8 hour ban\" class=\"timeout button-simple light\">8hr</button><button style=\"width:38px;\" data-time=\"86400\" title=\"Temporary 24 hour ban\" class=\"timeout button-simple light\">24hr</button><button title=\"Permanent Ban\" class=\"ban button-simple light\"><img src=\"/images/xarth/g/g18_ban-00000080.png\"/></button></span>");
}
buf.push("</div>");
}
buf.push("</div>");}.call(this,"require" in locals_for_with?locals_for_with.require:typeof require!=="undefined"?require:undefined,"user" in locals_for_with?locals_for_with.user:typeof user!=="undefined"?user:undefined,"top" in locals_for_with?locals_for_with.top:typeof top!=="undefined"?top:undefined,"left" in locals_for_with?locals_for_with.left:typeof left!=="undefined"?left:undefined,"Twitch" in locals_for_with?locals_for_with.Twitch:typeof Twitch!=="undefined"?Twitch:undefined,"bttv" in locals_for_with?locals_for_with.bttv:typeof bttv!=="undefined"?bttv:undefined));;return buf.join("");
};module.exports=template;
},{"../vars":38}],36:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (storageKey, name, description) {
buf.push("<div" + (jade.cls(['option',"bttvOption-" + (storageKey) + ""], [null,true])) + "><span style=\"font-weight:bold;font-size:14px;color:#D3D3D3;\">" + (jade.escape(null == (jade_interp = name) ? "" : jade_interp)) + "</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;" + (jade.escape(null == (jade_interp = description) ? "" : jade_interp)) + "<div class=\"switch\"><input type=\"radio\"" + (jade.attr("name", storageKey, true, false)) + " value=\"false\"" + (jade.attr("id", "" + (storageKey) + "False", true, false)) + " class=\"switch-input switch-off\"/><label" + (jade.attr("for", "" + (storageKey) + "False", true, false)) + " class=\"switch-label switch-label-off\">Off</label><input type=\"radio\"" + (jade.attr("name", storageKey, true, false)) + " value=\"true\"" + (jade.attr("id", "" + (storageKey) + "True", true, false)) + " class=\"switch-input\"/><label" + (jade.attr("for", "" + (storageKey) + "True", true, false)) + " class=\"switch-label switch-label-on\">On</label><span class=\"switch-selection\"></span></div></div>");}.call(this,"storageKey" in locals_for_with?locals_for_with.storageKey:typeof storageKey!=="undefined"?storageKey:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"description" in locals_for_with?locals_for_with.description:typeof description!=="undefined"?description:undefined));;return buf.join("");
};module.exports=template;
},{}],37:[function(require,module,exports){
function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (bttv) {
buf.push("<div id=\"header\"><span id=\"logo\"><img height=\"45px\" src=\"//cdn.betterttv.net/style/logos/settings_logo.png\"/></span><ul class=\"nav\"><li><a href=\"#bttvAbout\">About</a></li><li class=\"active\"><a href=\"#bttvSettings\">Settings</a></li><li><a href=\"#bttvChangelog\">Changelog</a></li><li><a href=\"#bttvPrivacy\">Privacy Policy</a></li><li><a href=\"#bttvBackup\">Backup/Import</a></li></ul><span id=\"close\">&times;</span></div><div id=\"bttvSettings\" style=\"height:425px;\" class=\"scroll scroll-dark\"><div class=\"tse-content options-list\"><h2 class=\"option\">Here you can manage the various BetterTTV options. Click On or Off to toggle settings.</h2></div></div><div id=\"bttvAbout\" style=\"display:none;\"><div class=\"aboutHalf\"><img src=\"//cdn.betterttv.net/style/logos/mascot.png\" class=\"bttvAboutIcon\"/><h1>BetterTTV v " + (jade.escape((jade_interp = bttv.info.versionString()) == null ? '' : jade_interp)) + "</h1><h2>from your friends at <a href=\"https://www.nightdev.com\" target=\"_blank\">NightDev</a></h2><br/></div><div class=\"aboutHalf\"><h1 style=\"margin-top: 100px;\">Think this addon is awesome?</h1><br/><br/><h2><a target=\"_blank\" href=\"https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped\">Drop a Review on the Chrome Webstore</a></h2><br/><h2>or maybe</h2><br/><h2><a target=\"_blank\" href=\"https://streamtip.com/t/night\">Support the Developer</a></h2><br/></div></div><div id=\"bttvPrivacy\" style=\"display:none;height:425px;\" class=\"scroll scroll-dark\"><div class=\"tse-content\"></div></div><div id=\"bttvChangelog\" style=\"display:none;height:425px;\" class=\"scroll scroll-dark\"><div class=\"tse-content\"></div></div><div id=\"bttvBackup\" style=\"display:none;height:425px;padding:25px;\"><h1 style=\"padding-bottom:15px;\">Backup Settings</h1><button id=\"bttvBackupButton\" class=\"primary_button\"><span>Download</span></button><h1 style=\"padding-top:25px;padding-bottom:15px;\">Import Settings</h1><input id=\"bttvImportInput\" type=\"file\" style=\"height: 25px;width: 250px;\"/></div><div id=\"footer\"><span>BetterTTV &copy; <a href=\"https://www.nightdev.com\" target=\"_blank\">NightDev</a> 2014</span><span style=\"float:right;\"><a href=\"https://community.nightdev.com/c/betterttv\" target=\"_blank\">Get Support</a> | <a href=\"https://github.com/night/BetterTTV/issues/new?labels=bug\" target=\"_blank\">Report a Bug</a> | <a href=\"https://streamtip.com/t/night\" target=\"_blank\">Support the Developer</a></span></div>");}.call(this,"bttv" in locals_for_with?locals_for_with.bttv:typeof bttv!=="undefined"?bttv:undefined));;return buf.join("");
};module.exports=template;
},{}],38:[function(require,module,exports){
module.exports = {
    userData: {
        isLoggedIn: window.Twitch ? Twitch.user.isLoggedIn() : false,
        login: window.Twitch ? Twitch.user.login() : ''
    },
    settings: {},
    liveChannels: [],
    blackChat: false
};
},{}]},{},[3])}(window.BetterTTV = window.BetterTTV || {}));