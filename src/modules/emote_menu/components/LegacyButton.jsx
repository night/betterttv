import React from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Tooltip from 'rsuite/lib/Tooltip/index.js';
import styles from '../styles/legacy-button.module.css';
import Icons from './Icons.jsx';

export default function LegacyButton() {
  return (
    <Whisper
      trigger="click"
      placement="auto"
      speaker={<Tooltip>BetterTTV&apos;s emote-menu now replaces twitch&apos;s default menu.</Tooltip>}>
      <button type="button" className={styles.button}>
        {Icons.SMILE}
      </button>
    </Whisper>
  );
}
