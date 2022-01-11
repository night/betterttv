import React from 'react';
import ReactDOM from 'react-dom';
import Modal from '../components/Window.jsx';
import domObserver from '../../../observers/dom.js';
import Button from './Button.jsx';
import DropdownButton from './DropdownButton.jsx';

const CHAT_BUTTON_CONTAINER_SELECTOR = '#picker-buttons';
const BTTV_BUTTON_CONTAINER_SELECTOR = 'div[data-a-target="bttv-settings-button-container"]';
const BTTV_DROPDOWN_BUTTON_CONTAINER_SELECTOR = 'div[data-a-target="bttv-dropdown-button-container"]';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

let mountedNode;
let mountedDropdownButton;

export default class SettingsModule {
  constructor() {
    this.renderSettings();

    domObserver.on('#items', (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.loadDropdownButton();
    });
  }

  renderSettings() {
    if (document.getElementById('bttvSettings') != null) return;
    const panel = document.createElement('div');
    panel.setAttribute('id', 'bttvSettingsPanel');
    document.querySelector('body').append(panel);
    if (mountedNode != null) {
      ReactDOM.unmountComponentAtNode(mountedNode);
    }
    ReactDOM.render(<Modal setHandleOpen={setHandleOpen} />, panel);
    mountedNode = panel;
  }

  loadDropdownButton() {
    const dropdownButton = document.querySelector(BTTV_DROPDOWN_BUTTON_CONTAINER_SELECTOR);

    if (dropdownButton == null || dropdownButton.hasAttribute('hidden')) {
      const items = document.querySelector('ytd-popup-container #sections #items');

      if (items == null) {
        return;
      }

      const dropdownButtonContainer = document.createElement('div');
      dropdownButtonContainer.setAttribute('data-a-target', 'bttv-dropdown-button-container');
      items.appendChild(dropdownButtonContainer);

      if (mountedDropdownButton != null) {
        ReactDOM.unmountComponentAtNode(mountedDropdownButton);
      }

      ReactDOM.render(<DropdownButton onClick={this.openSettings} />, dropdownButtonContainer);
      mountedDropdownButton = dropdownButtonContainer;
    }
  }

  openSettings(e) {
    console.log('here');
    e.preventDefault();
    handleOpen(true);
  }
}
