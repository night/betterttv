import $ from 'jquery';
import {save} from 'save-file';
import React from 'react';
import ReactDOM from 'react-dom';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import storage from '../../storage.js';
import html from '../../utils/html.js';
import domObserver from '../../observers/dom.js';
import App from './App.js';

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
}

export default new SettingsModule();
