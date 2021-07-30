import React, {useState} from 'react';
import styles from '../styles/emotes.module.css';

export default function Emote({emote, ...restProps}) {
  const [code, data] = emote;
  const [loaded, setLoaded] = useState(false);

  return (
    <button {...restProps} type="button" className={styles.button}>
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
