import React from 'react';
import Divider from 'rsuite/lib/Divider/index.js';
import Emote from './Emote.jsx';
import {useEmotesState} from './Store.jsx';
import styles from '../styles/emotes.module.css';

function EmotesComponent({onChange, search, ...restProps}) {
  const [emotes] = useEmotesState();

  return (
    <div {...restProps}>
      {Object.entries(emotes).map(([key, value]) => {
        const subEmotes = Array.from(value.emotes);
        if (subEmotes.length === 0) return null;
        const emotesComponents = subEmotes.map(([id, emote]) => (
          <Emote id={id} data={emote} onClick={() => onChange(emote)} />
        ));
        if (emotesComponents.every((component) => component == null)) return null;

        return (
          <>
            <Divider className={styles.divider}>{key}</Divider>
            <div className={styles.emotes}>{emotesComponents}</div>
          </>
        );
      })}
    </div>
  );
}

export default React.memo(EmotesComponent);
