import React, {useEffect, useState} from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import styles from '../styles/preview.module.css';
import emoteStorage from '../stores/emote-storage.js';
import {createSrcSet} from '../../../utils/image.js';

function PreviewEmote({emote}) {
  if (emote == null) return null;

  const [favorite, setFavorite] = useState(emoteStorage.favorites.has(emote.id));

  useEffect(() => {
    function callback() {
      setFavorite(emoteStorage.favorites.has(emote.id));
    }

    callback();

    emoteStorage.on('save', callback);

    return () => {
      emoteStorage.off('save', callback);
    };
  }, [emote]);

  return (
    <div className={styles.preview} key={emote.code}>
      <div className={styles.content}>
        <div className={styles.emoji}>
          <img
            alt={emote.name}
            className={styles.emoteImage}
            srcSet={createSrcSet(emote.images)}
            src={emote.images['2x']}
          />
        </div>
        <div>
          <div className={styles.emoteCode}>{emote.code}</div>
          <div>from {emote.provider.displayName}</div>
        </div>
      </div>
      {favorite ? (
        <IconButton
          onClick={() => emoteStorage.setFavorite(emote, false)}
          icon={
            <Icon>
              <FontAwesomeIcon icon={faStar} />
            </Icon>
          }
        />
      ) : null}
    </div>
  );
}

export default React.memo(PreviewEmote, (oldProps, newProps) => oldProps.emote?.id === newProps.emote?.id);
