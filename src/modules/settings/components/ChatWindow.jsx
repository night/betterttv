import React, {useState} from 'react';
import PanelGroup from 'rsuite/PanelGroup';
import styles from '../styles/popout.module.css';
import {Settings, Search} from './Settings.jsx';
import {CategoryTypes} from '../../../constants.js';
import cdn from '../../../utils/cdn.js';
import CloseButton from './CloseButton.jsx';
import formatMessage from '../../../i18n/index.js';

export default function ChatWindow({open, onClose}) {
  const [search, setSearch] = useState('');

  if (!open) return null;

  return (
    <div className={styles.standaloneChatWindow}>
      <div className={styles.header}>
        <img alt="" src={cdn.url('/assets/logos/mascot.png')} className={styles.logo} />
        <div className={styles.search}>
          <Search
            placeholder={formatMessage({defaultMessage: 'Chat Settings...'})}
            value={search}
            onChange={setSearch}
          />
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <PanelGroup className={styles.chatWindowContent}>
        <Settings search={search} category={CategoryTypes.CHAT} />
      </PanelGroup>
    </div>
  );
}
