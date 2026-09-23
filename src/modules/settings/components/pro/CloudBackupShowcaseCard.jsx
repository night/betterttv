import {Title} from '@mantine/core';
import React, {useState} from 'react';
import formatMessage from '@/i18n/index';
import cdn from '@/utils/cdn';
import styles from './CloudBackupShowcaseCard.module.css';
import cardStyles from './ShowcaseCard.module.css';

const DATA_STREAM_GLYPHS = ['0', '1', '<', '>', '{', '}', '#', '/', '$', '%', '&', '*'];

const DATA_STREAMS = [
  {id: 'stream-1', glyphClassName: styles.cloudGlyphOuterLeft},
  {id: 'stream-2', glyphClassName: styles.cloudGlyphLeft},
  {id: 'stream-3', glyphClassName: styles.cloudGlyphCenter},
  {id: 'stream-4', glyphClassName: styles.cloudGlyphRight},
  {id: 'stream-5', glyphClassName: styles.cloudGlyphOuterRight},
];

const DATA_STREAM_SLOTS = Array.from({length: 12}, (_, slotIndex) => `slot-${slotIndex}`);

function randomGlyphColumn(length) {
  return Array.from({length}, () => DATA_STREAM_GLYPHS[Math.floor(Math.random() * DATA_STREAM_GLYPHS.length)]);
}

function CloudBackupShowcaseCard() {
  const [streamGlyphs] = useState(() => DATA_STREAMS.map(() => randomGlyphColumn(DATA_STREAM_SLOTS.length)));

  return (
    <div className={cardStyles.showcaseCard}>
      {/* the cloud and beams are baked: their svg filter stack re-rasterized on every scroll frame */}
      <img className={styles.cloudBeams} src={cdn.url('assets/pro/cloud_beams.webp')} alt="" loading="lazy" />
      <div className={styles.cloudStreams} aria-hidden="true">
        {DATA_STREAMS.map((stream, streamIndex) => (
          <React.Fragment key={stream.id}>
            {DATA_STREAM_SLOTS.map((slotKey, slotIndex) => (
              <span key={`${stream.id}-${slotKey}`} className={stream.glyphClassName} style={{'--slot': slotIndex}}>
                {streamGlyphs[streamIndex][slotIndex]}
              </span>
            ))}
          </React.Fragment>
        ))}
      </div>
      <span className={styles.cloudIconBob}>
        <img className={styles.cloudGraphic} src={cdn.url('assets/pro/cloud_bank.webp')} alt="" loading="lazy" />
      </span>
      <img className={styles.cloudAppIcon} src={cdn.url('assets/pro/cloud_server.webp')} alt="" loading="lazy" />
      <Title order={3} className={cardStyles.showcaseLabel}>
        {formatMessage({defaultMessage: 'Cloud Backups & Synchronized Sessions'})}
      </Title>
    </div>
  );
}

export default CloudBackupShowcaseCard;
