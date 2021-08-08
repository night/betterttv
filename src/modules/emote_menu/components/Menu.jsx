import React, {useCallback, useEffect, useState} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import emoteStore from '../stores/index.js';
import styles from '../styles/menu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Preview from './Preview.jsx';
import Sidebar from './Sidebar.jsx';

export default function EmoteMenu({triggerRef, appendText}) {
  const onHide = useCallback(() => triggerRef.current.close(), [triggerRef]);

  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);

  const [section, setSection] = useState({
    eventKey: null,
    scrollTo: false,
  });

  useEffect(() => setSearch(''), [section]);

  const handleClick = useCallback((emote) => {
    const keys = emoteStore.getKeys();
    switch (true) {
      case keys.shift:
        appendText(emote.code);
        emoteStore.incrementEmote(emote);
        break;
      case keys.alt:
        emoteStore.toggleFavorite(emote);
        break;
      default:
        appendText(emote.code);
        onHide();
        emoteStore.incrementEmote(emote);
    }
  }, []);

  useEffect(() => {
    function buttonPressCallback(e) {
      const keys = emoteStore.getKeys();
      if (keys.shift === e.shiftKey && keys.alt === e.altKey) return;

      emoteStore.setKeys({
        shift: e.shiftKey,
        alt: e.altKey,
      });
    }

    window.addEventListener('mousemove', buttonPressCallback, false);
    window.addEventListener('keydown', buttonPressCallback, false);

    return () => {
      window.removeEventListener('mousemove', buttonPressCallback, false);
      window.removeEventListener('keydown', buttonPressCallback, false);
    };
  }, []);

  return (
    <>
      <Header value={search} onChange={(newValue) => setSearch(newValue)} className={styles.header} onHide={onHide} />
      <Divider className={styles.divider} />
      <div className={styles.content}>
        <Sidebar
          section={section}
          className={styles.sidebar}
          onChange={(eventKey) => setSection({eventKey, scrollTo: true})}
        />
        <Emotes
          search={search}
          section={section}
          className={styles.emojis}
          onHover={setPreview}
          onClick={handleClick}
          onSection={(eventKey) => setSection({eventKey, scrollTo: false})}
        />
      </div>
      <Divider className={styles.divider} />
      <Preview emote={preview} className={styles.preview} />
    </>
  );
}
