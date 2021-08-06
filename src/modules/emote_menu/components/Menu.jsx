import React, {useEffect, useState} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import emoteStore from '../stores/index.js';
import styles from '../styles/menu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Preview from './Preview.jsx';
import Sidebar from './Sidebar.jsx';

export default function EmoteMenu({triggerRef}) {
  const onHide = () => triggerRef.current.close();

  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);

  const [keys, setKeys] = useState({
    shift: false,
    alt: false,
  });

  const [focus, setFocus] = useState({
    eventKey: null,
    scrollTo: false,
  });

  function handleClick(emote) {
    switch (true) {
      case keys.shift:
        emoteStore.incrementEmote(emote);
        break;
      case keys.alt:
        emoteStore.toggleFavorite(emote);
        break;
      default:
        emoteStore.incrementEmote(emote);
        onHide();
    }
  }

  useEffect(() => {
    function callback(e) {
      setKeys({
        shift: e.shiftKey,
        alt: e.altKey,
      });
    }

    window.addEventListener('mousemove', callback);
    window.addEventListener('keydown', callback);

    return () => {
      window.removeEventListener('keydown', callback);
      window.removeEventListener('mousemove', callback);
    };
  }, []);

  return (
    <>
      <Header value={search} onChange={(newValue) => setSearch(newValue)} className={styles.header} onHide={onHide} />
      <Divider className={styles.divider} />
      <div className={styles.content}>
        <Sidebar
          focus={focus}
          className={styles.sidebar}
          onChange={(eventKey) => setFocus({eventKey, scrollTo: true})}
        />
        <Emotes
          search={search}
          focus={focus}
          className={styles.emojis}
          onHover={(emote) => setPreview(emote)}
          onClick={(emote) => handleClick(emote)}
          onFocus={(eventKey) => setFocus({eventKey, scrollTo: false})}
        />
      </div>
      <Divider className={styles.divider} />
      <Preview emote={preview} className={styles.preview} />
    </>
  );
}
