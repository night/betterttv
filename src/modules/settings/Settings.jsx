import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from './components/Window.jsx';
import domObserver from '../../observers/dom.js';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

export default class SettingsModule {
  constructor() {
    this.renderSettings();
    domObserver.on('a[data-test-selector="user-menu-dropdown__settings-link"]', () => {
      this.renderSettingsMenuOption();
    });
  }

  renderSettings() {
    if ($('#bttvSettings').length) return;
    const panel = document.createElement('div');
    panel.setAttribute('id', 'bttvSettingsPanel');
    $('body').append(panel);
    ReactDOM.render(<Modal setHandleOpen={setHandleOpen} />, panel);
  }

  renderSettingsMenuOption() {
    if ($('.bttvSettingsIconDropDown').length) return;

    $('a[data-a-target="settings-dropdown-link"]').parent('div').after(`
      <div class="bttvSettingsDropDownWrapper">
        <a borderradius="border-radius-medium" class="bttvSettingsDropDown" data-a-target="betterttv-settings-dropdown-link" data-test-selector="user-menu-dropdown__betterttv-settings-link" href="#">
          <div class="dropdownContainer">
            <div class="dropdownIcon">
              <div class="dropdownIconContainer">
                <div class="dropdownIconAspect">
                  <div class="dropdownIconSpacer"></div>
                  <figure class="bttvSettingsIconDropDown"></figure>
                </div>
              </div>
            </div>
            <div class="dropdownLabel">BetterTTV Settings</div>
          </div>
        </a>
      </div>
    `);

    $('.bttvSettingsIconDropDown').closest('a').on('click', this.openSettings);
  }

  openSettings(e) {
    e.preventDefault();
    handleOpen(true);
  }
}
