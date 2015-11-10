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
