import classNames from 'classnames';
import {ChevronRight, Gift} from 'lucide-react';
import React, {useCallback} from 'react';
import formatMessage from '@/i18n/index';
import {openLegendaryEmoteChests, openLegendaryEmotesCollection} from '@/modules/emote_menu/twitch/legendary-emotes';
import useLegendaryEmotesStore, {
  invalidateLegendaryEmoteSeason,
} from '@/modules/emote_menu/twitch/legendary-emotes-store';
import styles from './LegendaryEmotesEntrypoint.module.css';

// sits in the twitch global section header and links to twitch's own legendary emotes panels
function LegendaryEmotesEntrypoint({className, onClose}) {
  const season = useLegendaryEmotesStore((state) => state.season);

  const handleOpenCollection = useCallback(() => {
    if (season == null) {
      return;
    }
    onClose?.();
    invalidateLegendaryEmoteSeason(season.channelId);
    openLegendaryEmotesCollection(season.channelId);
  }, [season, onClose]);

  const handleOpenChests = useCallback(() => {
    if (season == null) {
      return;
    }
    onClose?.();
    invalidateLegendaryEmoteSeason(season.channelId);
    openLegendaryEmoteChests(season.channelId, season.chestCounts);
  }, [season, onClose]);

  if (season == null) {
    return null;
  }

  const seasonName = season.name || formatMessage({defaultMessage: 'Legendary Emotes'});
  // the label counts the same chests as the badge, and only calls them premium when they all are
  const {unopenedChestCount, premiumChestCount} = season;
  const chestsLabel =
    premiumChestCount === unopenedChestCount
      ? formatMessage(
          {defaultMessage: '{count, plural, one {Open # Premium Emote Chest} other {Open # Premium Emote Chests}}'},
          {count: unopenedChestCount}
        )
      : formatMessage(
          {defaultMessage: '{count, plural, one {Open # Emote Chest} other {Open # Emote Chests}}'},
          {count: unopenedChestCount}
        );

  return (
    <div className={classNames(styles.entrypoint, className)}>
      {unopenedChestCount > 0 ? (
        <button
          type="button"
          className={styles.chestsButton}
          onClick={handleOpenChests}
          aria-label={chestsLabel}
          title={chestsLabel}>
          <Gift className={styles.icon} />
          {unopenedChestCount.toLocaleString()}
        </button>
      ) : null}
      <button
        type="button"
        className={styles.collectionButton}
        onClick={handleOpenCollection}
        aria-label={formatMessage(
          {defaultMessage: 'Open {seasonName}, {ownedCount, number} of {totalCount, number} collected'},
          {seasonName, ownedCount: season.ownedCount, totalCount: season.totalCount}
        )}
        title={seasonName}>
        {season.imageURL != null ? <img src={season.imageURL} alt="" className={styles.image} /> : null}
        <span className={styles.progress}>
          {formatMessage(
            {defaultMessage: '{ownedCount, number}/{totalCount, number}'},
            {ownedCount: season.ownedCount, totalCount: season.totalCount}
          )}
        </span>
        <ChevronRight className={styles.icon} />
      </button>
    </div>
  );
}

export default LegendaryEmotesEntrypoint;
