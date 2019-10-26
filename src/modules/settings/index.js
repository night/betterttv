const $ = require('jquery');
const cdn = require('../../utils/cdn');
const debug = require('../../utils/debug');
const saveAs = require('../../utils/filesaver').saveAs;
const watcher = require('../../watcher');
const settings = require('../../settings');
const storage = require('../../storage');
const html = require('../../utils/html');
const api = require('../../utils/api');
const moment = require('moment');

const getSettingElement = ({id}) => $(`.bttvOption-${html.escape(id)}`);

const settingTemplate = ({id, name, description}) => `
    <div class="option bttvOption-${html.escape(id)}">

        <label class="bttvSwitch" for="bttvSwitchInput-${html.escape(id)}">
            <input type="checkbox" id="bttvSwitchInput-${html.escape(id)}" name="${html.escape(id)}" />
            <div class="bttvSwitchSlider"></div>
        </label>

        <div class="bttvSettingText">
            <h2 class="bttvSettingName">${html.escape(name)}</h2>
            <p class="bttvSettingDescription">${html.escape(description)}</p>
        </div
        
    </div>
`;

const settingsPanelTemplate = () => `
    <div id="header">
    <span id="logo">
        <img height="45px" src="${cdn.url('assets/logos/settings_logo.png')}" />
        <h2><span>Better</span>TTV</h2>
    </span>
        <ul class="nav">
            <li><a href="#bttvAbout">About</a></li>
            <li class="active"><a href="#bttvSettings">Settings</a></li>
            <li><a href="#bttvChannel">Channel</a></li>
            <li><a href="#bttvChangelog">Changelog</a></li>
            <li><a href="#bttvPrivacy">Privacy Policy</a></li>
            <li><a href="#bttvBackup">Backup/Import</a></li>
        </ul>
        <span id="close">&times;</span>
    </div>

    <div id="bttvSettingsPanelContent">
        
        <div id="bttvSettings">
            <input type="text" placeholder="Search" id="bttvSettingsSearch">
            <div id="bttvSettingsContainer">
                <div id="bttvSettingsContent" class="options-list"></div>
            </div>

        </div>
        
        <div id="bttvAbout" style="display:none;">

            <div class="aboutHalf aboutHalf-smaller">
                <img class="bttvAboutIcon" src="${cdn.url('assets/logos/mascot.png')}" />
                <h1>BetterTTV v${debug.version}</h1>
                <h3>from your friends at <a href="https://www.nightdev.com" target="_blank">NightDev</a></h3>
            </div>

            <div class="aboutHalf">
                <h2>Think this addon is awesome?</h2>
                <br/>
                <h3>
                    <strong>Drop a Review on the </strong>
                    <a target="_blank" href="https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped">Chrome Webstore</a>
                </h3>
                <p>or maybe</p>
                <h3><strong>Subscribe to </strong><a target="_blank" href="https://manage.betterttv.net/channel">BetterTTV Pro</a></h3> 
            </div>

        </div>
        
        <div id="bttvChannel" style="display:none;">
            <iframe frameborder="0" width="100%" height="100%"></iframe>
        </div>
        
        <div id="bttvPrivacy" style="display:none;"></div>
        
        <div id="bttvChangelog" style="display:none;">
            <h1>Changelog</h1><div class="bttv-changelog-releases"></div>
        </div>

        <div id="bttvBackup" style="display:none;">
            <button id="bttvBackupButton" class="button primary aboutHalf">
                <svg class="tw-icon__svg" width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><g><path d="M4 16V4H2v12h2zM13 15l-1.5-1.5L14 11H6V9h8l-2.5-2.5L13 5l5 5-5 5z"></path></g></svg>
                <h2>Backup Settings</h2>
            </button>

            <input id="bttvImportInput" type="file" />
            <label class="aboutHalf" for="bttvImportInput"><svg class="tw-icon__svg" width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><g><path d="M4 16V4H2v12h2zM13 15l-1.5-1.5L14 11H6V9h8l-2.5-2.5L13 5l5 5-5 5z"></path></g></svg><h2>Import Settings</h2></label> 
        </div>

    </div> 

    <div id="footer">
        <span>BetterTTV &copy; <a href="https://www.nightdev.com" target="_blank">NightDev, LLC</a> ${new Date().getFullYear()}</span>
        <span style="float:right;">
            <a href="https://twitter.com/betterttv" target="_blank">Twitter</a> | 
            <a href="https://community.nightdev.com/c/betterttv" target="_blank">Forums</a> | 
            <a href="https://github.com/night/BetterTTV/issues/new?labels=bug" target="_blank">Bug Report</a> | 
            <a href="https://discord.gg/nightdev" target="_blank">Discord</a>
        </span>
    </div>
`;

const changelogEntryTemplate = (version, publishedAt, body) => `
    <h2>Version ${html.escape(version)} (${moment(publishedAt).format('MMM D, YYYY')})</h2>
    <p>${html
        .escape(body)
        .replace(/\r\n/g, '<br />')
        .replace(/ #([0-9]+)/g, ' <a href="https://github.com/night/BetterTTV/issues/$1" target="_blank">#$1</a>')}</p>
`;

function getDataURLFromUpload(input, callback) {
    const reader = new FileReader();
    reader.onload = ({target}) => callback(target.result);
    const file = input.files[0];
    if (!file) {
        callback(null);
        return;
    }
    reader.readAsText(file);
}

function isJSON(string) {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
}

const renderedSettings = {};

