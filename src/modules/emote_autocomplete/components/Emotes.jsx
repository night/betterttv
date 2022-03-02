import React, {useEffect, useRef, useState} from 'react';
import {AutoSizer, List} from 'react-virtualized';
import useChatInput from '../hooks/ChatInput.jsx';
import styles from './Emotes.module.css';
import keyCodes from '../../../utils/keycodes.js';
import renderRow from './EmoteRow.jsx';
import EmotesHeader from './EmotesHeader.jsx';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';

const MAX_EMOTES_SHOWN = 8;
const EMOTE_ROW_HEIGHT = 32;
const BOTTOM_OFFSET = 120; // height of everything below the chat window

function calcMaxHeight(length) {
  let currentHeight = length * EMOTE_ROW_HEIGHT;

  if (length > MAX_EMOTES_SHOWN) {
    currentHeight = MAX_EMOTES_SHOWN * EMOTE_ROW_HEIGHT;
  }

  if (currentHeight > window.innerHeight - BOTTOM_OFFSET) {
    currentHeight = window.innerHeight - BOTTOM_OFFSET;
  }

  return currentHeight;
}

function travelUp(currentSelection, rowCount) {
  const newSelection = currentSelection - 1;

  if (newSelection <= -1) {
    return rowCount - 1;
  }

  return newSelection;
}

function travelDown(currentSelection, rowCount) {
  const newSelection = currentSelection + 1;

  if (newSelection > rowCount - 1) {
    return 0;
  }

  return newSelection;
}

export default function Emotes({chatInputElement, repositionPopover, onComplete, getAutocomplete}) {
  const [emotes, setEmotes] = useChatInput(chatInputElement, getAutocomplete);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(true);
  const localRef = useRef(null);

  useEffect(() => repositionPopover(), [emotes.length]);

  function handleAutocomplete(emote) {
    setEmotes([]);
    emoteMenuViewStore.trackHistory(emotes);
    onComplete(emote);
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (localRef.current == null) {
        return;
      }

      setOpen(localRef.current.contains(event.target));
    }

    window.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [localRef.current, setOpen]);

  useEffect(() => {
    function keydownCallback(event) {
      if (getAutocomplete() == null) {
        setEmotes([]);
        return;
      }

      switch (event.key) {
        case keyCodes.Enter:
        case keyCodes.Tab:
          event.preventDefault();
          event.stopPropagation();
          handleAutocomplete(emotes[selected]);
          break;
        case keyCodes.End:
          event.preventDefault();
          setSelected(emotes.length);
          break;
        case keyCodes.Home:
          event.preventDefault();
          setSelected(0);
          break;
        case keyCodes.ArrowUp:
          event.preventDefault();
          setSelected(travelUp(selected, emotes.length));
          break;
        case keyCodes.ArrowDown:
          event.preventDefault();
          setSelected(travelDown(selected, emotes.length));
          break;
        default:
          setOpen(true);
          setSelected(0);
      }
    }

    window.addEventListener('keydown', keydownCallback, true);

    return () => {
      window.removeEventListener('keydown', keydownCallback, true);
    };
  }, [emotes, selected]);

  if (!open || emotes.length === 0) {
    return null;
  }

  return (
    <div className={styles.emotes} ref={localRef}>
      <EmotesHeader getAutocomplete={getAutocomplete} />
      <AutoSizer disableHeight>
        {({width}) => (
          <List
            className={styles.scrollContainer}
            scrollToIndex={selected}
            width={width}
            height={calcMaxHeight(emotes.length)}
            rowHeight={EMOTE_ROW_HEIGHT}
            rowRenderer={(args) =>
              renderRow({
                emote: emotes[args.index],
                selected,
                setSelected,
                handleAutocomplete,
                ...args,
              })
            }
            rowCount={emotes.length}
          />
        )}
      </AutoSizer>
    </div>
  );
}
