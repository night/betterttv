import React from 'react';
import {Icon} from '@rsuite/icons';
import IconButton from 'rsuite/IconButton';
import * as faStar from '@fortawesome/free-solid-svg-icons/faStar';
import styles from './Preview.module.css';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';
import Emote from '../../../common/components/Emote.jsx';

export default function Preview({emote, isFavorite}) {
  if (emote == null) return null;

  return (
    <div className={styles.preview} key={emote.code}>
      <div className={styles.content}>
        <Emote className={styles.emoteImage} emote={emote} />
        <div>
          <div className={styles.emoteCode}>{emote.code}</div>
          <div>from {emote.category.displayName}</div>
        </div>
      </div>
      {isFavorite ? <IconButton icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faStar} />} /> : null}
    </div>
  );
}
