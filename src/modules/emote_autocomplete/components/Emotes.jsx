import React, {useEffect, useMemo} from 'react';
import {Button} from 'rsuite';
import {List, WindowScroller} from 'react-virtualized';
import useChatInput from '../hooks/ChatInput.jsx';
import Emote from '../../../common/components/Emote.jsx';
import styles from './Emotes.module.css';
import useRowNavigation from '../hooks/RowKeyboardNavigation.jsx';
import {isEmoteAutocompletable} from '../../../utils/autocomplete.js';
import keyCodes from '../../../utils/keycodes.js';

const MAX_EMOTES_SHOWN = 8;
const EMOTE_ROW_HEIGHT = 36;
const BOTTOM_OFFSET = 120; // height of everything below the chat window

function calcMaxHeight() {
  const canShow = (window.innerHeight - BOTTOM_OFFSET) / EMOTE_ROW_HEIGHT;

  if (canShow >= MAX_EMOTES_SHOWN) {
    return MAX_EMOTES_SHOWN;
  }

  return canShow;
}

let navigationCallback;
function setNavigationCallback(callback) {
  navigationCallback = callback;
}

function renderRow(emote, key, style, index, selected, setSelected, handleAutcomplete) {
  return (
    <Button
      key={key}
      style={style}
      active={index === selected}
      onMouseOver={() => setSelected(index)}
      onClick={() => handleAutcomplete(emote)}
      appearance="subtle"
      className={styles.emoteContainer}>
      <div className={styles.emote}>
        <Emote emote={emote} />
        <div className={styles.emoteCode}>{emote.code}</div>
      </div>
      <div className={styles.categoryName}>{emote.category.displayName}</div>
    </Button>
  );
}

export default function Emotes({chatInputElement, repositionPopover, autocomplete}) {
  const [emotes, setEmotes] = useChatInput(chatInputElement);
  const [selected, setSelected] = useRowNavigation(setNavigationCallback, emotes.length);

  useEffect(() => repositionPopover(), [emotes.length]);

  function handleAutcomplete(emote) {
    setEmotes([]);
    autocomplete(emote);
  }

  useEffect(() => {
    function keydownCallback(event) {
      event.stopPropagation();

      if (!isEmoteAutocompletable()) {
        return;
      }

      if (event.key === keyCodes.Enter || event.key === keyCodes.Tab) {
        event.preventDefault();
        handleAutcomplete(emotes[selected]);
        return;
      }

      navigationCallback(event);
    }

    window.addEventListener('keydown', keydownCallback, true);

    return () => {
      window.removeEventListener('keydown', keydownCallback, true);
    };
  }, [emotes, selected]);

  if (emotes.length === 0) {
    return null;
  }

  return (
    <div className={styles.emotes}>
      <List
        width={500}
        height={300}
        rowHeight={30}
        rowRenderer={({index, key, style}) =>
          renderRow(emotes[index], key, style, index, selected, setSelected, handleAutcomplete)
        }
        rowCount={emotes.length}
      />
    </div>
  );
}
