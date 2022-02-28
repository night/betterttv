import React, {useEffect} from 'react';
import {AutoSizer, List} from 'react-virtualized';
import useChatInput from '../hooks/ChatInput.jsx';
import styles from './Emotes.module.css';
import useRowNavigation from '../hooks/RowKeyboardNavigation.jsx';
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

let navigationCallback;
function setNavigationCallback(callback) {
  navigationCallback = callback;
}

export default function Emotes({chatInputElement, repositionPopover, onComplete, getAutocomplete}) {
  const [emotes, setEmotes] = useChatInput(chatInputElement, getAutocomplete);
  const [selected, setSelected] = useRowNavigation(setNavigationCallback, emotes.length);

  useEffect(() => repositionPopover(), [emotes.length]);

  function handleAutocomplete(emote) {
    setEmotes([]);
    emoteMenuViewStore.trackHistory(emotes);
    onComplete(emote);
  }

  useEffect(() => {
    function keydownCallback(event) {
      if (getAutocomplete() == null) {
        setEmotes([]);
        return;
      }

      if (event.key === keyCodes.Enter || event.key === keyCodes.Tab) {
        event.stopPropagation();
        event.preventDefault();
        handleAutocomplete(emotes[selected]);
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
      <EmotesHeader getAutocomplete={getAutocomplete} />
      <AutoSizer disableHeight>
        {({width}) => (
          <List
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
