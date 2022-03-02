import React, {useEffect, useRef, useState, useMemo} from 'react';
import keyCodes from '../../../utils/keycodes.js';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import useChatInputPartialEmote from '../hooks/ChatInputPartialEmote.jsx';
import useEmoteMenuViewStore from '../../../common/hooks/EmoteMenuViewStore.jsx';
import EmoteRow from './EmoteRow.jsx';
import EmotesHeader from './EmotesHeader.jsx';
import styles from './Emotes.module.css';

const MAX_EMOTES_SHOWN = 8;
const EMOTE_ROW_HEIGHT = 32;
const BOTTOM_OFFSET = 120; // height of everything below the chat window

function calcMaxVisibleEmotes(length) {
  let currentMax = length * EMOTE_ROW_HEIGHT;

  if (length > MAX_EMOTES_SHOWN) {
    currentMax = MAX_EMOTES_SHOWN;
  }

  const maxVisibleEmotesInViewport = Math.floor((window.innerHeight - BOTTOM_OFFSET) / EMOTE_ROW_HEIGHT);
  if (currentMax > maxVisibleEmotesInViewport) {
    return maxVisibleEmotesInViewport;
  }

  return currentMax;
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

export default function Emotes({chatInputElement, repositionPopover, onComplete, getChatInputPartialEmote}) {
  const [chatInputPartialEmote] = useChatInputPartialEmote(chatInputElement, getChatInputPartialEmote);
  const [matches, setMatches] = useState([]);
  const shortMatches = useMemo(() => matches.slice(0, calcMaxVisibleEmotes(matches.length)), [matches]);

  function computeMatches() {
    const searchedEmotes = emoteMenuViewStore.search(chatInputPartialEmote);
    setMatches(searchedEmotes.map(({item}) => item));
  }

  useEmoteMenuViewStore(computeMatches);
  useEffect(computeMatches, [chatInputPartialEmote]);

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(true);

  const localRef = useRef(null);

  useEffect(() => repositionPopover(), [matches.length]);

  function handleAutocomplete(emote) {
    setMatches([]);
    emoteMenuViewStore.trackHistory(emote);
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
      if (getChatInputPartialEmote() == null) {
        setMatches([]);
        return;
      }

      switch (event.key) {
        case keyCodes.Enter:
        case keyCodes.Tab:
          event.preventDefault();
          event.stopPropagation();
          handleAutocomplete(matches[selected]);
          break;
        case keyCodes.End:
          event.preventDefault();
          setSelected(matches.length);
          break;
        case keyCodes.Home:
          event.preventDefault();
          setSelected(0);
          break;
        case keyCodes.ArrowUp:
          event.preventDefault();
          setSelected(travelUp(selected, matches.length));
          break;
        case keyCodes.ArrowDown:
          event.preventDefault();
          setSelected(travelDown(selected, matches.length));
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
  }, [matches, selected]);

  if (!open || matches.length === 0) {
    return null;
  }

  return (
    <div className={styles.emotes} ref={localRef}>
      <EmotesHeader chatInputPartialEmote={chatInputPartialEmote} />
      {shortMatches.map((emote, index) => (
        <EmoteRow
          index={index}
          emote={emote}
          handleAutocomplete={(newEmote) => handleAutocomplete(newEmote)}
          active={selected === index}
          setSelected={(newEmote) => setSelected(newEmote)}
        />
      ))}
    </div>
  );
}
