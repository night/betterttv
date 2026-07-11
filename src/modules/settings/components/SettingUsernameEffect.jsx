import {Text} from '@mantine/core';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {updateUserUsernameEffect} from '../../../actions/users';
import useCurrentUser from '../../../common/hooks/CurrentUser';
import useDebouncedRemoteState from '../../../common/hooks/DebouncedRemoteState';
import useStorageState from '../../../common/hooks/StorageState';
import effects from '../../../common/styles/UsernameEffects.module.css';
import {openSignInModal, openSubscriptionUpgradeModal} from '../../../common/utils/modal';
import {SettingIds, UsernameEffects} from '../../../constants';
import formatMessage from '../../../i18n/index';
import socketClient from '../../../socket-client';
import useAuthStore from '../../../stores/auth';
import useUsernameEffectEligibilityStore, {
  fetchEligibility,
  getEligibility,
} from '../../../stores/username-effect-eligibility';
import {getCurrentChannel} from '../../../utils/channel';
import twitch from '../../../utils/twitch';
import {getCurrentUser} from '../../../utils/user';
import SettingRadioCard from './SettingRadioCard';
import SettingRadioCardGroup from './SettingRadioCardGroup';
import SettingSwitch from './SettingSwitch';
import styles from './SettingUsernameEffect.module.css';

const NONE = 'none';

// glow and flare render over the user's own chat color, so their previews use it too
const CHAT_COLOR_EFFECTS = [UsernameEffects.GLOW, UsernameEffects.FLARE];

function getChatColorStyle(effect, chatColor) {
  if (!CHAT_COLOR_EFFECTS.includes(effect) || chatColor == null) {
    return undefined;
  }

  return {color: chatColor};
}

const EFFECT_CARDS = [
  {value: UsernameEffects.FLARE, label: formatMessage({defaultMessage: 'Flare'})},
  {value: UsernameEffects.GLACIER, label: formatMessage({defaultMessage: 'Glacier'})},
  {value: UsernameEffects.INTERGALACTIC, label: formatMessage({defaultMessage: 'Intergalactic'})},
  {value: UsernameEffects.SUPERNOVA, label: formatMessage({defaultMessage: 'Supernova'})},
  {value: UsernameEffects.MIDAS, label: formatMessage({defaultMessage: 'Midas'})},
  {value: UsernameEffects.IRIDESCENCE, label: formatMessage({defaultMessage: 'Iridescence'})},
  {value: UsernameEffects.GLOW, label: formatMessage({defaultMessage: 'Glow'})},
];

const UsernameEffectRequirementDisplayTitleByEffect = {
  [UsernameEffects.GLOW]: formatMessage({defaultMessage: 'Glow Effect'}),
  [UsernameEffects.FLARE]: formatMessage({defaultMessage: 'Flare Effect'}),
  [UsernameEffects.IRIDESCENCE]: formatMessage({defaultMessage: 'Iridescence Effect'}),
  [UsernameEffects.SUPERNOVA]: formatMessage({defaultMessage: 'Supernova Effect'}),
  [UsernameEffects.MIDAS]: formatMessage({defaultMessage: 'Midas Effect'}),
  [UsernameEffects.GLACIER]: formatMessage({defaultMessage: 'Glacier Effect'}),
  [UsernameEffects.INTERGALACTIC]: formatMessage({defaultMessage: 'Intergalactic Effect'}),
};

const UsernameEffectRequirementDisplayTextByEffect = {
  [UsernameEffects.GLOW]: formatMessage({defaultMessage: 'Rewarded after being subscribed for 10 years.'}),
  [UsernameEffects.FLARE]: formatMessage({defaultMessage: 'Rewarded to any Pro user.'}),
  [UsernameEffects.IRIDESCENCE]: formatMessage({defaultMessage: 'Rewarded to any annual Pro user.'}),
  [UsernameEffects.SUPERNOVA]: formatMessage({defaultMessage: 'Rewarded after being subscribed for 9 months.'}),
  [UsernameEffects.MIDAS]: formatMessage({defaultMessage: 'Rewarded after being subscribed for 12 months.'}),
  [UsernameEffects.GLACIER]: formatMessage({defaultMessage: 'Rewarded after being subscribed for 3 months.'}),
  [UsernameEffects.INTERGALACTIC]: formatMessage({defaultMessage: 'Rewarded after being subscribed for 6 months.'}),
};

const UsernameEffectRequirementClassNamesByEffect = {
  [UsernameEffects.GLOW]: classNames(styles.glowUsername, effects.glow),
  [UsernameEffects.FLARE]: classNames(styles.flareUsername, effects.flare),
  [UsernameEffects.IRIDESCENCE]: classNames(styles.flavorUsername, effects.iridescence),
  [UsernameEffects.SUPERNOVA]: classNames(styles.flavorUsername, effects.supernova),
  [UsernameEffects.MIDAS]: classNames(styles.flavorUsername, effects.midas),
  [UsernameEffects.GLACIER]: classNames(styles.flavorUsername, effects.glacier),
  [UsernameEffects.INTERGALACTIC]: classNames(styles.flavorUsername, effects.intergalactic),
};

