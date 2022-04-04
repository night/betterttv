import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import keyCodes from '../../../utils/keycodes.js';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import useChatInputPartialEmote from '../hooks/ChatInputPartialEmote.jsx';
import EmoteRow from './EmoteRow.jsx';
import EmotesHeader from './EmotesHeader.jsx';
import styles from './Emotes.module.css';
import useEmoteMenuViewStoreUpdated from '../../../common/hooks/EmoteMenuViewStore.jsx';

const MAX_EMOTES_SHOWN = 8;

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
  const chatInputPartialEmote = useChatInputPartialEmote(chatInputElement, getChatInputPartialEmote);
  const [matches, setMatches] = useState([]);
  const shortMatches = useMemo(() => matches.slice(0, MAX_EMOTES_SHOWN), [matches]);

  const computeMatches = useCallback(() => {
    const searchedEmotes = emoteMenuViewStore.search(chatInputPartialEmote);
    setMatches(searchedEmotes.map(({item}) => item));
  }, [chatInputPartialEmote]);

  useEffect(computeMatches, [chatInputPartialEmote]);

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(true);

  useEmoteMenuViewStoreUpdated(open, computeMatches);

  const localRef = useRef(null);

  useEffect(() => repositionPopover(), [matches.length]);

  function handleAutocomplete(emote) {
    setMatches([]);
    emoteMenuViewStore.trackHistory(emote);
    onComplete(emote);
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      const {current} = localRef;

      if (current == null) {
        return;
      }

      setOpen(current.contains(event.target));
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
          handleAutocomplete(shortMatches[selected]);
          break;
        case keyCodes.End:
          event.preventDefault();
          setSelected(shortMatches.length);
          break;
        case keyCodes.Home:
          event.preventDefault();
          setSelected(0);
          break;
        case keyCodes.ArrowUp:
          event.preventDefault();
          setSelected((prevSelected) => travelUp(prevSelected, shortMatches.length));
          break;
        case keyCodes.ArrowDown:
          event.preventDefault();
          setSelected((prevSelected) => travelDown(prevSelected, shortMatches.length));
          break;
        default:
          setOpen(true);
          setSelected(0);
      }
    }

    chatInputElement.addEventListener('keydown', keydownCallback, true);

    return () => {
      chatInputElement.removeEventListener('keydown', keydownCallback, true);
    };
  }, [shortMatches, selected, chatInputElement]);

  if (!open || shortMatches.length === 0) {
    return null;
  }

  return (
    <div className={styles.emotes} ref={localRef}>
      <EmotesHeader chatInputPartialEmote={chatInputPartialEmote} />
      {shortMatches.map((emote, index) => (
        <EmoteRow
          key={emote.id}
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
