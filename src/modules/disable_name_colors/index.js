import $ from 'jquery';
import {SettingIds, UsernameFlags} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import watcher from '../../watcher.js';

class DisableNameColorsModule {
  constructor() {
    settings.on(`changed.${SettingIds.USERNAMES}`, () => this.load());
    watcher.on('load.chat', () => this.load());
  }

  load() {
    $('body').toggleClass(
      'bttv-disable-name-colors',
      !hasFlag(settings.get(SettingIds.USERNAMES), UsernameFlags.COLORS)
    );
  }
}

export default new DisableNameColorsModule();
