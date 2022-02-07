import React, {useCallback, useEffect, useState} from 'react';
import Divider from 'rsuite/Divider';
import keycodes from '../../../utils/keycodes.js';
import {EmoteMenuTips} from '../../../constants.js';
import emoteMenuViewStore, {CategoryPositions} from '../stores/emote-menu-view-store.js';
import styles from './EmoteMenu.module.css';
import Emotes from './Emotes.jsx';
import Header from './Header.jsx';
import Preview from './Preview.jsx';
import Sidebar from './Sidebar.jsx';
import Tip, {markTipAsSeen} from './Tip.jsx';

let keyPressCallback;
function setKeyPressCallback(newKeyPressCallback) {
  keyPressCallback = newKeyPressCallback;
}

export default function EmoteMenu({toggleWhisper, appendToChat, onSetTip}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [, setUpdated] = useState(false);
  const [altPressed, setAltPressed] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [section, setSection] = useState({
    eventKey: null,
    scrollTo: false,
  });

  const handleClick = useCallback(
    (emote) => {
      if (altPressed) {
        emoteMenuViewStore.toggleFavorite(emote);
        markTipAsSeen(EmoteMenuTips.EMOTE_MENU_FAVORITE_EMOTE);
        return;
      }

      appendToChat(emote, !shiftPressed);
      emoteMenuViewStore.trackHistory(emote);

      if (shiftPressed) {
        markTipAsSeen(EmoteMenuTips.EMOTE_MENU_PREVENT_CLOSE);
        return;
      }

      toggleWhisper();
    },
    [altPressed, shiftPressed, toggleWhisper]
  );

  useEffect(() => {
    function buttonPressCallback(event) {
      setAltPressed(event.altKey);
      setShiftPressed(event.shiftKey);
    }

    function callback(event) {
      buttonPressCallback(event);

      if (event.key === keycodes.Enter) {
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
      if (!emoteMenuViewStore.isLoaded()) return;
      emoteMenuViewStore.once('updated', () => {
        setUpdated((prev) => !prev);
      });
    };

    callback();

    const cleanup = emoteMenuViewStore.on('dirty', callback);
    return () => cleanup();
  }, []);

  useEffect(() => setSearch(''), [section]);

  return (
    <>
      <Header
        className={styles.header}
        value={search}
        onChange={setSearch}
        toggleWhisper={toggleWhisper}
        selected={selected}
      />
      <Divider className={styles.divider} />
      <div className={styles.contentContainer}>
        <Sidebar
          className={styles.sidebar}
          section={section}
          onClick={(eventKey) => setSection({eventKey, scrollTo: true})}
          categories={{
            top: emoteMenuViewStore.getCategories(CategoryPositions.TOP),
            middle: emoteMenuViewStore.getCategories(CategoryPositions.MIDDLE),
            bottom: emoteMenuViewStore.getCategories(CategoryPositions.BOTTOM),
          }}
        />
        <div className={styles.content}>
          <Emotes
            className={styles.emotes}
            search={search}
            section={section}
            onClick={handleClick}
            setKeyPressCallback={setKeyPressCallback}
            rows={emoteMenuViewStore.rows}
            setSelected={setSelected}
            onSection={(eventKey) => setSection({eventKey, scrollTo: false})}
          />
          <Divider className={styles.divider} />
          <Preview emote={selected} isFavorite={selected == null ? false : emoteMenuViewStore.hasFavorite(selected)} />
        </div>
      </div>
      <Tip classname={styles.tip} onSetTip={onSetTip} />
    </>
  );
}
