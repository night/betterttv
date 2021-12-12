import React, {useEffect, useMemo, useState} from 'react';
import useChatInput from '../hooks/ChatInput.jsx';
import Emote from './Emote.jsx';
import styles from './Emotes.module.css';

const DEFAULT_SELECTED_EMOTE = 0;
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

export default function Emotes({chatInputElement, repositionPopover}) {
  const [emotes] = useChatInput(chatInputElement);
  const [selectedEmote, setSelectedEmote] = useState(DEFAULT_SELECTED_EMOTE);
  const shortEmotes = useMemo(() => emotes.slice(0, calcMaxHeight()), [emotes]);

  useEffect(() => {
    setSelectedEmote(DEFAULT_SELECTED_EMOTE);
    repositionPopover();
  }, [emotes]);

  if (shortEmotes.length === 0) {
    return null;
  }

  return (
    <div className={styles.emotes}>
      {shortEmotes.map((emote, index) => (
        <Emote emote={emote} selected={index === selectedEmote} onHover={() => setSelectedEmote(index)} />
      ))}
    </div>
  );
}
