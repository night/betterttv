import React, {useState} from 'react';
import useStorageState from '../../../common/hooks/StorageState.jsx';
import {EmoteMenuTips, EmoteMenuTypes, PlatformTypes, SettingIds} from '../../../constants.js';
import {SettingPanelIds} from '../../settings/stores/SettingStore.jsx';
import formatMessage from '../../../i18n/index.js';
import storage from '../../../storage.js';
import {getPlatform, isMac} from '../../../utils/window.js';
import emoteMenuStore from '../stores/emote-menu-store.js';
import Icons from './Icons.jsx';
import styles from './Tip.module.css';
import {Anchor, CloseButton, Kbd} from '@mantine/core';
import classNames from 'classnames';
import settings from '../../settings/index.js';

const tips = {};
for (const tipStorageKey of Object.values(EmoteMenuTips)) {
  tips[tipStorageKey] = storage.get(tipStorageKey) || false;
}

function getTipToDisplay(onClose) {
  const [emoteMenuValue, setEmoteMenuValue] = useStorageState(SettingIds.EMOTE_MENU);

  const replaceDefaultEmoteMenu = () => {
    markTipAsSeen(EmoteMenuTips.EMOTE_MENU_REPLACE_DEFAULT);
    setEmoteMenuValue(EmoteMenuTypes.ENABLED);
  };

  const customizeAccentColor = () => {
    settings.openSettings({scrollToSettingPanelId: SettingPanelIds.THEME});
    markTipAsSeen(EmoteMenuTips.EMOTE_MENU_CUSTOMIZE_ACCENT_COLOR);
    onClose();
  };

  if (!tips[EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE]) {
    return [
      EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE,
      formatMessage(
        {defaultMessage: 'Hold <kbd>Shift</kbd> to Select Many Emotes'},
        {kbd: (text) => <Kbd key={text}>{text}</Kbd>}
      ),
    ];
  }

  if (!tips[EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE] && emoteMenuStore.favorites.length === 0) {
    return [
      EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE,
      isMac()
        ? formatMessage(
            {defaultMessage: 'Press <kbd>Option</kbd> + Click Emotes to Favorite'},
            {kbd: (text) => <Kbd key={text}>{text}</Kbd>}
          )
        : formatMessage(
            {defaultMessage: 'Press <kbd>Alt</kbd> + Click Emotes to Favorite'},
            {kbd: (text) => <Kbd key={text}>{text}</Kbd>}
          ),
    ];
  }

  if (!tips[EmoteMenuTips.EMOTE_MENU_HOTKEY]) {
    return [
      EmoteMenuTips.EMOTE_MENU_HOTKEY,
      isMac()
        ? formatMessage(
            {defaultMessage: 'Press <kbd>Control</kbd> + <kbd>E</kbd> to Toggle Emote Menu'},
            {kbd: (text) => <Kbd key={text}>{text}</Kbd>}
          )
        : formatMessage(
            {defaultMessage: 'Press <kbd>Alt</kbd> + <kbd>E</kbd> to Toggle Emote Menu'},
            {kbd: (text) => <Kbd key={text}>{text}</Kbd>}
          ),
    ];
  }

  if (
    !tips[EmoteMenuTips.EMOTE_MENU_REPLACE_DEFAULT] &&
    emoteMenuValue !== EmoteMenuTypes.ENABLED &&
    PlatformTypes.TWITCH === getPlatform()
  ) {
    return [
      EmoteMenuTips.EMOTE_MENU_REPLACE_DEFAULT,
      formatMessage(
        {defaultMessage: '<button>Replace</button> the default emote picker button'},
        {
          button: ([text]) => (
            <Anchor key="replace-default-emote-menu-button" component="button" onClick={replaceDefaultEmoteMenu}>
              {text}
            </Anchor>
          ),
        }
      ),
    ];
  }

  if (!tips[EmoteMenuTips.EMOTE_MENU_CUSTOMIZE_ACCENT_COLOR]) {
    return [
      EmoteMenuTips.EMOTE_MENU_CUSTOMIZE_ACCENT_COLOR,
      formatMessage(
        {defaultMessage: '<button>Customize</button> the accent color of the emote menu'},
        {
          button: ([text]) => (
            <Anchor key="customize-accent-color-button" component="button" onClick={customizeAccentColor}>
              {text}
            </Anchor>
          ),
        }
      ),
    ];
  }

  return [];
}

export function markTipAsSeen(tipStorageKey) {
  tips[tipStorageKey] = true;
  storage.set(tipStorageKey, true);
}

function Tip({className, onClose, ...props}) {
  const [[tipStorageKey, tipDisplayText], setTipToDisplay] = useState(getTipToDisplay(onClose));

  const handleClose = () => {
    markTipAsSeen(tipStorageKey);
    setTipToDisplay([]);
  };

  if (tipStorageKey == null) {
    return null;
  }

  return (
    <div className={classNames(styles.tip, className)} {...props}>
      <div className={styles.tipIcon}>{Icons.BULB}</div>
      <div className={styles.tipDisplayText}>{tipDisplayText}</div>
      <CloseButton className={styles.closeButton} size="sm" radius="md" variant="transparent" onClick={handleClose} />
    </div>
  );
}

export default Tip;
