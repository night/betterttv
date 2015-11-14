var EventEmitter = require('events').EventEmitter;

function inPopup() {
    try {
        return !!window.opener;
    } catch (e) {
        return true;
    }
}

function MassUnbanPopup() {
    if (inPopup() && /\?bttvMassUnban=true/.test(window.location)) {
        return this.sender();
    }

    this.events = new EventEmitter();
    this._popupWindow = null;
}

MassUnbanPopup.prototype._receivedMessage = function(e) {
    if (!e.data || typeof e.data !== 'string') return;

    var data = e.data.split(' ');

    if (data[0] !== 'bttv_massunban_users') return;

    data.shift();

    this.events.emit('bannedUsers', data);
};

MassUnbanPopup.prototype.sender = function() {
    var $chatterList = $('#banned_chatter_list');

    if (!$chatterList.length) return;

    $terribleNotice = $('<div/>');
    $terribleNotice.html('<h1>Mass Unban Running..</h1><br><br>Hi. Due to recent Twitch changes we now have a really terrible way of mass unbanning users. Leave this window open and it will refresh on its own until it closes on its own when the mass unban is finished.');
    $terribleNotice.attr('style', 'background-color: #fff;z-index:90001;padding-left:10px;padding-right:10px;position:absolute;top:0px;bottom:0px;left:0px;right:0px;');
    $('body').append($terribleNotice);

    var receivedMessage = function(e) {
        if (!e.data || typeof e.data !== 'string') return;

        if (e.data.split(' ')[0] !== 'bttv_massunban_reload') return;

        window.location.reload(true);
    };

    window.addEventListener('message', receivedMessage, false);

    var users = [];

    $chatterList.find('.ban .obj').each(function() {
        var user = $(this).text().trim();
        if (users.indexOf(user) === -1) users.push(user);
    });

    var userCount = users.length;

    users.unshift('bttv_massunban_users');

    window.opener.postMessage(users.join(' '), 'http://www.twitch.tv');

    if (userCount === 0) window.close();
};

MassUnbanPopup.prototype.receiver = function() {
    var width = 480;
    var height = 600;
    var left = ($(window).width() / 2) - (width / 2);
    var top = ($(window).height() / 2) - (height / 2);

    var windowOptions = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',location=0,menubar=0,scrollbars=1,status=0,toolbar=0,resizable=1';

    this._popupWindow = window.open('https://secure.twitch.tv/settings/channel?bttvMassUnban=true', '_blank', windowOptions);

    // Detect when popup is closed
    var _self = this;
    var checkClosed = setInterval(function() {
        if (!_self._popupWindow || !_self._popupWindow.closed) return;
        _self.done();
        clearInterval(checkClosed);
    }, 1000);

    window.addEventListener('message', this._receivedMessage.bind(this), false);
};

MassUnbanPopup.prototype.getNextBatch = function(callback) {
    this.events.once('bannedUsers', function(users) {
        callback(users);
    });

    if (!this._popupWindow) {
        this.receiver();
    } else {
        this._popupWindow.postMessage('bttv_massunban_reload', 'https://secure.twitch.tv');
    }
};

MassUnbanPopup.prototype.done = function() {
    window.removeEventListener('message', this._receivedMessage.bind(this), false);

    // Try to close window if not already
    try {
        this._popupWindow.close();
    } catch (e) {}

    this._popupWindow = null;
};

module.exports = MassUnbanPopup;
