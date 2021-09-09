import React, {useCallback, useEffect, useState} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import keycodes from '../../../utils/keycodes.js';
import emoteStore from '../stores/index.js';
import styles from '../styles/menu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Preview from './Preview.jsx';
import Sidebar from './Sidebar.jsx';

export default function EmoteMenu({triggerRef, appendToChat}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [, setUpdated] = useState(false);

  const [altPressed, setAltPressed] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);

  const [section, setSection] = useState({
    eventKey: null,
    scrollTo: false,
  });

  const [arrowKeys, setArrowKeys] = useState({
    top: false,
    down: false,
    right: false,
    left: false,
  });

  const onHide = useCallback(() => triggerRef.current.close(), [triggerRef]);

  const handleClick = useCallback(
    (emote) => {
      if (altPressed) {
        emoteStore.toggleFavorite(emote);
        return;
      }

      appendToChat(emote.code);
      emoteStore.trackHistory(emote);

      if (shiftPressed) {
        return;
      }

      onHide();
    },
    [altPressed, shiftPressed]
  );

  useEffect(() => setSearch(''), [section]);

  const handleKeyDownCallback = useCallback(
    (event) => {
      if (event.keyCode === keycodes.Enter) {
        event.preventDefault();
        handleClick(selected);
      }
    },
    [selected]
  );

  useEffect(() => {
    function buttonPressCallback(event) {
      setAltPressed(event.altKey);
      setShiftPressed(event.shiftKey);
    }

    function handleArrowKeys(event) {
      if (
        event.keyCode === keycodes.UpArrow ||
        event.keyCode === keycodes.DownArrow ||
        event.keyCode === keycodes.RightArrow ||
        event.keyCode === keycodes.LeftArrow
      ) {
        setArrowKeys({
          top: event.keyCode === keycodes.UpArrow,
          down: event.keyCode === keycodes.DownArrow,
          right: event.keyCode === keycodes.RightArrow,
          left: event.keyCode === keycodes.LeftArrow,
        });

        event.preventDefault(); // prevent scrolling
      }
    }

    function callback(event) {
      buttonPressCallback(event);
      handleArrowKeys(event);
      handleKeyDownCallback(event);
    }

    window.addEventListener('keydown', callback, false);
    window.addEventListener('keyup', buttonPressCallback, false);

    return () => {
      window.removeEventListener('keydown', callback, false);
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

  return (
    <>
      <Header className={styles.header} value={search} onChange={setSearch} onHide={onHide} selected={selected} />
      <Divider className={styles.divider} />
      <div className={styles.content}>
        <Sidebar
          className={styles.sidebar}
          section={section}
          providers={emoteStore.getProviders()}
          onChange={(eventKey) => setSection({eventKey, scrollTo: true})}
        />
        <Emotes
          className={styles.emotes}
          search={search}
          section={section}
          onClick={handleClick}
          arrowKeys={arrowKeys}
          rows={emoteStore.rows}
          setSelected={setSelected}
          onSection={(eventKey) => setSection({eventKey, scrollTo: false})}
        />
      </div>
      <Divider className={styles.divider} />
      <Preview className={styles.preview} emote={selected} />
    </>
  );
}
