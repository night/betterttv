import classNames from 'classnames';
import {ChevronRight} from 'lucide-react';
import React, {useCallback} from 'react';
import formatMessage from '@/i18n/index';
import {openLegendaryEmoteChests, openLegendaryEmotesCollection} from '@/modules/emote_menu/twitch/legendary-emotes';
import useLegendaryEmotesStore from '@/modules/emote_menu/twitch/legendary-emotes-store';
import styles from './LegendaryEmotesEntrypoint.module.css';

function LegendaryEmotesEntrypoint({className, onClose}) {
  const season = useLegendaryEmotesStore((state) => state.season);

  const handleOpenCollection = useCallback(() => {
    if (season == null) {
      return;
    }
    onClose();
    openLegendaryEmotesCollection(season.channelId);
  }, [season, onClose]);

  const handleOpenChests = useCallback(() => {
    if (season == null) {
      return;
    }
    onClose();
    openLegendaryEmoteChests(season.channelId, season.chestCounts);
  }, [season, onClose]);

  if (season == null) {
    return null;
  }

  const seasonName = season.name || formatMessage({defaultMessage: 'Legendary Emotes'});

  return (
    <div className={classNames(styles.entrypoint, className)}>
      <button
        type="button"
        className={styles.collectionButton}
        onClick={handleOpenCollection}
        aria-label={formatMessage({defaultMessage: 'Open {seasonName}'}, {seasonName})}>
        {season.imageURL != null ? <img src={season.imageURL} alt="" className={styles.image} /> : null}
        <span className={styles.name}>{seasonName}</span>
        <span className={styles.progress}>
          {formatMessage(
            {defaultMessage: '{ownedCount, number}/{totalCount, number}'},
            {ownedCount: season.ownedCount, totalCount: season.totalCount}
          )}
        </span>
        <ChevronRight className={styles.chevron} />
      </button>
      {season.unopenedChestCount > 0 ? (
        <button type="button" className={styles.chestsButton} onClick={handleOpenChests}>
          {season.hasUnopenedPremiumChests
            ? formatMessage(
                {
                  defaultMessage:
                    '{count, plural, one {Open # Premium Emote Chest} other {Open # Premium Emote Chests}}',
                },
                {count: season.chestCounts.paidCount + season.chestCounts.ftueCount}
              )
            : formatMessage(
                {defaultMessage: '{count, plural, one {Open # Emote Chest} other {Open # Emote Chests}}'},
                {count: season.chestCounts.freeCount}
              )}
        </button>
      ) : null}
    </div>
  );
}

export default LegendaryEmotesEntrypoint;
