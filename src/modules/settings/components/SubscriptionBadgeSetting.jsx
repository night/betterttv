import {faQuestion, faRepeat} from '@fortawesome/free-solid-svg-icons';
import {Skeleton} from '@mantine/core';
import classNames from 'classnames';
import {DateTime} from 'luxon';
import React, {useCallback, useEffect, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {updateSubscriptionBadge} from '@/actions/account';
import {updateUserSubscriptionBadge} from '@/actions/users';
import Icon from '@/common/components/Icon';
import useDebouncedRemoteState from '@/common/hooks/DebouncedRemoteState';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import formatMessage from '@/i18n';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import useSubscriptionBadgeEligibilityStore, {fetchEligibility} from '@/stores/subscription-badge-eligibility';
import {getCurrentChannel} from '@/utils/channel';
import SettingRadioCard from './SettingRadioCard';
import SettingRadioCardGroup from './SettingRadioCardGroup';
import SettingSwitch from './SettingSwitch';
import styles from './SubscriptionBadgeSetting.module.css';

const LATEST = 'latest';
const NEXT = 'next';

// padded so the refetch at zero can't catch the api before it considers the badge unlocked
const UNLOCK_COUNTDOWN_BUFFER = {minutes: 1};

function getUnlockCountdown(unlocksAt, nowMillis) {
  return DateTime.fromISO(unlocksAt)
    .plus(UNLOCK_COUNTDOWN_BUFFER)
    .diff(DateTime.fromMillis(nowMillis), ['days', 'hours', 'minutes', 'seconds'])
    .mapUnits((value) => Math.max(0, Math.trunc(value)));
}

function BadgeImage({src}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <React.Fragment>
      {!loaded ? <Skeleton className={styles.badge} /> : null}
      <img
        src={src}
        className={classNames(styles.badge, {[styles.badgeLoading]: !loaded})}
        onLoad={() => setLoaded(true)}
        alt=""
      />
    </React.Fragment>
  );
}

