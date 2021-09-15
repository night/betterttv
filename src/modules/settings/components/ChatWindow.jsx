import React, {useState} from 'react';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';
import styles from '../styles/popout.module.css';
import {Settings, Search} from './Settings.jsx';
import {CategoryTypes} from '../../../constants.js';
import cdn from '../../../utils/cdn.js';
import CloseButton from './CloseButton.jsx';

export default function ChatWindow({show, onHide}) {
  const [search, setSearch] = useState('');

  if (!show) return null;

  return (
    <div className={styles.default}>
      <div className={styles.header}>
        <img alt="BetterTTV Logo" src={cdn.url('/assets/logos/mascot.png')} className={styles.logo} />
        <div className={styles.search}>
          <Search placeholder="Chat Settings..." value={search} onChange={setSearch} />
        </div>
        <CloseButton onHide={onHide} />
      </div>
      <PanelGroup className={styles.chatWindowContent}>
        <Settings search={search} category={CategoryTypes.CHAT} />
      </PanelGroup>
    </div>
  );
}
