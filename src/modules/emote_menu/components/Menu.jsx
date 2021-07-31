import React, {useState} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import grid from '../grid';
import styles from '../styles/menu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Preview from './Preview.jsx';
import Sidebar from './Sidebar.jsx';

export default function EmoteMenu({triggerRef}) {
  const [search, setSearch] = useState('');
  const [emote, setEmote] = useState(null);
  const [focus, setFocus] = useState(grid.getHeaders()[0].id);

  const onHide = () => triggerRef.current.close();

  return (
    <>
      <Header value={search} onChange={(newValue) => setSearch(newValue)} className={styles.header} onHide={onHide} />
      <Divider className={styles.divider} />
      <div className={styles.content}>
        <Sidebar value={focus} onChange={(eventKey) => setFocus(eventKey)} className={styles.sidebar} />
        <Emotes
          search={search}
          className={styles.emojis}
          onSelect={(newEmote) => setEmote(newEmote)}
          onFocus={(eventKey) => setFocus(eventKey)}
        />
      </div>
      <Divider className={styles.divider} />
      <Preview value={emote} className={styles.preview} />
    </>
  );
}
