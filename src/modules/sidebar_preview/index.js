import React from 'react';
import ReactDOM from 'react-dom';
import {PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import dom from '../../observers/dom.js';
import StreamPreview from './Preview.jsx';
import settings from '../../settings.js';

const PREVIEW_SELECTOR = 'bttv-stream-preview';
const TOOLTIP_SELECTOR = '.online-side-nav-channel-tooltip__body';
const HOVERED_SIDEBAR_SELECTOR =
  'a[data-test-selector="followed-channel"]:hover, a[data-test-selector="recommended-channel"]:hover';

let setUsername;
function usernameCallback(newSetUsername) {
  setUsername = newSetUsername;
}

const tooltipObserver = new MutationObserver((_, observer) => {
  const hoveredElement = document.querySelector(HOVERED_SIDEBAR_SELECTOR);
  if (hoveredElement == null) {
    observer.disconnect();
  }

  const user = hoveredElement.getAttribute('href').split('/')[1];
  setUsername(user);
});

let observer;
let domObserver;
class SidebarPeview {
  constructor() {
    this.load();
    settings.on(`changed.${SettingIds.STREAM_PREVIEW}`, this.load);
  }

  load() {
    if (!settings.get(SettingIds.STREAM_PREVIEW)) {
      domObserver();
      observer.disconnect();
      return;
    }

    domObserver = dom.on(TOOLTIP_SELECTOR, (node, isConnected) => {
      if (!isConnected || document.getElementById(PREVIEW_SELECTOR) != null) {
        return;
      }

      const hoveredElement = document.querySelector(HOVERED_SIDEBAR_SELECTOR);
      const user = hoveredElement.getAttribute('href').split('/')[1];

      const panel = document.createElement('div');
      panel.setAttribute('id', PREVIEW_SELECTOR);
      // eslint-disable-next-line react/jsx-filename-extension
      ReactDOM.render(<StreamPreview username={user} usernameCallback={usernameCallback} />, panel);
      node.prepend(panel);

      observer = tooltipObserver.observe(node, {
        characterData: true,
        attributes: false,
        childList: false,
        subtree: true,
      });
    });
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new SidebarPeview()]);
