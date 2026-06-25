import {Button, Text} from '@mantine/core';
import {useQuery} from '@tanstack/react-query';
import {DateTime} from 'luxon';
import React, {useCallback, useState} from 'react';
import {EmoteCategories} from '@/constants';
import formatMessage from '@/i18n/index';
import {getCurrentChannel} from '@/utils/channel';
import {getEmoteImageType} from '@/utils/emote';
import {createSrc} from '@/utils/image';
import {getEmoteModalDetails} from './utils';
import styles from './EmoteModal.module.css';

const GLOBAL_EMOTE_CATEGORY_IDS = [
  EmoteCategories.BETTERTTV_GLOBAL,
  EmoteCategories.FRANKERFACEZ_GLOBAL,
  EmoteCategories.SEVENTV_GLOBAL,
];

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

export default function EmoteModalContent({emote, onClose}) {
  const [dimensions, setDimensions] = useState(null);

  const {data: details} = useQuery({
    queryKey: ['emote-modal-details', emote.category?.provider, emote.id],
    queryFn: () => getEmoteModalDetails(emote),
  });

  const imageSrc = createSrc(emote.images, false, '4x');
  const isEmoji = emote.category?.id === EmoteCategories.BETTERTTV_EMOJI;
  const isGlobalEmote = GLOBAL_EMOTE_CATEGORY_IDS.includes(emote.category?.id);

  const handleImageLoad = useCallback((event) => {
    const {naturalWidth, naturalHeight} = event.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setDimensions({width: naturalWidth, height: naturalHeight});
    }
  }, []);

  const currentChannel = getCurrentChannel();
  const createdAt = details?.createdAt != null ? DateTime.fromISO(details.createdAt) : null;
  const channelName = isEmoji
    ? formatMessage({defaultMessage: 'BetterTTV Emojis'})
    : isGlobalEmote
      ? formatMessage({defaultMessage: 'Global'})
      : (currentChannel?.displayName ?? currentChannel?.name ?? null);
  const uploadedBy = details?.user?.displayName ?? details?.user?.name ?? null;
  const fileType = getEmoteImageType(emote);
  const fileMetadata =
    fileType != null && dimensions != null ? `${fileType} (${dimensions.width}x${dimensions.height})` : fileType;

  return (
    <React.Fragment>
      <div className={styles.content}>
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={imageSrc}
            alt={formatMessage({defaultMessage: 'Emote {code}'}, {code: emote.code})}
            onLoad={handleImageLoad}
          />
        </div>
        <div className={styles.metadata}>
          <MetadataRow label={formatMessage({defaultMessage: 'Channel'})}>{channelName}</MetadataRow>
          <MetadataRow label={formatMessage({defaultMessage: 'Added On'})}>
            {createdAt != null ? createdAt.toLocaleString(DateTime.DATE_MED) : null}
          </MetadataRow>
          <MetadataRow label={formatMessage({defaultMessage: 'Uploaded By'})}>{uploadedBy}</MetadataRow>
          <MetadataRow label={formatMessage({defaultMessage: 'File Metadata'})}>{fileMetadata}</MetadataRow>
        </div>
      </div>
      <div className={styles.footer}>
        <Button variant="elevated" size="lg" onClick={onClose}>
          {formatMessage({defaultMessage: 'Close'})}
        </Button>
      </div>
    </React.Fragment>
  );
}
