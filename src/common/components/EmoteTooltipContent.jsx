import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import styles from './EmoteTooltipContent.module.css';
import formatMessage from '../../i18n';
import {LoaderIconIndicator} from './LoaderIcon.jsx';

function getAspectRatio(image) {
  if (image == null) {
    return null;
  }

  const {naturalWidth, naturalHeight} = image;
  return naturalWidth > 0 && naturalHeight > 0 ? naturalWidth / naturalHeight : null;
}

function EmoteTooltipContent({imageSrc, sourceImage, code, provider, channelName}) {
  const imageRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(() => getAspectRatio(sourceImage) ?? 1);
  const [imageLoaded, setImageLoaded] = useState(false);

  useLayoutEffect(() => {
    const image = imageRef.current;
    if (image == null || !image.complete) {
      return;
    }

    const ratio = getAspectRatio(image);
    if (ratio != null) {
      setAspectRatio(ratio);
    }

    setImageLoaded(true);
  }, []);

  const handleLoad = useCallback((event) => {
    const ratio = getAspectRatio(event.currentTarget);

    if (ratio != null) {
      setAspectRatio(ratio);
    }

    setImageLoaded(true);
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.imageWrapper} style={{aspectRatio}}>
        <img
          ref={imageRef}
          className={classNames(styles.image, {[styles.imageLoading]: !imageLoaded})}
          src={imageSrc}
          alt={formatMessage({defaultMessage: 'Emote {code}'}, {code})}
          onLoad={handleLoad}
          onError={() => setImageLoaded(true)}
        />
        {imageLoaded ? null : (
          <div className={styles.spinner}>
            <LoaderIconIndicator />
          </div>
        )}
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
