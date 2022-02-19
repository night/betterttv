import {SettingIds} from '../../constants.js';
import settings from '../../settings.js';

const node = document.querySelector('html');

function updateTheme() {
  const isDarkMode = node.getAttribute('dark') != null;
  if (!node.isConnected || settings.get(SettingIds.DARKENED_MODE) === isDarkMode) {
    return;
  }

  settings.set(SettingIds.DARKENED_MODE, isDarkMode, true);
}

updateTheme();

const attributeObserver = new window.MutationObserver(updateTheme);
attributeObserver.observe(node, {attributes: true, attributeFilter: ['dark']});
