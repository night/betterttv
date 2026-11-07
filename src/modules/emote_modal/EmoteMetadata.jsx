import {Text} from '@mantine/core';
import {DateTime} from 'luxon';
import React from 'react';
import {EmoteProviders} from '@/constants';
import formatMessage from '@/i18n/index';
import {getObjectIdTimestamp} from '@/utils/object-id';
import styles from './EmoteModal.module.css';

function emoteCreatedAt(emote) {
  const provider = emote.category?.provider;
  if (provider === EmoteProviders.BETTERTTV) {
    return getObjectIdTimestamp(emote.id);
  }

  if (provider === EmoteProviders.SEVENTV && emote.metadata?.createdAt != null) {
    return DateTime.fromMillis(emote.metadata.createdAt);
  }

  return null;
}

function MetadataRow({label, children}) {
  if (children == null) {
    return null;
  }

  return (
    <div className={styles.metadataRow}>
      <Text className={styles.metadataLabel}>{label}</Text>
      <Text className={styles.metadataValue}>{children}</Text>
    </div>
  );
}

export default function EmoteMetadata({emote}) {
  const createdAt = emoteCreatedAt(emote);
  const uploadedBy = emote.channel?.displayName ?? emote.channel?.name ?? null;

  return (
    <div className={styles.metadata}>
      <MetadataRow label={formatMessage({defaultMessage: 'Uploaded On'})}>
        {createdAt != null ? createdAt.toLocaleString(DateTime.DATE_MED) : null}
      </MetadataRow>
      <MetadataRow label={formatMessage({defaultMessage: 'Uploaded By'})}>{uploadedBy}</MetadataRow>
    </div>
  );
}
