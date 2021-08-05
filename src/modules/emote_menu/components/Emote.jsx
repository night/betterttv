import React, {useState} from 'react';
import styles from '../styles/emotes.module.css';

export default function Emote({emote, ...restProps}) {
  if (!emote) return null;
  const [loaded, setLoaded] = useState(false);

  return (
    <button key={emote.code} {...restProps} type="button" className={styles.emote}>
      <img
        src={emote.images['1x']}
        style={!loaded ? {visibility: 'hidden'} : {}}
        alt={emote.code}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && <div className={styles.placeholder} />}
    </button>
  );
}