function SubscriptionBadgeSetting() {
  const {user, updateUser} = useAuthStore(useShallow((state) => ({user: state.user, updateUser: state.updateUser})));

  // persisted eligibility may belong to a previous session's account; only use it for the current user
  const {eligibleBadges, nextBadgeUnlocksAt} = useSubscriptionBadgeEligibilityStore(
    useShallow((state) => ({
      eligibleBadges: user != null && state.userId === user.id ? state.eligibleBadges : null,
      nextBadgeUnlocksAt: user != null && state.userId === user.id ? state.nextBadgeUnlocksAt : null,
    }))
  );

  useEffect(() => {
    fetchEligibility();
  }, [user]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (nextBadgeUnlocksAt == null) {
      return undefined;
    }

    const unlocksAtMillis = DateTime.fromISO(nextBadgeUnlocksAt).plus(UNLOCK_COUNTDOWN_BUFFER).toMillis();
    if (Date.now() >= unlocksAtMillis) {
      return undefined;
    }

    const interval = setInterval(() => {
      const nowMillis = Date.now();
      setNow(nowMillis);

      if (nowMillis >= unlocksAtMillis) {
        clearInterval(interval);
        fetchEligibility({force: true});
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [nextBadgeUnlocksAt]);

  const [badge, setBadge] = useDebouncedRemoteState({
    value: user?.subscriptionBadge === true,
    onSave: async (value, {signal}) => {
      await updateSubscriptionBadge(value, {signal});
      updateUser({...useAuthStore.getState().user, subscriptionBadge: value});
      const currentChannel = getCurrentChannel();
      if (currentChannel == null) {
        return;
      }

      socketClient.broadcastMe(currentChannel.provider, currentChannel.id);
    },
  });

  const [badgeEnabled, setBadgeEnabled] = useProRequiredState({
    value: badge,
    defaultValue: false,
    setValue: setBadge,
  });

  const [selectedBadgeId, setSelectedBadgeId] = useDebouncedRemoteState({
    value: user?.subscriptionBadgeId ?? LATEST,
    onSave: async (newValue, {signal}) => {
      const badgeId = newValue === LATEST ? null : newValue;
      await updateUserSubscriptionBadge(useAuthStore.getState().user.id, badgeId, {signal});

      const selectedBadge =
        badgeId != null
          ? eligibleBadges.find((eligibleBadge) => eligibleBadge.badgeId === badgeId)
          : eligibleBadges[eligibleBadges.length - 1];
      updateUser({
        ...useAuthStore.getState().user,
        subscriptionBadgeId: badgeId,
        subscriptionBadgeUrl: selectedBadge.badgeUrl,
      });
      const currentChannel = getCurrentChannel();
      if (currentChannel == null) {
        return;
      }

      socketClient.broadcastMe(currentChannel.provider, currentChannel.id);
    },
  });

  const handleBadgeChange = useCallback(
    (newValue) => {
      if (newValue === NEXT) {
        return;
      }

      setBadgeEnabled(true);
      setSelectedBadgeId(newValue);
    },
    [setBadgeEnabled, setSelectedBadgeId]
  );

  const nextBadgeCountdown = nextBadgeUnlocksAt != null ? getUnlockCountdown(nextBadgeUnlocksAt, now) : null;

  const badgeLabel = formatMessage({defaultMessage: 'BetterTTV Pro Badge'});
  const latestBadgeLabel = formatMessage({defaultMessage: 'Use latest badge'});
  const nextBadgeLabel =
    nextBadgeUnlocksAt != null
      ? formatMessage(
          {defaultMessage: 'Unlocks {timeUntilUnlock}'},
          {timeUntilUnlock: DateTime.fromISO(nextBadgeUnlocksAt).toRelative()}
        )
      : null;

  return (
    <React.Fragment>
      <SettingSwitch
        showProBadge
        name={formatMessage({defaultMessage: 'Subscriber Badge'})}
        description={formatMessage({
          defaultMessage: 'Show a BetterTTV Pro badge next to your name when you type in chat.',
        })}
        value={badgeEnabled}
        onChange={setBadgeEnabled}
      />
      {eligibleBadges != null && eligibleBadges.length > 0 ? (
        <SettingRadioCardGroup value={selectedBadgeId} onChange={handleBadgeChange}>
          <SettingRadioCard
            value={LATEST}
            className={styles.badgeCard}
            tooltip={latestBadgeLabel}
            ariaLabel={latestBadgeLabel}
            withIndicators={false}>
            <Icon icon={faRepeat} className={styles.latestBadgeIcon} />
          </SettingRadioCard>
          {eligibleBadges.map(({badgeId, badgeUrl}) => (
            <SettingRadioCard
              key={badgeId}
              value={badgeId}
              className={styles.badgeCard}
              ariaLabel={badgeLabel}
              withIndicators={false}>
              <BadgeImage src={badgeUrl} />
            </SettingRadioCard>
          ))}
          {nextBadgeUnlocksAt != null ? (
            <SettingRadioCard
              value={NEXT}
              locked
              withIndicators={false}
              className={classNames(styles.badgeCard, styles.nextBadgeCard)}
              tooltip={
                <div className={styles.countdownTooltip}>
                  {formatMessage(
                    {defaultMessage: '{days}d {hours}h {minutes}m {seconds}s'},
                    {
                      days: nextBadgeCountdown.days,
                      hours: nextBadgeCountdown.hours,
                      minutes: nextBadgeCountdown.minutes,
                      seconds: nextBadgeCountdown.seconds,
                    }
                  )}
                </div>
              }
              ariaLabel={nextBadgeLabel}>
              <div className={classNames(styles.badge, styles.nextBadgePlaceholder)}>
                <Icon icon={faQuestion} className={styles.nextBadgeIcon} />
              </div>
            </SettingRadioCard>
          ) : null}
        </SettingRadioCardGroup>
      ) : null}
    </React.Fragment>
  );
}

export default SubscriptionBadgeSetting;
