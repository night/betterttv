import React, {useState, useEffect} from 'react';
import Button from 'rsuite/Button';
import Divider from 'rsuite/Divider';
import useStorageState from '../../../common/hooks/StorageState.jsx';
import {EmoteMenuTips, EmoteMenuTypes, PlatformTypes, SettingIds} from '../../../constants.js';
import formatMessage from '../../../i18n/index.js';
import storage from '../../../storage.js';
import {getPlatform, isMac} from '../../../utils/window.js';
import emoteMenuStore from '../stores/emote-menu-store.js';
import Icons from './Icons.jsx';
import styles from './Tip.module.css';

const tips = {};
for (const tipStorageKey of Object.values(EmoteMenuTips)) {
  tips[tipStorageKey] = storage.get(tipStorageKey) || false;
}

function TextButton({children, ...props}) {
  return (
    <Button className={styles.textButton} appearance="link" size="xs" {...props}>
      {children}
    </Button>
  );
}

function getTipToDisplay() {
  const [emoteMenuValue] = useStorageState(SettingIds.EMOTE_MENU);
  if (!tips[EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE]) {
    return [
      EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE,
      formatMessage({defaultMessage: 'Hold Shift to Select Many Emotes'}),
    ];
  }

  if (!tips[EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE] && emoteMenuStore.favorites.length === 0) {
    return [
      EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE,
      isMac()
        ? formatMessage({defaultMessage: 'Option + Click Emotes to Favorite'})
        : formatMessage({defaultMessage: 'Alt + Click Emotes to Favorite'}),
    ];
  }

  if (!tips[EmoteMenuTips.EMOTE_MENU_HOTKEY]) {
    return [
      EmoteMenuTips.EMOTE_MENU_HOTKEY,
      isMac()
        ? formatMessage({defaultMessage: 'Control + E to Toggle Emote Menu'})
        : formatMessage({defaultMessage: 'Alt + E to Toggle Emote Menu'}),
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
            <TextButton
              key="emote-menu-replace-default-tip-button"
              onClick={async () => {
                const {default: settings} = await import('../../settings/index.js');
                settings.openSettings(null, 'Emote Menu');
              }}>
              {text}
            </TextButton>
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

function Strong(children) {
  return <strong>{children}</strong>;
}

export default function Tip({onSetTip}) {
  const [[tipStorageKey, tipDisplayText], setTipToDisplay] = useState(getTipToDisplay());

  useEffect(() => {
    onSetTip(tipStorageKey != null);
  }, [tipStorageKey]);

  if (tipStorageKey == null) {
    return null;
  }

  return (
    <>
      <Divider className={styles.divider} />
      <div className={styles.tip}>
        <span>{Icons.BULB}</span>
        <div className={styles.tipDisplayText}>
          {formatMessage(
            {defaultMessage: '<strong>Pro Tip:</strong> {tipDisplayText}'},
            {strong: Strong, tipDisplayText}
          )}
        </div>
        <TextButton
          onClick={() => {
            markTipAsSeen(tipStorageKey);
            setTipToDisplay([]);
          }}>
          {formatMessage({defaultMessage: 'Hide'})}
        </TextButton>
      </div>
    </>
  );
}
