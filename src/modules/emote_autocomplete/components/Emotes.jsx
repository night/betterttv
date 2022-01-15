import React, {useEffect, useMemo} from 'react';
import {Button} from 'rsuite';
import useChatInput from '../hooks/ChatInput.jsx';
import Emote from '../../../common/components/Emote.jsx';
import styles from './Emotes.module.css';
import useRowNavigation from '../hooks/RowKeyboardNavigation.jsx';
import {isEmoteAutocompletable} from '../../../utils/autocomplete.js';
import keyCodes from '../../../utils/keycodes.js';

const MAX_EMOTES_SHOWN = 10;
const EMOTE_ROW_HEIGHT = 36;
const BOTTOM_OFFSET = 120; // height of everything below the chat window

function calcMaxHeight() {
  const canShow = (window.innerHeight - BOTTOM_OFFSET) / EMOTE_ROW_HEIGHT;

  if (canShow >= MAX_EMOTES_SHOWN) {
    return MAX_EMOTES_SHOWN;
  }

  return canShow;
}

const shortenName = (displayName) => displayName.split(' ')[0];

let chatInputCallback;
function setChatInputCallback(callback) {
  chatInputCallback = callback;
}

let navigationCallback;
function setNavigationCallback(callback) {
  navigationCallback = callback;
}

export default function Emotes({chatInputElement, repositionPopover, autocomplete}) {
  const [emotes, setEmotes] = useChatInput(setChatInputCallback);
  const shortEmotes = useMemo(() => emotes.slice(0, calcMaxHeight()), [emotes]);
  const [selected, setSelected] = useRowNavigation(setNavigationCallback, shortEmotes.length);

  useEffect(() => repositionPopover(), [emotes]);

  function handleAutcomplete({code}) {
    setEmotes([]);
    autocomplete(code);
  }

  useEffect(() => {
    function keydownCallback(event) {
      if (!isEmoteAutocompletable()) {
        setEmotes([]);
        return;
      }

      switch (event.key) {
        case keyCodes.Enter:
        case keyCodes.Tab:
          event.stopImmediatePropagation();
          handleAutcomplete(shortEmotes[selected]);
          return;
        default:
          break;
      }

      chatInputCallback(event);
      navigationCallback(event);
    }

    chatInputElement.addEventListener('keydown', keydownCallback);

    return () => {
      chatInputElement.removeEventListener('keydown', keydownCallback);
    };
  }, [chatInputCallback, navigationCallback, shortEmotes, selected]);

  if (shortEmotes.length === 0) {
    return null;
  }

  return (
    <div className={styles.emotes}>
      {shortEmotes.map((emote, index) => (
        <Button
          key={emote.id}
          active={index === selected}
          onMouseOver={() => setSelected(index)}
          onClick={() => handleAutcomplete(emote)}
          appearance="subtle"
          className={styles.emoteContainer}>
          <div className={styles.emote}>
            <Emote emote={emote} isButton={false} />
            <div className={styles.emoteCode}>{emote.code}</div>
          </div>
          <div className={styles.categoryName}>{shortenName(emote.category.displayName)}</div>
        </Button>
      ))}
    </div>
  );
}
