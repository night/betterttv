import React from 'react';
import {createRoot} from 'react-dom/client';
import domObserver from '@/observers/dom';
import {getElementData} from '@/utils/youtube';
import SettingsModal from '@/modules/settings/components/SettingsModal';
import DropdownButton from './DropdownButton';
import './Settings.module.css';
import {ShadowDOMComponentIds} from '@/constants';
import shadowDOM from '@/modules/shadow_dom';
import {importAll} from '@/utils/modules';

const CHAT_SETTINGS_DROPDOWN_CONTAINER_SELECTOR = 'tp-yt-iron-dropdown';
const CHAT_SETTINGS_DROPDOWN_ITEMS_SELECTOR = 'tp-yt-paper-listbox';
const CHAT_SETTINGS_DROPDOWN_ITEM_SELECTOR = '.ytd-menu-popup-renderer,.ytls-menu-popup-renderer';
const CHAT_SETTINGS_MENU_BUTTON_SELECTOR = '#live-chat-header-context-menu.yt-live-chat-header-renderer';
const BTTV_CHAT_DROPDOWN_BUTTON_CONTAINER_SELECTOR = 'div[data-a-target="bttv-chat-dropdown-button-container"]';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

let mountedChatDropdownButtonRoot;

export default class SettingsModule {
  constructor() {
    this.load();

    domObserver.on(CHAT_SETTINGS_DROPDOWN_ITEM_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      const closestDropdownContainer = node.closest(CHAT_SETTINGS_DROPDOWN_CONTAINER_SELECTOR);
      if (
        closestDropdownContainer == null ||
        getElementData(closestDropdownContainer)?.positionTarget !==
          document.querySelector(CHAT_SETTINGS_MENU_BUTTON_SELECTOR)
      ) {
        return;
      }

      this.loadChatAppMenuButton(node);
    });
  }

  async load() {
    await importAll(import.meta.glob('../settings/global/*.jsx'));
    await importAll(import.meta.glob('../settings/youtube/*.jsx'));
    this.renderSettings();
  }

  renderSettings() {
    shadowDOM.mount(ShadowDOMComponentIds.SETTINGS_MENU, <SettingsModal setHandleOpen={setHandleOpen} />);
  }

  loadChatAppMenuButton(node) {
    const buttonContainer = document.querySelector(BTTV_CHAT_DROPDOWN_BUTTON_CONTAINER_SELECTOR);

    if (buttonContainer == null) {
      const itemsContainer = node.closest(CHAT_SETTINGS_DROPDOWN_ITEMS_SELECTOR);
      if (itemsContainer == null) {
        return;
      }

      const dropdownButtonContainer = document.createElement('div');
      dropdownButtonContainer.setAttribute('data-a-target', 'bttv-chat-dropdown-button-container');
      itemsContainer.appendChild(dropdownButtonContainer);

      if (mountedChatDropdownButtonRoot != null) {
        mountedChatDropdownButtonRoot.unmount();
      }

      mountedChatDropdownButtonRoot = createRoot(dropdownButtonContainer);
      mountedChatDropdownButtonRoot.render(
        <DropdownButton
          onClick={() => {
            handleOpen?.(true);

            // close the dropdown menu when the modal is opened
            const menuButton = document.querySelector(CHAT_SETTINGS_MENU_BUTTON_SELECTOR);
            if (menuButton != null) {
              menuButton.click();
            }
          }}
        />
      );
    }
  }

  openSettings({scrollToSettingPanelId} = {scrollToSettingPanelId: null}) {
    handleOpen?.(true, {scrollToSettingPanelId});
  }
}
