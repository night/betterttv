import React, {useState} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import styles from '../styles/menu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

export default function EmoteMenu({triggerRef}) {
  const [search, setSearch] = useState('');

  const onHide = () => triggerRef.current.close();

  return (
    <>
      <Header value={search} onChange={(newValue) => setSearch(newValue)} className={styles.header} onHide={onHide} />
      <Divider className={styles.divider} />
      <div className={styles.content}>
        <Sidebar className={styles.sidebar} />
        <Emotes search={search} className={styles.emojis} />
      </div>
    </>
  );
}
