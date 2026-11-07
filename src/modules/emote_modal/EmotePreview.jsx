import classNames from 'classnames';
import {SquareArrowOutUpRight} from 'lucide-react';
import React from 'react';
import formatMessage from '@/i18n/index';
import {getEmotePageUrl} from '@/utils/emote';
import {createSrc} from '@/utils/image';
import styles from './EmoteModal.module.css';

function EmoteImage({emote}) {
  return (
    <img
      className={styles.image}
      src={createSrc(emote.images, false, '4x')}
      alt={formatMessage({defaultMessage: 'Emote {code}'}, {code: emote.code})}
    />
  );
}

// the preview doubles as a link to the emote's page, for providers that have one
export default function EmotePreview({emote}) {
  const emotePageUrl = getEmotePageUrl(emote.id, emote.category?.provider);

  if (emotePageUrl == null) {
    return (
      <div className={styles.imageWrapper}>
        <EmoteImage emote={emote} />
      </div>
    );
  }

  return (
    <a
      className={classNames(styles.imageWrapper, styles.imageLink)}
      href={emotePageUrl}
      target="_blank"
      rel="noreferrer">
      <EmoteImage emote={emote} />
      <span className={styles.emotePageOverlay}>
        {formatMessage({defaultMessage: 'Open emote page'})}
        <SquareArrowOutUpRight size={16} />
      </span>
    </a>
  );
}
