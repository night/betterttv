import React, {useEffect, useRef, useState, useMemo} from 'react';
import keyCodes from '../../../utils/keycodes.js';
import useChatInputPartialEmote from '../../hooks/ChatInputPartialInput.jsx';
import useEmoteMenuViewStoreUpdated from '../../hooks/EmoteMenuViewStore.jsx';
import emoteMenuViewStore from '../../stores/emote-menu-view-store.js';
import styles from './Items.module.css';
import ItemsHeader from './ItemsHeader.jsx';

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

export default function Items({
  chatInputElement,
  repositionPopover,
  onComplete,
  getChatInputPartialInput,
  renderRow,
  computeMatches,
}) {
  const chatInputPartialEmote = useChatInputPartialEmote(chatInputElement, getChatInputPartialInput);
  const [matches, setMatches] = useState([]);
  const shortMatches = useMemo(() => matches.slice(0, MAX_EMOTES_SHOWN), [matches]);

  useEffect(() => {
    setMatches(computeMatches(chatInputPartialEmote));
  }, [chatInputPartialEmote]);

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(true);

  useEmoteMenuViewStoreUpdated(open, computeMatches);

  const localRef = useRef(null);

  useEffect(() => {
    repositionPopover();
  }, [matches.length]);

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
      if (getChatInputPartialInput() == null) {
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
      <ItemsHeader chatInputPartialEmote={chatInputPartialEmote} />
      {shortMatches.map((emote, index) =>
        renderRow({
          key: emote.id,
          index,
          item: emote,
          handleAutocomplete,
          active: selected === index,
          setSelected,
        })
      )}
    </div>
  );
}
