import React, {useCallback, useEffect, useState} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import emoteStore from '../stores/index.js';
import styles from '../styles/menu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Preview from './Preview.jsx';
import Sidebar from './Sidebar.jsx';

let alt = false;
let shift = false;

export default function EmoteMenu({triggerRef, appendToChat}) {
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(emoteStore.defaultEmote);

  const [section, setSection] = useState({
    eventKey: null,
    scrollTo: false,
  });

  const onHide = useCallback(() => triggerRef.current.close(), [triggerRef]);

  const handleClick = useCallback((emote) => {
    if (alt) {
      emoteStore.toggleFavorite(emote);
      return;
    }

    appendToChat(emote.code);
    emoteStore.trackHistory(emote);

    if (shift) {
      return;
    }

    onHide();
  }, []);

  useEffect(() => setSearch(''), [section]);

  useEffect(() => {
    function buttonPressCallback(event) {
      alt = event.altKey;
      shift = event.shiftKey;
    }

    window.addEventListener('keydown', buttonPressCallback, false);
    window.addEventListener('keyup', buttonPressCallback, false);

    return () => {
      window.removeEventListener('keydown', buttonPressCallback, false);
      window.removeEventListener('keyup', buttonPressCallback, false);
    };
  }, []);

  useEffect(() => {
    function handleEnterCallback(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        appendToChat(preview.code);
        emoteStore.trackHistory(preview);
        onHide();
      }
    }

    window.addEventListener('keydown', handleEnterCallback, false);

    return () => {
      window.removeEventListener('keydown', handleEnterCallback, false);
    };
  }, [preview]);

  return (
    <>
      <Header
        className={styles.header}
        value={search}
        onChange={setSearch}
        onHide={onHide}
        placeholder={preview.code}
      />
      <Divider className={styles.divider} />
      <div className={styles.content}>
        <Sidebar
          className={styles.sidebar}
          section={section}
          onChange={(eventKey) => setSection({eventKey, scrollTo: true})}
        />
        <Emotes
          className={styles.emojis}
          search={search}
          section={section}
          onHover={setPreview}
          onClick={handleClick}
          setPreview={setPreview}
          onSection={(eventKey) => setSection({eventKey, scrollTo: false})}
        />
      </div>
      <Divider className={styles.divider} />
      <Preview className={styles.preview} emote={preview} />
    </>
  );
}
