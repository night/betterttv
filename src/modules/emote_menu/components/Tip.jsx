import React, {useState, useEffect} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import Button from 'rsuite/lib/Button/index.js';
import {EmoteMenuTips} from '../../../constants.js';
import storage from '../../../storage.js';
import emoteStorage from '../stores/emote-storage.js';
import Icons from './Icons.jsx';
import styles from './Tip.module.css';

const tips = {};
for (const tipStorageKey of Object.values(EmoteMenuTips)) {
  tips[tipStorageKey] = storage.get(tipStorageKey) || false;
}

function getTipToDisplay() {
  if (!tips[EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE]) {
    return [EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE, 'Hold Shift to Select Multiple Emotes'];
  }

  if (!tips[EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE] && emoteStorage.favorites.length === 0) {
    return [EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE, 'Hold Alt and Click on an Emote to Favorite it'];
  }

  return [];
}

export function markTipAsSeen(tipStorageKey) {
  tips[tipStorageKey] = true;
  storage.set(tipStorageKey, true);
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
          <strong>Pro Tip:</strong> {tipDisplayText}
        </div>
        <Button
          className={styles.closeButton}
          appearance="link"
          size="xs"
          onClick={() => {
            markTipAsSeen(tipStorageKey);
            setTipToDisplay([]);
          }}>
          Hide
        </Button>
      </div>
    </>
  );
}
