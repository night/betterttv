import $ from 'jquery';
import {save} from 'save-file';
import dayjs from 'dayjs';
import cdn from '../../utils/cdn.js';
import debug from '../../utils/debug.js';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import storage from '../../storage.js';
import html from '../../utils/html.js';
import api from '../../utils/api.js';
import domObserver from '../../observers/dom.js';

const getSettingElement = ({id}) => $(`.bttvOption-${html.escape(id)}`);

const settingTemplate = ({id, name, description}) => `
    <div id="option" class="option bttvOption-${html.escape(id)}">
        <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">${html.escape(name)}</span>
        <span class="description"> — ${html.escape(description)}</span>
        <div class="bttv-switch">
            <input class="bttv-switch-input bttv-switch-off" type="radio" name=${html.escape(
              id
            )} value="false" id="${html.escape(id)}False" />
            <label class="bttv-switch-label bttv-switch-label-off" for="${html.escape(id)}False">Off</label>
            <input class="bttv-switch-input" type="radio" name=${html.escape(id)} value="true" id="${html.escape(
  id
)}True" />
            <label class="bttv-switch-label bttv-switch-label-on" for="${html.escape(id)}True">On</label>
            <span class="bttv-switch-selection"></span>
        </div>
    </option>
`;

const settingsPanelTemplate = () => `
    <div id="header">
        <span id="logo"><img height="45px" src="${cdn.url('assets/logos/settings_logo.png')}" /></span>
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
    <div id="bttvSettings" class="options-list">
        <input type="text" placeholder="Search settings" id="bttvSettingsSearch" class="option">
    </div>
    <div id="bttvAbout" style="display:none;">
        <div class="aboutHalf">
            <img class="bttvAboutIcon" src="${cdn.url('assets/logos/mascot.png')}" />
            <h1>BetterTTV v${debug.version}</h1>
            <h2>from your friends at <a href="https://nightdev.com" target="_blank">NightDev</a></h2>
            <br>
        </div>
        <div class="aboutHalf">
            <h1 style="margin-top: 100px;">Think this addon is awesome?</h1>
            <br>
            <br>
            <h2>
                Drop a Review on the <a target="_blank" href="https://chrome.google.com/webstore/detail/betterttv/ajopnjidmegmdimjlfnijceegpefgped">Chrome Webstore</a> or <a target="_blank" href="https://addons.mozilla.org/firefox/addon/betterttv/">Firefox Add-ons site</a>
            </h2>
            <br>
            <h2>or maybe even</h2>
            <br>
            <h2><a target="_blank" href="https://betterttv.com/dashboard/pro">Subscribe to BetterTTV Pro</a></h2>
            <br>
        </div>
    </div>
    <div id="bttvChannel" style="display:none;">
        <iframe frameborder="0" width="100%" height="425"></iframe>
    </div>
    <div id="bttvPrivacy" style="display:none;">
    </div>
    <div id="bttvChangelog" style="display:none;">
        <h1>Changelog</h1><div class="bttv-changelog-releases"></div>
    </div>
    <div id="bttvBackup" style="display:none;">
        <h4 style="padding-bottom:10px;">Backup Settings</h4>
        <button id="bttvBackupButton" class="button primary"><span>Download</span></button>
        <h4 style="padding-top:15px;padding-bottom:10px;">Import Settings</h4>
        <input id="bttvImportInput" type="file" style="height: 25px;width: 250px;" />
    </div>
    <div id="footer">
        <span>BetterTTV &copy; <a href="https://www.nightdev.com" target="_blank">NightDev, LLC</a> ${new Date().getFullYear()}</span>
        <span style="float:right;">
            <a href="https://twitter.com/betterttv" target="_blank">Twitter</a> | 
            <a href="https://community.nightdev.com/c/betterttv" target="_blank">Forums</a> | 
            <a href="https://github.com/night/BetterTTV/issues" target="_blank">Bug Report</a> | 
            <a href="https://discord.gg/nightdev" target="_blank">Discord</a>
        </span>
    </div>
`;

