import React from 'react';
import ReactDOM from 'react-dom';
import Modal from '../components/Window.jsx';
import domObserver from '../../../observers/dom.js';
import DropdownButton from './DropdownButton.jsx';
import styles from './Settings.module.css';

const CHAT_SETTINGS_DROPDOWN_CONTAINER_SELECTOR = 'tp-yt-iron-dropdown';
const CHAT_SETTINGS_DROPDOWN_ITEMS_SELECTOR = '.ytd-menu-popup-renderer,.ytls-menu-popup-renderer';
const CHAT_SETTINGS_MENU_BUTTON_SELECTOR = '#overflow.yt-live-chat-header-renderer';
const BTTV_CHAT_DROPDOWN_BUTTON_CONTAINER_SELECTOR = 'div[data-a-target="bttv-chat-dropdown-button-container"]';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

let mountedPanel;
let mountedChatDropdownButton;

export default class SettingsModule {
  constructor() {
    this.load();

    domObserver.on(CHAT_SETTINGS_DROPDOWN_ITEMS_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      const closestDropdownContainer = node.closest(CHAT_SETTINGS_DROPDOWN_CONTAINER_SELECTOR);
      if (
        closestDropdownContainer == null ||
        closestDropdownContainer.__data.positionTarget !== document.querySelector(CHAT_SETTINGS_MENU_BUTTON_SELECTOR)
      ) {
        return;
      }

      this.loadChatAppMenuButton(node);
    });
  }

  async load() {
    // eslint-disable-next-line import/no-unresolved
    await import('../components/settings/global/*.jsx');
    // eslint-disable-next-line import/no-unresolved
    await import('../components/settings/youtube/*.jsx');
    this.renderSettings();
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

  loadChatAppMenuButton(node) {
    const buttonContainer = document.querySelector(BTTV_CHAT_DROPDOWN_BUTTON_CONTAINER_SELECTOR);

    if (buttonContainer == null) {
      const itemsContainer = node.parentElement;

      if (itemsContainer == null) {
        return;
      }

      const dropdownButtonContainer = document.createElement('div');
      dropdownButtonContainer.setAttribute('data-a-target', 'bttv-chat-dropdown-button-container');
      itemsContainer.appendChild(dropdownButtonContainer);

      if (mountedChatDropdownButton != null) {
        ReactDOM.unmountComponentAtNode(mountedChatDropdownButton);
      }

      ReactDOM.render(
        <DropdownButton
          onClick={() => {
            handleOpen(true);

            // close the dropdown menu when the modal is opened
            const menuButton = document.querySelector(CHAT_SETTINGS_MENU_BUTTON_SELECTOR);
            if (menuButton != null) {
              menuButton.click();
            }
          }}
        />,
        dropdownButtonContainer
      );

      mountedChatDropdownButton = dropdownButtonContainer;
    }
  }
}
