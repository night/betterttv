import React, {useCallback, useEffect, useState} from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import keycodes from '../../../utils/keycodes.js';
import {EmoteMenuTips} from '../../../constants.js';
import emoteStore from '../stores/index.js';
import styles from '../styles/menu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Preview from './Preview.jsx';
import Sidebar from './Sidebar.jsx';
import Tip, {markTipAsSeen} from './Tip.jsx';

let keyPressCallback;
function setKeyPressCallback(newKeyPressCallback) {
  keyPressCallback = newKeyPressCallback;
}

export default function EmoteMenu({triggerRef, appendToChat, onSetTip}) {
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
        emoteStore.toggleFavorite(emote);
        markTipAsSeen(EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE);
        return;
      }

      appendToChat(emote.code, !shiftPressed);
      emoteStore.trackHistory(emote);

      if (shiftPressed) {
        markTipAsSeen(EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE);
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
      <Header className={styles.header} value={search} onChange={setSearch} onHide={onHide} selected={selected} />
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
      <Tip classname={styles.tip} onSetTip={onSetTip} />
    </>
  );
}
