import {Text} from '@mantine/core';
import {DateTime} from 'luxon';
import React from 'react';
import {EmoteCategories, EmoteProviders} from '@/constants';
import formatMessage from '@/i18n/index';
import {getCurrentChannel} from '@/utils/channel';
import {getObjectIdTimestamp} from '@/utils/object-id';
import styles from './EmoteModal.module.css';

const GLOBAL_EMOTE_CATEGORY_IDS = [
  EmoteCategories.BETTERTTV_GLOBAL,
  EmoteCategories.FRANKERFACEZ_GLOBAL,
  EmoteCategories.SEVENTV_GLOBAL,
];

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
  const currentChannel = getCurrentChannel();
  const isGlobalEmote = GLOBAL_EMOTE_CATEGORY_IDS.includes(emote.category?.id);
  const createdAt = emoteCreatedAt(emote);
  const channelName = isGlobalEmote
    ? formatMessage({defaultMessage: 'Global'})
    : (currentChannel?.displayName ?? currentChannel?.name ?? null);
  const uploadedBy = emote.channel?.displayName ?? emote.channel?.name ?? null;

  return (
    <div className={styles.metadata}>
      <MetadataRow label={formatMessage({defaultMessage: 'Channel'})}>{channelName}</MetadataRow>
      <MetadataRow label={formatMessage({defaultMessage: 'Uploaded On'})}>
        {createdAt != null ? createdAt.toLocaleString(DateTime.DATE_MED) : null}
      </MetadataRow>
      <MetadataRow label={formatMessage({defaultMessage: 'Uploaded By'})}>{uploadedBy}</MetadataRow>
    </div>
  );
}