function addSetting(setting) {
    if (renderedSettings[setting.id]) return;
    renderedSettings[setting.id] = setting;

    const sortedSettings = Object.values(renderedSettings);
    sortedSettings.sort((a, b) => a.name.localeCompare(b.name));
    const beforeIndex = sortedSettings.findIndex(s => s.id === setting.id) - 1;

    const template = settingTemplate(setting);
    if (beforeIndex === -1) {
        $('#bttvSettingsContent').append(template);
    } else {
        getSettingElement(sortedSettings[beforeIndex]).after(template);
    }

    $(`#bttvSwitchInput-${setting.id}`).prop('checked', settings.get(setting.id) ? true : false);
}

class SettingsModule {
    constructor() {
        watcher.on('load', () => {
            this.renderSettings();
            this.renderSettingsMenuOption();
        });

        this.renderSettingsMenuOption = this.renderSettingsMenuOption.bind(this);
    }

    renderSettings() {
        if ($('#bttvSettings').length) return;

        const panel = document.createElement('div');
        panel.setAttribute('id', 'bttvSettingsPanel');
        panel.style.display = 'none';
        panel.innerHTML = settingsPanelTemplate();
        $('body').append(panel);

        cdn.get('privacy.html').then(data => $('#bttvPrivacy').html(data));

        api.get('cached/changelog')
            .then(changelog => changelog.map(({version, publishedAt, body}) => changelogEntryTemplate(version, publishedAt, body)))
            .then(releases => $('#bttvChangelog .bttv-changelog-releases').html(releases.join('')));

        $('#bttvSettings').on('change', '.option input:checkbox', ({target}) => settings.set(target.name, target.checked === true));
        $('#bttvBackupButton').click(() => this.backup());
        $('#bttvImportInput').change(({target}) => this.import(target));
        $('#bttvSettingsSearch').on('input', () => this.doSearch());

        $('#bttvSettingsPanel #close').click(() => $('#bttvSettingsPanel').hide('fast'));
        $('#bttvSettingsPanel .nav a').click(e => {
            e.preventDefault();
            const $tab = $(e.target);
            const tabId = $tab.attr('href');

            $('#bttvSettingsPanel .nav a').each((index, el) => {
                const $el = $(el);
                const currentTabId = $el.attr('href');
                $(currentTabId).hide();
                $el.parent('li').removeClass('active');
            });

            if (tabId === '#bttvChannel') {
                $(tabId).children('iframe').attr('src', 'https://manage.betterttv.net/channel');
            }

            if (tabId === '#bttvChannel' || tabId === '#bttvChangelog' || tabId === '#bttvPrivacy') {
                $(tabId).parent().css('background', '#181818');
            } else {
                $(tabId).parent().css('background', 'none');
            }

            $(tabId).fadeIn();
            $tab.parent('li').addClass('active');
        });

        settings.getSettings().forEach(setting => addSetting(setting));
    }

    renderSettingsMenuOption() {
        if ($('.bttvSettingsIconDropDown').length) return;

        // twitch lazy-loads this menu now, so we must retrigger paint on click
        $('button[data-test-selector="user-menu__toggle"]').off('click', this.renderSettingsMenuOption).on('click', this.renderSettingsMenuOption);

        $('a[data-a-target="settings-dropdown-link"]').parent('div.tw-full-width.tw-relative').after(`
            <div class="tw-full-width tw-relative">
                <a title="BetterTTV Settings" class="tw-block tw-border-radius-medium tw-full-width tw-interactable--alpha tw-interactable--hover-enabled tw-interactable tw-interactive bttvSettingsDropDown" href="#">
                    <div class="tw-align-items-center tw-flex tw-pd-05 tw-relative">
                        <div class="tw-align-items-center tw-flex tw-pd-r-05">
                            <div class="tw-align-items-center tw-drop-down-menu-item-figure tw-flex">
                                <div class="tw-align-items-center tw-icon tw-inline-flex">
                                    <div class="tw-aspect tw-aspect--align-top">
                                        <div class="tw-aspect__spacer" style="padding-bottom: 100%;"></div>
                                        <figure class="icon bttvSettingsIconDropDown"></figure>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tw-flex-grow-1">BetterTTV Settings</div>
                    </div>
                </a>
            </div>
        `);

        $('.bttvSettingsIconDropDown').closest('a').click(this.openSettings);
    }

    openSettings(e) {
        e.preventDefault();
        $('#bttvSettingsPanel').show('fast');
    }

    backup() {
        let rv = storage.getStorage();

        rv = new Blob([JSON.stringify(rv)], {
            type: 'text/plain;charset=utf-8;'
        });

        saveAs(rv, 'bttv_settings.backup');
    }

    import(target) {
        getDataURLFromUpload(target, data => {
            if (!isJSON(data)) return;

            const settingsToImport = JSON.parse(data);
            Object.keys(settingsToImport).forEach(s => settings.set(s.split('bttv_')[1], settingsToImport[s]));

            setTimeout(() => window.location.reload(), 1000);
        });
    }

    doSearch() {
        const val = $('#bttvSettingsSearch').val().trim().toLowerCase();
        if (val === '') {
            $('[class^="option bttvOption-"]').css('display', 'flex');
            return;
        }
        settings.getSettings().forEach(setting => {
            const shouldShow = setting.name.toLowerCase().includes(val) || setting.description.toLowerCase().includes(val);
            $(`.bttvOption-${setting.id}`).css('display', shouldShow ? 'flex' : 'none');
        });
    }
}

module.exports = new SettingsModule();
