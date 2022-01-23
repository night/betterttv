import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line import/no-unresolved, import/extensions
import '../components/settings/youtube/*';
// eslint-disable-next-line import/no-unresolved, import/extensions
import '../components/settings/global/*';
import Modal from '../components/Window.jsx';
import domObserver from '../../../observers/dom.js';
import DropdownButton from './DropdownButton.jsx';
import styles from './Settings.module.css';

const BTTV_DROPDOWN_BUTTON_CONTAINER_SELECTOR = 'div[data-a-target="bttv-dropdown-button-container"]';
const DROPDOWN_MENU_ITEMS_SELECTOR = 'ytd-popup-container #sections #items';
const ITEMS_SELECTOR = '#items';
const AVATAR_BUTTON_SELECTOR = '#avatar-btn';

const CHAT_SETTINGS_DROPDOWN_ITEMS_SELECTOR = '#contentWrapper #items';
const CHAT_SETTINGS_MENU_BUTTON_SELECTOR = '#overflow #button';
const BTTV_CHAT_DROPDOWN_BUTTON_CONTAINER_SELECTOR = 'div[data-a-target="bttv-chat-dropdown-button-container"]';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

let mountedPanel;
let mountedDropdownButton;
let mountedChatDropdownButton;

let menuItemsListener = null;

export default class SettingsModule {
  constructor() {
    this.renderSettings();

    // TODO: re-enable this when we have settings like theatre mode...
    // domObserver.on(AVATAR_BUTTON_SELECTOR, (node, isConnected) => {
    //   if (!isConnected) {
    //     return;
    //   }

    //   node.addEventListener('click', this.loadDropdownButton);
    // });

    domObserver.on(CHAT_SETTINGS_DROPDOWN_ITEMS_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.loadChatAppMenuButton(node);
    });
  }

  renderSettings() {
    const bttvPanel = document.getElementById('bttvSettingsPanel');

    if (bttvPanel == null) {
      const panel = document.createElement('div');
      panel.setAttribute('id', 'bttvSettingsPanel');
      const chatApp = document.querySelector('#chat');

      if (chatApp == null) {
        return;
      }

      chatApp.append(panel);

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
      dropdownButtonContainer.classList.add(styles.chatAppDropdownButton);
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

  loadDropdownButton() {
    if (menuItemsListener != null) return;

    // wait for the menu to finish loading...
    menuItemsListener = domObserver.on(ITEMS_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      menuItemsListener();
      menuItemsListener = null;

      const dropdownButton = document.querySelector(BTTV_DROPDOWN_BUTTON_CONTAINER_SELECTOR);

      if (dropdownButton == null || dropdownButton.hasAttribute('hidden')) {
        const items = document.querySelectorAll(DROPDOWN_MENU_ITEMS_SELECTOR)[1];

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
    });
  }
}
