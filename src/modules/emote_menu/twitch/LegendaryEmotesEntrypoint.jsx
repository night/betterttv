import classNames from 'classnames';
import {ChevronRight, Gift} from 'lucide-react';
import React, {useCallback} from 'react';
import formatMessage from '@/i18n/index';
import {openLegendaryEmoteChests, openLegendaryEmotesCollection} from '@/modules/emote_menu/twitch/legendary-emotes';
import useLegendaryEmotesStore from '@/modules/emote_menu/twitch/legendary-emotes-store';
import styles from './LegendaryEmotesEntrypoint.module.css';

// sits in the twitch global section header and links to twitch's own legendary emotes panels
function LegendaryEmotesEntrypoint({className, onClose}) {
  const season = useLegendaryEmotesStore((state) => state.season);

  const handleOpenCollection = useCallback(() => {
    if (season == null) {
      return;
    }
    onClose?.();
    openLegendaryEmotesCollection(season.channelId);
  }, [season, onClose]);

  const handleOpenChests = useCallback(() => {
    if (season == null) {
      return;
    }
    onClose?.();
    openLegendaryEmoteChests(season.channelId, season.chestCounts);
  }, [season, onClose]);

  if (season == null) {
    return null;
  }

  const seasonName = season.name || formatMessage({defaultMessage: 'Legendary Emotes'});
  const chestsLabel = season.hasUnopenedPremiumChests
    ? formatMessage(
        {defaultMessage: '{count, plural, one {Open # Premium Emote Chest} other {Open # Premium Emote Chests}}'},
        {count: season.chestCounts.paidCount + season.chestCounts.ftueCount}
      )
    : formatMessage(
        {defaultMessage: '{count, plural, one {Open # Emote Chest} other {Open # Emote Chests}}'},
        {count: season.chestCounts.freeCount}
      );

  return (
    <div className={classNames(styles.entrypoint, className)}>
      {season.unopenedChestCount > 0 ? (
        <button
          type="button"
          className={styles.chestsButton}
          onClick={handleOpenChests}
          aria-label={chestsLabel}
          title={chestsLabel}>
          <Gift className={styles.icon} />
          {formatMessage({defaultMessage: '{count, number}'}, {count: season.unopenedChestCount})}
        </button>
      ) : null}
      <button
        type="button"
        className={styles.collectionButton}
        onClick={handleOpenCollection}
        aria-label={formatMessage({defaultMessage: 'Open {seasonName}'}, {seasonName})}
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
