import React from 'react';
import LazyLoad from 'react-lazy-load';
import styles from '../styles/emotes.module.css';

export default function Emote({code, data, onClick, ...restProps}) {
  if (!data?.images) return null;
  return (
    <button {...restProps} type="button" className={styles.button} onClick={onClick}>
      <LazyLoad offsetBottom={100}>
        <img alt={code} src={data.images['1x']} />
      </LazyLoad>
    </button>
  );
}
