import React, {useState} from 'react';
import Button from 'rsuite/lib/Button/index.js';
import styles from '../styles/emotes.module.css';

export default function Emote({emote, ...restProps}) {
  if (!emote) return null;
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Button key={emote.code} {...restProps} type="button" className={styles.emote}>
        <img
          srcSet={`${emote.images['1x']} 1x, ${emote.images['2x']} 2x, ${emote.images['3x']} 4x`}
          src={emote.images['1x']}
          style={!loaded ? {visibility: 'hidden'} : {}}
          alt={emote.code}
          onLoad={() => setLoaded(true)}
        />
      </Button>
      {!loaded && <div className={styles.placeholder} />}
    </>
  );
}
