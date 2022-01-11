import React from 'react';
import ReactDOM from 'react-dom';
import Modal from '../components/Window.jsx';
import domObserver from '../../../observers/dom.js';
import DropdownButton from './DropdownButton.jsx';

const BTTV_DROPDOWN_BUTTON_CONTAINER_SELECTOR = 'div[data-a-target="bttv-dropdown-button-container"]';
const DROPDOWN_MENU_ITEMS_SELECTOR = 'ytd-popup-container #sections #items';
const ITEMS_SELECTOR = '#items';
const AVATAR_BUTTON_SELECTOR = '#avatar-btn';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

let mountedPanel;
let mountedDropdownButton;

let avatarListenerAttached = false;
let menuItemsListener = null;

export default class SettingsModule {
  constructor() {
    this.renderSettings();

    domObserver.on(AVATAR_BUTTON_SELECTOR, (node, isConnected) => {
      if (!isConnected || avatarListenerAttached) {
        return;
      }

      avatarListenerAttached = true;
      node.addEventListener('click', this.loadDropdownButton);
    });
  }

  renderSettings() {
    const bttvPanel = document.getElementById('bttvSettings');

    if (bttvPanel == null) {
      const panel = document.createElement('div');
      panel.setAttribute('id', 'bttvSettingsPanel');
      document.querySelector('body').append(panel);

      if (mountedPanel != null) {
        ReactDOM.unmountComponentAtNode(mountedPanel);
      }

      ReactDOM.render(<Modal setHandleOpen={setHandleOpen} />, panel);
      mountedPanel = panel;
    }
  }

  loadDropdownButton() {
    // wait for the menu to finish loading...
    menuItemsListener = domObserver.on(ITEMS_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      const dropdownButton = document.querySelector(BTTV_DROPDOWN_BUTTON_CONTAINER_SELECTOR);

      if (dropdownButton == null || dropdownButton.hasAttribute('hidden')) {
        const items = document.querySelector(DROPDOWN_MENU_ITEMS_SELECTOR);

        if (items == null) {
          return;
        }

        const dropdownButtonContainer = document.createElement('div');
        dropdownButtonContainer.setAttribute('data-a-target', 'bttv-dropdown-button-container');
        items.appendChild(dropdownButtonContainer);

        if (mountedDropdownButton != null) {
          ReactDOM.unmountComponentAtNode(mountedDropdownButton);
        }

        ReactDOM.render(<DropdownButton onClick={() => handleOpen(true)} />, dropdownButtonContainer);
        mountedDropdownButton = dropdownButtonContainer;
      }

      menuItemsListener();
      menuItemsListener = null;
    });

    // if the user closes the dropdown before it's finished loading we must remove the listener
    setTimeout(() => {
      if (menuItemsListener == null) {
        return;
      }

      menuItemsListener();
      menuItemsListener = null;
    }, 3000);
  }
}
