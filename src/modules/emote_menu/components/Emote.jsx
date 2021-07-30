import React, {useEffect, useState} from 'react';
import styles from '../styles/emotes.module.css';

export default function Emote({code, data, onClick, ...restProps}) {
  if (!data?.images) return null;

  const [loadImage, setLoadImage] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadImage(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button {...restProps} type="button" className={styles.button} onClick={onClick}>
      {loadImage && <img alt={code} src={data.images['1x']} />}
    </button>
  );
}
