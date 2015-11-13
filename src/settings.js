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
            if (data[0] === 'bttv_setting') {
                if (e.origin !== window.location.protocol + '//' + window.location.host) return;
                var key = data[1],
                    value = _self._parseSetting(data[2]);

                _self.set(key, value);
            } else if (data[0] === 'bttv_is_login_dark') {
                if (bttv.settings.get('darkenedMode') !== true) return;
                e.source.postMessage('bttv_login_dark', e.origin);
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
