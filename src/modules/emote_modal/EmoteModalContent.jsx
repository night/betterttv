import {Button} from '@mantine/core';
import React from 'react';
import formatMessage from '@/i18n/index';
import EmoteAddButtons from './EmoteAddButtons';
import EmoteMetadata from './EmoteMetadata';
import styles from './EmoteModal.module.css';
import EmotePreview from './EmotePreview';

export default function EmoteModalContent({emote, onClose}) {
  return (
    <React.Fragment>
      <div className={styles.content}>
        <EmotePreview emote={emote} />
        <EmoteMetadata emote={emote} />
      </div>
      <div className={styles.footer}>
        <Button variant="elevated" size="lg" onClick={onClose}>
          {formatMessage({defaultMessage: 'Close'})}
        </Button>
        <EmoteAddButtons emote={emote} />
      </div>
    </React.Fragment>
  );
}