function UsernameEffectRequirementDisplay({value, displayName, chatColor}) {
  return (
    <div className={styles.usernameEffectRequirement}>
      <div className={styles.usernamePreview}>
        <Text
          truncate
          style={getChatColorStyle(value, chatColor)}
          className={classNames(styles.previewUsername, UsernameEffectRequirementClassNamesByEffect[value])}>
          {displayName}
        </Text>
      </div>
      <Text c="dimmed" size="lg">
        {UsernameEffectRequirementDisplayTextByEffect[value]}
      </Text>
    </div>
  );
}

function openUsernameEffectSubscriptionUpgradeModal(callback = () => {}, {value, displayName, chatColor}) {
  return openSubscriptionUpgradeModal(
    {
      title: UsernameEffectRequirementDisplayTitleByEffect[value],
      children: <UsernameEffectRequirementDisplay value={value} displayName={displayName} chatColor={chatColor} />,
    },
    callback
  );
}

function openUsernameEffectSignInModal(callback = () => {}, {value, displayName, chatColor}) {
  return openSignInModal(
    {
      title: UsernameEffectRequirementDisplayTitleByEffect[value],
      children: <UsernameEffectRequirementDisplay value={value} displayName={displayName} chatColor={chatColor} />,
    },
    callback
  );
}

function SettingUsernameEffect() {
  const currentUser = useCurrentUser();
  const [usernameEffectsEnabled, setUsernameEffectsEnabled] = useStorageState(SettingIds.USERNAME_EFFECTS);
  const {user, updateUser} = useAuthStore(useShallow((state) => ({user: state.user, updateUser: state.updateUser})));
  // persisted eligibility may belong to a previous session's account; only use it for the current user
  const eligibility = useUsernameEffectEligibilityStore((state) =>
    user != null && state.userId === user.id ? state.eligibility : null
  );
  const chatColor = useMemo(() => twitch.getCurrentUserChatColor(), []);

  useEffect(() => {
    fetchEligibility();
  }, [user]);

  const [value, setValue] = useDebouncedRemoteState({
    value: user?.usernameEffect ?? NONE,
    onSave: async (newValue, {signal}) => {
      const effect = newValue === NONE ? null : newValue;
      await updateUserUsernameEffect(useAuthStore.getState().user.id, effect, {signal});
      updateUser({...useAuthStore.getState().user, usernameEffect: effect});

      const currentChannel = getCurrentChannel();
      if (currentChannel == null) {
        return;
      }

      socketClient.broadcastMe(currentChannel.provider, currentChannel.id);
    },
  });

  const getLockedState = useCallback(
    (usernameEffect) => eligibility == null || !eligibility[usernameEffect],
    [eligibility]
  );

  const handleChange = useCallback(
    async (newValue) => {
      const currentUser = getCurrentUser();
      const {user: currentAuthUser} = useAuthStore.getState();

      if (currentAuthUser == null) {
        openUsernameEffectSignInModal(() => handleChange(newValue), {
          value: newValue,
          displayName: currentUser.displayName,
          chatColor,
        });

        return;
      }

      if (newValue !== NONE) {
        // the cached eligibility may predate a free -> paid upgrade, so refetch before gating
        if (getEligibility()?.[newValue] !== true) {
          await fetchEligibility({force: true});
        }

        if (getEligibility()?.[newValue] !== true) {
          openUsernameEffectSubscriptionUpgradeModal(() => handleChange(newValue), {
            value: newValue,
            displayName: currentUser.displayName,
            chatColor,
          });

          return;
        }

        setUsernameEffectsEnabled(true);
      }

      setValue(newValue);
    },
    [setValue, setUsernameEffectsEnabled, chatColor]
  );

  return (
    <React.Fragment>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Username effect'})}
        description={formatMessage({defaultMessage: 'Choose how your username is styled in chat.'})}
        showBetaBadge
        showProBadge
        value={usernameEffectsEnabled}
        onChange={setUsernameEffectsEnabled}
      />
      <div className={styles.cards}>
        <SettingRadioCardGroup value={value} onChange={handleChange} capAtFourPerRow>
          <SettingRadioCard
            key={NONE}
            value={NONE}
            className={styles.usernameCard}
            tooltip={formatMessage({defaultMessage: 'None'})}
            ariaLabel={formatMessage({defaultMessage: 'None'})}>
            <Text truncate size="xl" className={styles.username}>
              {currentUser.displayName}
            </Text>
          </SettingRadioCard>
          {EFFECT_CARDS.map(({value: effectValue, label}) => (
            <SettingRadioCard
              key={effectValue}
              locked={getLockedState(effectValue)}
              value={effectValue}
              className={styles.usernameCard}
              tooltip={label}
              ariaLabel={label}>
              <Text
                truncate
                size="xl"
                style={getChatColorStyle(effectValue, chatColor)}
                className={UsernameEffectRequirementClassNamesByEffect[effectValue]}>
                {currentUser.displayName}
              </Text>
            </SettingRadioCard>
          ))}
        </SettingRadioCardGroup>
      </div>
    </React.Fragment>
  );
}

export default SettingUsernameEffect;
