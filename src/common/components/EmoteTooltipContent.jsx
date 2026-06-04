import React from 'react';
import styles from './EmoteTooltipContent.module.css';
import formatMessage from '../../i18n';

function EmoteTooltipContent({imageSrc, code, provider, channelName}) {
  return (
    <div className={styles.content}>
      <div className={styles.imageWrapper}>
        <img className={styles.image} src={imageSrc} alt={formatMessage({defaultMessage: 'Emote {code}'}, {code})} />
      </div>
      <div className={styles.details}>
        <div className={styles.name}>{code}</div>
        {channelName != null && channelName.length > 0 ? <div className={styles.channel}>{channelName}</div> : null}
        <div className={styles.provider}>{provider}</div>
      </div>
    </div>
  );
}

export default React.memo(EmoteTooltipContent);
