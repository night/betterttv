import React from 'react';
import LazyLoad from 'react-lazy-load';
import styles from '../styles/emotes.module.css';

export default function Emote({id, data}) {
  if (!data?.images) return null;
  return (
    <button key={id} type="button" className={styles.button}>
      <LazyLoad offsetBottom={100}>
        <img alt={id} src={data.images['1x']} />
      </LazyLoad>
    </button>
  );
}
