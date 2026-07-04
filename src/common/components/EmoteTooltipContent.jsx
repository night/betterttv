import classNames from 'classnames';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import formatMessage from '@/i18n';
import styles from './EmoteTooltipContent.module.css';

function getAspectRatio(image) {
  if (image == null) {
    return null;
  }

  const {naturalWidth, naturalHeight} = image;
  return naturalWidth > 0 && naturalHeight > 0 ? naturalWidth / naturalHeight : null;
}

function EmoteTooltipContent({imageSrc, sourceImage, code, provider, channelName}) {
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(() => getAspectRatio(sourceImage) ?? 1);
  const placeholderSrc = sourceImage?.currentSrc ?? sourceImage?.src ?? null;

  const handleLoad = useCallback((event) => {
    const ratio = getAspectRatio(event.currentTarget);

    if (ratio != null) {
      setAspectRatio(ratio);
    }

    setImageLoaded(true);
  }, []);

  // the preview may already be cached, in which case onLoad never fires
  useLayoutEffect(() => {
    if (imageRef.current?.complete !== true) {
      return;
    }

    // eslint-disable-next-line @eslint-react/set-state-in-effect -- image load state is synced from the img element via an effect
    setImageLoaded(true);
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.imageWrapper} style={{aspectRatio}}>
        {imageLoaded === false && placeholderSrc != null ? (
          <img
            className={classNames(styles.image, styles.placeholder)}
            src={placeholderSrc}
            alt={formatMessage({defaultMessage: 'Emote {code}'}, {code})}
          />
        ) : null}
        <img
          ref={imageRef}
          className={classNames(styles.image, {
            [styles.imageLoading]: imageLoaded === false,
          })}
          src={imageSrc}
          alt={formatMessage({defaultMessage: 'Emote {code}'}, {code})}
          onLoad={handleLoad}
          onError={handleLoad}
        />
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
