import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import styles from './styles.module.css';

class HideChatGifsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, () => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle(styles.hideChatGifs, !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.CHAT_GIFS));
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideChatGifsModule()]);
