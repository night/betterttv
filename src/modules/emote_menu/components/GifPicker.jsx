import {RingProgress} from '@mantine/core';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';
import {LoaderIconIndicator} from '@/common/components/LoaderIcon';
import scrollbarStyles from '@/common/styles/Scrollbar.module.css';
import formatMessage from '@/i18n/index';
import useGifPickerStore, {GIF_COOLDOWN_SECONDS, startGifCooldown} from '@/modules/emote_menu/stores/gif-picker-store';
import {sendGifMessage} from '@/modules/emote_menu/utils/twitch-gifs';
import EmptyState from './EmptyState';
import styles from './GifPicker.module.css';

function GifsUnavailable({className}) {
  return (
    <EmptyState className={className}>{formatMessage({defaultMessage: 'GIFs are currently unavailable'})}</EmptyState>
  );
}

function GifsSubscriberRequired({className}) {
  return (
    <EmptyState className={className}>
      {formatMessage({defaultMessage: 'Only Tier 2 and Tier 3 subscribers can send GIFs in this channel.'})}
    </EmptyState>
  );
}

function GifImage({gif}) {
  return (
    <img
      src={gif.previewUrl}
      alt={gif.title}
      loading="lazy"
      width={gif.width}
      height={gif.height}
      className={styles.gifImage}
    />
  );
}

function GifSendButton({canSend}) {
  // subscribed here so the per-second ticks only re-render the pills, not the
  // whole grid of tiles
  const cooldownSeconds = useGifPickerStore((state) => state.cooldownSecondsRemaining);

  if (!canSend && cooldownSeconds === 0) {
    return null;
  }

  const cooldownPercentage = Math.min(100, (cooldownSeconds / GIF_COOLDOWN_SECONDS) * 100);

  return (
    <div className={styles.sendOverlay}>
      <div className={styles.sendButton}>
        {cooldownSeconds > 0 ? (
          <RingProgress
            className={styles.cooldownRing}
            size={24}
            thickness={4}
            rootColor="var(--gif-cooldown-ring-root-color)"
            sections={[{value: cooldownPercentage, color: 'var(--gif-cooldown-ring-color)'}]}
          />
        ) : null}
        {formatMessage({defaultMessage: 'Send'})}
      </div>
    </div>
  );
}

function GifItem({gif, canSend, onClick}) {
  const handleClick = useCallback(() => onClick(gif), [onClick, gif]);

  return (
    <button
      type="button"
      disabled={!canSend}
      aria-label={formatMessage({defaultMessage: 'Send GIF'})}
      className={styles.gifItem}
      onClick={handleClick}>
      {gif.previewWebpUrl != null ? (
        <picture>
          <source srcSet={gif.previewWebpUrl} type="image/webp" />
          <GifImage gif={gif} />
        </picture>
      ) : (
        <GifImage gif={gif} />
      )}
      <GifSendButton canSend={canSend} />
    </button>
  );
}

function GifPicker({gifContext, onSend, className}) {
  const gifs = useGifPickerStore((state) => state.gifs);
  const loading = useGifPickerStore((state) => state.loadingGifs);
  // boolean selector, so ticks mid-cooldown don't re-render the grid
  const onCooldown = useGifPickerStore((state) => state.cooldownSecondsRemaining > 0);
  const [sending, setSending] = useState(false);
  const [temporarilyUnavailable, setTemporarilyUnavailable] = useState(false);

  const canSend = gifContext.canSend && !sending && !onCooldown;
  const unavailable = !gifContext.enabled || temporarilyUnavailable;

  const handleSendGif = useCallback(
    async (gif) => {
      setSending(true);
      const result = await sendGifMessage(gif);
      setSending(false);

      if (result.success) {
        // a successful send starts the server's cooldown, so surface it right
        // away rather than discovering it on the next failed send
        startGifCooldown(result.secondsUntilCanSend > 0 ? result.secondsUntilCanSend : GIF_COOLDOWN_SECONDS);
        onSend();
        return;
      }

      if (result.temporarilyUnavailable) {
        setTemporarilyUnavailable(true);
        return;
      }

      if (result.secondsUntilCanSend > 0) {
        startGifCooldown(result.secondsUntilCanSend);
      }
    },
    [onSend]
  );

  const handleGifClick = useCallback(
    (gif) => {
      if (!canSend) {
        return;
      }

      handleSendGif(gif);
    },
    [canSend, handleSendGif]
  );

  if (unavailable) {
    return <GifsUnavailable className={className} />;
  }

  if (!gifContext.canSend) {
    return <GifsSubscriberRequired className={className} />;
  }

  return (
    <div className={classNames(styles.gifPicker, scrollbarStyles.scroll, className)}>
      {gifs.length > 0 ? (
        <div className={styles.grid}>
          {gifs.map((gif) => (
            <GifItem key={gif.id} gif={gif} canSend={canSend} onClick={handleGifClick} />
          ))}
        </div>
      ) : null}
      {loading ? (
        <div className={styles.loading}>
          <LoaderIconIndicator />
        </div>
      ) : null}
      {!loading && gifs.length === 0 ? (
        <EmptyState>{formatMessage({defaultMessage: 'No results...'})}</EmptyState>
      ) : null}
    </div>
  );
}

export default React.memo(GifPicker);
