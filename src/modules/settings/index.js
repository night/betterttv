import $ from 'jquery';
import {save} from 'save-file';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import cdn from '../../utils/cdn.js';
import debug from '../../utils/debug.js';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import storage from '../../storage.js';
import html from '../../utils/html.js';
import api from '../../utils/api.js';
import domObserver from '../../observers/dom.js';
import App from './App.js';

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
    $('body').append(panel);

    ReactDOM.render(<App />, document.getElementById('bttvSettingsPanel'));
  }

  renderSettingsMenuOption() {
    if ($('.bttvSettingsIconDropDown').length) return;

    $('a[data-a-target="settings-dropdown-link"]').parent('div.tw-full-width.tw-relative').after(`
            <div class="tw-full-width tw-relative">
                <a title="BetterTTV Settings" class="tw-block tw-border-radius-medium tw-full-width tw-interactable--default tw-interactable--hover-enabled tw-interactable tw-interactive bttvSettingsDropDown" href="#">
                    <div class="tw-align-items-center tw-flex tw-pd-05 tw-relative">
                        <div class="tw-align-items-center tw-flex tw-flex-shrink-0 tw-pd-r-05">
                            <div class="tw-align-items-center tw-drop-down-menu-item-figure tw-flex">
                                <div class="bttvSettingsIconContainer tw-align-items-center tw-icon tw-inline-flex">
                                    <div class="tw-aspect tw-aspect--align-top">
                                        <div class="tw-aspect__spacer"></div>
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
