import React from 'react';
import {createRoot} from 'react-dom/client';
import Modal from '../components/Window.jsx';
import domObserver from '../../../observers/dom.js';
import formatMessage from '../../../i18n/index.js';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

let mountedRoot;

export default class SettingsModule {
  constructor() {
    this.load();
    domObserver.on('a[data-test-selector="user-menu-dropdown__settings-link"],.tw-drop-down-menu-item-figure', () => {
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
    if (document.querySelector('#bttvSettings') != null) return;
    const panel = document.createElement('div');
    panel.setAttribute('id', 'bttvSettingsPanel');
    document.body.appendChild(panel);
    if (mountedRoot != null) {
      mountedRoot.unmount();
    }
    mountedRoot = createRoot(panel);
    mountedRoot.render(<Modal setHandleOpen={setHandleOpen} />);
  }

  renderSettingsMenuOption() {
    if (document.querySelector('.bttvSettingsIconDropDown') != null) return;

    const settingsDropDown = document
      .querySelector('a[data-a-target="settings-dropdown-link"],a[href="https://www.twitch.tv/settings/profile"]')
      ?.closest('div');
    if (settingsDropDown == null) return;

    const container = document.createElement('div');
    container.classList.add('bttvSettingsDropDownWrapper');
    settingsDropDown.after(container);

    const anchor = document.createElement('a');
    anchor.classList.add('bttvSettingsDropDown');
    anchor.setAttribute('borderradius', 'border-radius-medium');
    anchor.setAttribute('data-a-target', 'betterttv-settings-dropdown-link');
    anchor.setAttribute('data-test-selector', 'user-menu-dropdown__betterttv-settings-link');
    anchor.setAttribute('href', '#');
    anchor.addEventListener('click', this.openSettings);
    container.appendChild(anchor);

    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdownContainer');
    anchor.appendChild(dropdownContainer);

    const dropdownIcon = document.createElement('div');
    dropdownIcon.classList.add('dropdownIcon');
    dropdownContainer.appendChild(dropdownIcon);

    const dropdownLabel = document.createElement('div');
    dropdownLabel.classList.add('dropdownLabel');
    dropdownLabel.innerText = formatMessage({defaultMessage: 'BetterTTV Settings'});
    dropdownContainer.appendChild(dropdownLabel);

    const dropdownIconContainer = document.createElement('div');
    dropdownIconContainer.classList.add('dropdownIconContainer');
    dropdownIcon.appendChild(dropdownIconContainer);

    const dropdownIconAspect = document.createElement('div');
    dropdownIconAspect.classList.add('dropdownIconAspect');
    dropdownIconContainer.appendChild(dropdownIconAspect);

    const dropdownIconSpacer = document.createElement('div');
    dropdownIconSpacer.classList.add('dropdownIconSpacer');
    dropdownIconAspect.appendChild(dropdownIconSpacer);

    const bttvSettingsIconDropDown = document.createElement('figure');
    bttvSettingsIconDropDown.classList.add('bttvSettingsIconDropDown');
    dropdownIconAspect.appendChild(bttvSettingsIconDropDown);
  }

  openSettings(e) {
    e.preventDefault();
    handleOpen(true);
  }
}
