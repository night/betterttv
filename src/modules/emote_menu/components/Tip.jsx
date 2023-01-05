import React, {useState, useEffect} from 'react';
import Divider from 'rsuite/Divider';
import Button from 'rsuite/Button';
import {EmoteMenuTips} from '../../../constants.js';
import storage from '../../../storage.js';
import {isMac} from '../../../utils/window.js';
import emoteMenuStore from '../stores/emote-menu-store.js';
import Icons from './Icons.jsx';
import styles from './Tip.module.css';
import formatMessage from '../../../i18n/index.js';

const tips = {};
for (const tipStorageKey of Object.values(EmoteMenuTips)) {
  tips[tipStorageKey] = storage.get(tipStorageKey) || false;
}

function getTipToDisplay() {
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
        <Button
          className={styles.closeButton}
          appearance="link"
          size="xs"
          onClick={() => {
            markTipAsSeen(tipStorageKey);
            setTipToDisplay([]);
          }}>
          {formatMessage({defaultMessage: 'Hide'})}
        </Button>
      </div>
    </>
  );
}
