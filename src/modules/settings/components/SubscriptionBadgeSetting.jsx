import {Skeleton} from '@mantine/core';
import classNames from 'classnames';
import {CircleQuestionMark, Repeat, X} from 'lucide-react';
import {DateTime} from 'luxon';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {updateSubscriptionBadge, updateSubscriptionBadgeId} from '@/actions/account';
import useDebouncedRemoteState from '@/common/hooks/DebouncedRemoteState';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import formatMessage from '@/i18n';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import useFeatureEligibilityStore, {fetchEligibility} from '@/stores/feature-eligibility';
import {getCurrentChannel} from '@/utils/channel';
import {isUserPro} from '@/utils/pro';
import SettingGroup from './SettingGroup';
import SettingRadioCard from './SettingRadioCard';
import SettingRadioCardGroup from './SettingRadioCardGroup';
import SettingSwitch from './SettingSwitch';
import SettingWrapper from './SettingWrapper';
import styles from './SubscriptionBadgeSetting.module.css';

const LATEST = 'latest';
const NEXT = 'next';
const DISABLED = 'disabled';

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

function SubscriptionBadgeSetting({name, ref, ...props}) {
  const {user, updateUser} = useAuthStore(useShallow((state) => ({user: state.user, updateUser: state.updateUser})));

  // persisted eligibility may belong to a previous session's account; only use it for the current user
  const badgeEligibility = useFeatureEligibilityStore((state) =>
    user != null && state.userId === user.id ? state.eligibility?.badges : null
  );
  const nextBadgeUnlocksAt = badgeEligibility?.nextBadgeUnlocksAt ?? null;
  const eligibleBadges = useMemo(
    () => (badgeEligibility?.eligibleBadges != null ? [...badgeEligibility.eligibleBadges].reverse() : null),
    [badgeEligibility?.eligibleBadges]
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
    onSave: async (value, {signal, isStale}) => {
      await updateSubscriptionBadge(value, {signal});
      if (isStale()) {
        return;
      }

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
    onSave: async (newValue, {signal, isStale}) => {
      const badgeId = newValue === LATEST ? null : newValue;
      await updateSubscriptionBadgeId(badgeId, {signal});

      if (isStale()) {
        return;
      }

      const selectedBadge =
        badgeId != null ? eligibleBadges.find((eligibleBadge) => eligibleBadge.badgeId === badgeId) : eligibleBadges[0];
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

      if (newValue === DISABLED) {
        setBadgeEnabled(false);
        return;
      }

      if (!badgeEnabled) {
        setBadgeEnabled(true);
      }
      setSelectedBadgeId(newValue);
    },
    [badgeEnabled, setBadgeEnabled, setSelectedBadgeId]
  );

  const nextBadgeCountdown = nextBadgeUnlocksAt != null ? getUnlockCountdown(nextBadgeUnlocksAt, now) : null;

  const isPro = isUserPro(user);

  const badgeLabel = formatMessage({defaultMessage: 'BetterTTV Pro Badge'});
  const latestBadgeLabel = formatMessage({defaultMessage: 'Use latest badge'});
  const disableBadgeLabel = formatMessage({defaultMessage: 'Disable badge'});
  const nextBadgeLabel =
    nextBadgeUnlocksAt != null
      ? formatMessage(
          {defaultMessage: 'Unlocks {timeUntilUnlock}'},
          {timeUntilUnlock: DateTime.fromISO(nextBadgeUnlocksAt).toRelative()}
        )
      : null;

  const hasBadgeChoices = isPro && eligibleBadges != null && eligibleBadges.length > 0;
  const badgeTitle = formatMessage({defaultMessage: 'Display your badge'});
  const badgeDescription = formatMessage({
    defaultMessage: 'Everyone using BetterTTV sees it when you type in chat.',
  });

  return (
    <SettingGroup ref={ref} {...props} name={name} withPane={!hasBadgeChoices}>
      {!isPro ? (
        <SettingSwitch
          name={badgeTitle}
          description={badgeDescription}
          value={badgeEnabled}
          onChange={setBadgeEnabled}
        />
      ) : null}
      {isPro && !hasBadgeChoices ? <SettingWrapper reverse name={badgeTitle} description={badgeDescription} /> : null}
      {hasBadgeChoices ? (
        <SettingRadioCardGroup
          value={!badgeEnabled ? DISABLED : selectedBadgeId}
          onChange={handleBadgeChange}
          fixedCardWidth>
          <SettingRadioCard
            value={DISABLED}
            tooltip={disableBadgeLabel}
            ariaLabel={disableBadgeLabel}
            withIndicators={false}>
            <X className={styles.cardIcon} />
          </SettingRadioCard>
          <SettingRadioCard
            value={LATEST}
            tooltip={latestBadgeLabel}
            ariaLabel={latestBadgeLabel}
            withIndicators={false}>
            <Repeat className={styles.cardIcon} />
          </SettingRadioCard>
          {eligibleBadges.map(({badgeId, badgeUrl}) => (
            <SettingRadioCard key={badgeId} value={badgeId} ariaLabel={badgeLabel} withIndicators={false}>
              <BadgeImage src={badgeUrl} />
            </SettingRadioCard>
          ))}
          {nextBadgeUnlocksAt != null ? (
            <SettingRadioCard
              value={NEXT}
              withIndicators={false}
              className={styles.nextBadgeCard}
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
                <CircleQuestionMark className={styles.nextBadgeIcon} />
              </div>
            </SettingRadioCard>
          ) : null}
        </SettingRadioCardGroup>
      ) : null}
    </SettingGroup>
  );
}

export default SubscriptionBadgeSetting;
