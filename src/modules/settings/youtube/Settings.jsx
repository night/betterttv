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
    const bttvPanel = document.getElementById('bttvSettingsPanel');

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
    if (menuItemsListener != null) return;

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

        ReactDOM.render(
          <DropdownButton
            onClick={() => {
              handleOpen(true);

              // close the dropdown menu when the modal is opened
              const avatarButton = document.querySelector(AVATAR_BUTTON_SELECTOR);

              if (avatarButton != null) {
                avatarButton.click();
              }
            }}
          />,
          dropdownButtonContainer
        );

        mountedDropdownButton = dropdownButtonContainer;
      }

      menuItemsListener();
      menuItemsListener = null;
    });
  }
}
