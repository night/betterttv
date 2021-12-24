import React, {useEffect, useMemo, useState} from 'react';
import {Button} from 'rsuite';
import useChatInput from '../hooks/ChatInput.jsx';
import Emote from '../../../common/components/Emote.jsx';
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

const shortenName = (displayName) => displayName.split(' ')[0];

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
        <Button key={emote.id} active={index === selectedEmote} className={styles.emoteContainer}>
          <div className={styles.emote}>
            <Emote emote={emote} />
            <div className={styles.emoteCode}>{emote.code}</div>
          </div>
          <div className={styles.categoryName}>{shortenName(emote.category.displayName)}</div>
        </Button>
      ))}
    </div>
  );
}
