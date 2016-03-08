function SettingsImport() {
    this.transfer(this.getSettings());
    window.close();
}

SettingsImport.prototype.getSettings = function() {
    var settings = [];

    Object.keys(localStorage).forEach(function(key) {
        if(!/^bttv_/.test(key) && key !== 'nicknames') return;
        settings.push({ name: key, value: localStorage.getItem(key) });
    });

    return settings;
};

SettingsImport.prototype.transfer = function(settings) {
    settings.forEach(function(setting) {
        window.opener.postMessage('bttv_transfer ' + setting.name + ' ' + setting.value, 'https://' + window.location.host);
    });

    window.opener.postMessage('bttv_end_transfer', 'https://' + window.location.host);
};

new SettingsImport();