/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Tooltip from 'rsuite/lib/Tooltip/index.js';
import styles from '../styles/legacy-button.module.css';

export default function LegacyButton() {
  return (
    <Whisper
      trigger="click"
      placement="auto"
      speaker={
        <Tooltip className={styles.tooltip}>
          This button has moved! Click the other :) button in the chat box to access BetterTTV&apos;s emote menu.
        </Tooltip>
      }>
      <button type="button" className={styles.button} />
    </Whisper>
  );
}
