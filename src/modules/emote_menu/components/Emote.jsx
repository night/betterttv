import React, {useState} from 'react';
import styles from '../styles/emotes.module.css';

export default function Emote({emote, ...restProps}) {
  if (!emote) return null;
  const [code, data] = emote;
  const [loaded, setLoaded] = useState(false);

  return (
    <button key={code} {...restProps} type="button" className={styles.button}>
      <img
        src={data.images['1x']}
        style={!loaded ? {visibility: 'hidden'} : {}}
        alt={code}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && <div className={styles.placeholder} />}
    </button>
  );
}
