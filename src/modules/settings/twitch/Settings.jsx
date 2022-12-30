import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';
import Modal from '../components/Window.jsx';
import domObserver from '../../../observers/dom.js';
import html from '../../../utils/html.js';
import formatMessage from '../../../i18n/index.js';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

let mountedRoot;

export default class SettingsModule {
  constructor() {
    this.load();
    domObserver.on('a[data-test-selector="user-menu-dropdown__settings-link"]', () => {
      this.renderSettingsMenuOption();
    });
  }

  async load() {
    // eslint-disable-next-line import/no-unresolved
    await import('../components/settings/global/*.jsx');
    // eslint-disable-next-line import/no-unresolved
    await import('../components/settings/twitch/*.jsx');
    this.renderSettings();
  }

  renderSettings() {
    if ($('#bttvSettings').length) return;
    const panel = document.createElement('div');
    panel.setAttribute('id', 'bttvSettingsPanel');
    $('body').append(panel);
    if (mountedRoot != null) {
      mountedRoot.unmount();
    }
    mountedRoot = createRoot(panel);
    mountedRoot.render(<Modal setHandleOpen={setHandleOpen} />);
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
            <div class="dropdownLabel">${html.escape(formatMessage({defaultMessage: 'BetterTTV Settings'}))}</div>
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
