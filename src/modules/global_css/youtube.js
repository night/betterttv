import {SettingIds} from '../../constants.js';
import settings from '../../settings.js';

const node = document.querySelector('html');

function updateTheme() {
  if (!node.isConnected) {
    return;
  }

  const darkMode = node.getAttribute('dark') != null;
  settings.set(SettingIds.DARKENED_MODE, darkMode, true);
}

updateTheme();

const attributeObserver = new window.MutationObserver(updateTheme);
attributeObserver.observe(node, {attributes: true, attributeFilter: ['dark']});