const changelogEntryTemplate = (version, publishedAt, body) => `
    <h2>Version ${html.escape(version)} (${dayjs(publishedAt).format('MMM D, YYYY')})</h2>
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
  const beforeIndex = sortedSettings.findIndex((s) => s.id === setting.id) - 1;

  const template = settingTemplate(setting);
  if (beforeIndex === -1) {
    $('#bttvSettings.options-list input#bttvSettingsSearch').after(template);
  } else {
    getSettingElement(sortedSettings[beforeIndex]).after(template);
  }

  $(settings.get(setting.id) ? `#${setting.id}True` : `#${setting.id}False`).prop('checked', true);
}

class SettingsModule {
  constructor() {
    watcher.on('load', () => {
      this.renderSettings();
    });

    domObserver.on('a[data-test-selector="user-menu-dropdown__settings-link"]', () => {
      this.renderSettingsMenuOption();
    });
  }

  renderSettings() {
    if ($('#bttvSettings').length) return;

    const panel = document.createElement('div');
    panel.setAttribute('id', 'bttvSettingsPanel');
    panel.style.display = 'none';
    panel.innerHTML = settingsPanelTemplate();
    $('body').append(panel);

    cdn.get('privacy.html').then((data) => $('#bttvPrivacy').html(data));

    api
      .get('cached/changelog')
      .then((changelog) =>
        changelog.map(({version, publishedAt, body}) => changelogEntryTemplate(version, publishedAt, body))
      )
      .then((releases) => $('#bttvChangelog .bttv-changelog-releases').html(releases.join('')));

    $('#bttvSettings').on('change', '.option input:radio', ({target}) =>
      settings.set(target.name, target.value === 'true')
    );
    $('#bttvBackupButton').click(() => this.backup());
    $('#bttvImportInput').change(({target}) => this.import(target));
    $('#bttvSettingsSearch').on('input', () => this.doSearch());

    $('#bttvSettingsPanel #close').click(() => $('#bttvSettingsPanel').hide('slow'));
    $('#bttvSettingsPanel .nav a').click((e) => {
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

      $(tabId).fadeIn();
      $tab.parent('li').addClass('active');
    });

    settings.getSettings().forEach((setting) => addSetting(setting));
  }

  renderSettingsMenuOption() {
    if ($('.bttvSettingsIconDropDown').length) return;

    $('a[data-a-target="settings-dropdown-link"]').parent('div.tw-full-width.tw-relative').after(`
            <div class="bttv-settings-container">
                <a title="BetterTTV Settings" class="bttv-settings-header tw-interactable--default tw-interactable--hover-enabled tw-interactable tw-interactive bttvSettingsDropDown" href="#">
                    <div class="bttv-settings-items">
                        <div class="bttv-settings-items-div">
                            <div class="bttv-settings-items-div-div tw-drop-down-menu-item-figure">
                                <div class="bttvSettingsIconContainer tw-icon">
                                    <div class="tw-aspect tw-aspect--align-top">
                                        <div class="tw-aspect__spacer"></div>
                                        <figure class="icon bttvSettingsIconDropDown"></figure>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bttv-settings-text">BetterTTV Settings</div>
                    </div>
                </a>
            </div>
        `);

    $('.bttvSettingsIconDropDown').closest('a').click(this.openSettings);
  }

  openSettings(e) {
    e.preventDefault();
    $('#bttvSettingsPanel').show('slow');
  }

  updateSettingToggle(settingId, value) {
    $(`#${settingId}True`).prop('checked', value === true);
    $(`#${settingId}False`).prop('checked', value === false);
  }

  backup() {
    const rv = storage.getStorage();
    save(JSON.stringify(rv), 'bttv_settings.backup');
  }

  import(target) {
    getDataURLFromUpload(target, (data) => {
      if (!isJSON(data)) return;

      const settingsToImport = JSON.parse(data);
      Object.keys(settingsToImport).forEach((s) => settings.set(s.split('bttv_')[1], settingsToImport[s]));

      setTimeout(() => window.location.reload(), 1000);
    });
  }

  doSearch() {
    const val = $('#bttvSettingsSearch').val().trim().toLowerCase();
    if (val === '') {
      $('[class^="option bttvOption-"]').css('display', 'block');
      return;
    }
    settings.getSettings().forEach((setting) => {
      const shouldShow = setting.name.toLowerCase().includes(val) || setting.description.toLowerCase().includes(val);
      $(`.bttvOption-${setting.id}`).css('display', shouldShow ? 'block' : 'none');
    });
  }
}

export default new SettingsModule();
