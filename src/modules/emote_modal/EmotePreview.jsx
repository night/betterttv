import {faArrowUpRightFromSquare} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import React from 'react';
import Icon from '@/common/components/Icon';
import formatMessage from '@/i18n/index';
import {EmoteProviderMetadata, getEmotePageUrl} from '@/utils/emote';
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
        {formatMessage(
          {defaultMessage: 'Open on {provider}'},
          {provider: EmoteProviderMetadata[emote.category?.provider]?.displayName}
        )}
        <Icon icon={faArrowUpRightFromSquare} size={12} />
      </span>
    </a>
  );
}
