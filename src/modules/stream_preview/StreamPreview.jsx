import React from 'react';
import ReactDOM from 'react-dom';
import Preview from './Preview.jsx';
import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import dom from '../../observers/dom.js';

const PREVIEW_SELECTOR = 'bttv-stream-preview';
const TOOLTIP_SELECTOR = '.online-side-nav-channel-tooltip__body';
const HOVERED_SIDEBAR_SELECTOR =
  'a[data-test-selector="followed-channel"]:hover, a[data-test-selector="recommended-channel"]:hover';

let setUsername;
function usernameCallback(newSetUsername) {
  setUsername = newSetUsername;
}

function patchStreamTooltip(node, isConnected) {
  if (!isConnected) {
    return;
  }

  const hoveredNode = document.querySelector(HOVERED_SIDEBAR_SELECTOR);
  if (hoveredNode == null) {
    return;
  }

  const username = hoveredNode.getAttribute('href').split('/')[1];

  if (document.getElementById(PREVIEW_SELECTOR) != null) {
    setUsername(username);
    return;
  }

  const panel = document.createElement('div');
  panel.setAttribute('id', PREVIEW_SELECTOR);
  ReactDOM.render(<Preview username={username} usernameCallback={usernameCallback} />, panel);
  node.prepend(panel);
}

class StreamPeview {
  constructor() {
    dom.on(TOOLTIP_SELECTOR, patchStreamTooltip, {characterData: true});
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new StreamPeview()]);
