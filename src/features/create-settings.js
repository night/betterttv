var debug = require('../helpers/debug'),
    vars = require('../vars'),
    removeElement = require('../helpers/element').remove;
var darkenPage = require('./darken-page'),
    splitChat = require('./split-chat'),
    settingsPanelTemplate = require('../templates/settings-panel');

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