import React from 'react';
import formatMessage from '../../../i18n/index.js';
import domObserver from '../../../observers/dom.js';
import Modal from '../components/SettingsModal.jsx';
import shadowDOM from '../../shadow_dom';
import {ShadowDOMComponentIds} from '../../../constants.js';
import {bindTooltip} from '../../tooltip/index.js';
import iconButtonStyles from '../../../common/styles/IconButton.module.css';
import topNavStyles from './TopNavButton.module.css';
import promotionStore from '../stores/promotion-store.js';

const TOP_NAV_MENU_SELECTOR = '.top-nav__menu';
const TOP_NAV_USER_MENU_SELECTOR = '[data-a-target="user-menu-toggle"]';
const TOP_NAV_SETTINGS_BUTTON_CONTAINER_ID = 'bttv-top-nav-settings-button-container';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

export default class SettingsModule {
  constructor() {
    this.load();
    domObserver.on('a[data-test-selector="user-menu-dropdown__settings-link"],.tw-drop-down-menu-item-figure', () => {
      this.renderSettingsMenuOption();
    });
    domObserver.on(TOP_NAV_MENU_SELECTOR, () => {
      this.renderTopNavButton();
    });
    promotionStore.on('changed', () => this.updateTopNavPromotionIndicator());
  }

  async load() {
    // eslint-disable-next-line import/no-unresolved
    await import('../settings/global/*.jsx');
    // eslint-disable-next-line import/no-unresolved
    await import('../settings/twitch/*.jsx');
    this.renderSettings();
  }

  renderSettings() {
    shadowDOM.mount(ShadowDOMComponentIds.SETTINGS_MENU, <Modal setHandleOpen={setHandleOpen} />);
  }

  renderSettingsMenuOption() {
    if (document.querySelector('.bttvSettingsIconDropDown') != null) return;

    const settingsDropDown = document
      .querySelector(
        'a[data-a-target="settings-dropdown-link"],a[href="https://www.twitch.tv/settings/profile"],button[data-a-target="language-dropdown-link"]'
      )
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

    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      handleOpen?.(true);
    });

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

  renderTopNavButton() {
    const userMenuToggle = document.querySelector(TOP_NAV_USER_MENU_SELECTOR);
    // The avatar is wrapped two levels under the top nav menu, alongside the native icons.
    // Grab that wrapper so we can drop our button in right before it.
    const avatarWrapper = userMenuToggle?.closest(`${TOP_NAV_MENU_SELECTOR} > * > *`);
    if (avatarWrapper == null) {
      return;
    }

    // Twitch loads promotional buttons (Bits, ad-free) after we mount and inserts them right
    // before the avatar, so pin our button's position with flex order rather than DOM order.
    avatarWrapper.classList.add(topNavStyles.avatar);

    if (document.getElementById(TOP_NAV_SETTINGS_BUTTON_CONTAINER_ID) != null) {
      return;
    }

    const container = document.createElement('div');
    container.setAttribute('id', TOP_NAV_SETTINGS_BUTTON_CONTAINER_ID);
    container.classList.add(topNavStyles.container);

    const button = document.createElement('button');
    button.classList.add(iconButtonStyles.button);
    button.setAttribute('data-a-target', 'betterttv-settings-button');
    button.addEventListener('click', () => handleOpen?.(true));
    bindTooltip(button, {content: formatMessage({defaultMessage: 'BetterTTV Settings'})});

    container.appendChild(button);
    avatarWrapper.before(container);

    this.updateTopNavPromotionIndicator();
  }

  updateTopNavPromotionIndicator() {
    const container = document.getElementById(TOP_NAV_SETTINGS_BUTTON_CONTAINER_ID);
    const button = container?.querySelector('button');
    if (button == null) {
      return;
    }

    button.classList.toggle(topNavStyles.indicator, promotionStore.hasAvailablePromotion());
  }

  openSettings({scrollToSettingPanelId} = {scrollToSettingPanelId: null}) {
    handleOpen?.(true, {scrollToSettingPanelId});
  }
}
