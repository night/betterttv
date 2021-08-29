import React, {useCallback, useEffect, useState} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import keycodes from '../../../utils/keycodes.js';
import emoteStore from '../stores/index.js';
import styles from '../styles/menu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Preview from './Preview.jsx';
import Sidebar from './Sidebar.jsx';

let altKeyPressed = false;
let shiftKeyPressed = false;

export default function EmoteMenu({triggerRef, appendToChat}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [, setUpdated] = useState(false);

  const [section, setSection] = useState({
    eventKey: null,
    scrollTo: false,
  });

  const [arrows, setArrows] = useState({
    top: false,
    down: false,
    right: false,
    left: false,
  });

  const onHide = useCallback(() => triggerRef.current.close(), [triggerRef]);

  const handleClick = useCallback((emote) => {
    if (altKeyPressed) {
      emoteStore.toggleFavorite(emote);
      return;
    }

    appendToChat(emote.code);
    emoteStore.trackHistory(emote);

    if (shiftKeyPressed) {
      return;
    }

    onHide();
  }, []);

  useEffect(() => setSearch(''), [section]);

  useEffect(() => {
    function buttonPressCallback(event) {
      altKeyPressed = event.altKey;
      shiftKeyPressed = event.shiftKey;
    }

    function arrowPressCallback(event) {
      if (
        event.keyCode === keycodes.UpArrow ||
        event.keyCode === keycodes.DownArrow ||
        event.keyCode === keycodes.RightArrow ||
        event.keyCode === keycodes.LeftArrow
      ) {
        setArrows({
          top: event.keyCode === keycodes.UpArrow,
          down: event.keyCode === keycodes.DownArrow,
          right: event.keyCode === keycodes.RightArrow,
          left: event.keyCode === keycodes.LeftArrow,
        });

        event.preventDefault(); // prevent scrolling
      }
    }

    window.addEventListener('keydown', buttonPressCallback, false);
    window.addEventListener('keydown', arrowPressCallback, false);
    window.addEventListener('keyup', buttonPressCallback, false);

    return () => {
      window.removeEventListener('keydown', buttonPressCallback, false);
      window.removeEventListener('keydown', arrowPressCallback, false);
      window.removeEventListener('keyup', buttonPressCallback, false);
    };
  }, []);

  useEffect(() => {
    const callback = () => {
      if (!emoteStore.isLoaded()) return;
      emoteStore.once('updated', () => {
        setUpdated((prev) => !prev);
      });
    };

    callback();

    emoteStore.on('dirty', callback);

    return () => {
      emoteStore.off('dirty', callback);
    };
  }, []);

  useEffect(() => {
    function handleEnterCallback(event) {
      if (event.keyCode === keycodes.Enter) {
        event.preventDefault();
        appendToChat(selected.code);
        emoteStore.trackHistory(selected);
        if (!shiftKeyPressed) {
          onHide();
        }
      }
    }

    window.addEventListener('keydown', handleEnterCallback, false);

    return () => {
      window.removeEventListener('keydown', handleEnterCallback, false);
    };
  }, [selected]);

  return (
    <>
      <Header className={styles.header} value={search} onChange={setSearch} onHide={onHide} selected={selected} />
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
          onClick={handleClick}
          arrows={arrows}
          selected={selected}
          setSelected={setSelected}
          onSection={(eventKey) => setSection({eventKey, scrollTo: false})}
        />
      </div>
      <Divider className={styles.divider} />
      <Preview className={styles.preview} emote={selected} />
    </>
  );
}
