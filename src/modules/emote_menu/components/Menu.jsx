import React, {useCallback, useEffect, useState} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import {tipIds} from '../../../constants.js';
import keycodes from '../../../utils/keycodes.js';
import tips from '../../../utils/tips.js';
import emoteStore from '../stores/index.js';
import styles from '../styles/menu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Preview from './Preview.jsx';
import Sidebar from './Sidebar.jsx';
import TipWhisper from './TipWhisper.jsx';

let keyPressCallback;
function setKeyPressCallback(newKeyPressCallback) {
  keyPressCallback = newKeyPressCallback;
}

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

  const onHide = useCallback(() => triggerRef.current.close(), [triggerRef]);

  const handleClick = useCallback(
    (emote) => {
      if (altPressed) {
        tips.learnTip(tipIds.EMOTE_MENU_ALT_FAVORITE_EMOTE);
        emoteStore.toggleFavorite(emote);
        return;
      }

      appendToChat(emote.code, !shiftPressed);
      emoteStore.trackHistory(emote);

      if (shiftPressed) {
        tips.learnTip(tipIds.EMOTE_MENU_SHIFT_MULTIPLE_EMOTES);
        return;
      }

      onHide();
    },
    [altPressed, shiftPressed]
  );

  useEffect(() => {
    function buttonPressCallback(event) {
      setAltPressed(event.altKey);
      setShiftPressed(event.shiftKey);
    }

    function callback(event) {
      buttonPressCallback(event);

      if (event.keyCode === keycodes.Enter) {
        event.preventDefault();
        handleClick(selected);
        return;
      }

      keyPressCallback(event, shiftPressed);
    }

    window.addEventListener('keydown', callback, false);
    window.addEventListener('keyup', buttonPressCallback, false);

    return () => {
      window.removeEventListener('keydown', callback, false);
      window.removeEventListener('keyup', buttonPressCallback, false);
    };
  }, [selected, shiftPressed]);

  useEffect(() => {
    const callback = () => {
      if (!emoteStore.isLoaded()) return;
      emoteStore.once('updated', () => {
        setUpdated((prev) => !prev);
      });
    };

    callback();

    const cleanup = emoteStore.on('dirty', callback);
    return () => cleanup();
  }, []);

  useEffect(() => setSearch(''), [section]);

  return (
    <>
      <TipWhisper>
        <Header className={styles.header} value={search} onChange={setSearch} onHide={onHide} selected={selected} />
      </TipWhisper>
      <Divider className={styles.divider} />
      <div className={styles.content}>
        <Sidebar
          className={styles.sidebar}
          section={section}
          categories={emoteStore.getCategories()}
          onChange={(eventKey) => setSection({eventKey, scrollTo: true})}
        />
        <Emotes
          className={styles.emotes}
          search={search}
          section={section}
          onClick={handleClick}
          setKeyPressCallback={setKeyPressCallback}
          rows={emoteStore.rows}
          setSelected={setSelected}
          onSection={(eventKey) => setSection({eventKey, scrollTo: false})}
        />
      </div>
      <Divider className={styles.divider} />
      <Preview
        className={styles.preview}
        emote={selected}
        isFavorite={selected == null ? false : emoteStore.hasFavorite(selected)}
      />
    </>
  );
}
