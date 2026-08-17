import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {Text} from '@mantine/core';
import classNames from 'classnames';
import React, {useMemo} from 'react';
import {updateUsernameEffect} from '../../../actions/account';
import Icon from '../../../common/components/Icon';
import useCurrentUser from '../../../common/hooks/CurrentUser';
import useUsernameEffectSetting, {NONE} from '../../../common/hooks/UsernameEffectSetting';
import effects from '../../../common/styles/UsernameEffects.module.css';
import {openSignInModal, openSubscriptionUpgradeModal} from '../../../common/utils/modal';
import {CHAT_COLOR_USERNAME_EFFECTS, UsernameEffectFields, UsernameEffects} from '../../../constants';
import formatMessage from '../../../i18n/index';
import useAuthStore from '../../../stores/auth';
import {isUserPro} from '../../../utils/pro';
import twitch from '../../../utils/twitch';
import {getCurrentUser, getPreviewDisplayName} from '../../../utils/user';
import SettingRadioCard from './SettingRadioCard';
import SettingRadioCardGroup from './SettingRadioCardGroup';
import styles from './SettingUsernameEffect.module.css';
import SettingWrapper from './SettingWrapper';

function getChatColorStyle(effect, chatColor) {
  if (!CHAT_COLOR_USERNAME_EFFECTS.includes(effect) || chatColor == null) {
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

function isEligibleForUsernameEffect(eligibility, value) {
  return eligibility?.usernameEffects?.[value] === true;
}

function openUsernameEffectSubscriptionUpgradeModal(value, callback) {
  const displayName = getPreviewDisplayName(getCurrentUser(), useAuthStore.getState().user);
  const chatColor = twitch.getCurrentUserChatColor();
  const upgradeDisabled = isUserPro(useAuthStore.getState().user) && value !== UsernameEffects.IRIDESCENCE;

  return openSubscriptionUpgradeModal(
    {
      title: UsernameEffectRequirementDisplayTitleByEffect[value],
      children: <UsernameEffectRequirementDisplay value={value} displayName={displayName} chatColor={chatColor} />,
      confirmProps: {size: 'lg', variant: 'elevated', color: 'contrast', disabled: upgradeDisabled},
    },
    callback
  );
}

function openUsernameEffectSignInModal(value, callback) {
  const displayName = getPreviewDisplayName(getCurrentUser(), useAuthStore.getState().user);
  const chatColor = twitch.getCurrentUserChatColor();

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
  const user = useAuthStore((state) => state.user);
  const chatColor = useMemo(() => twitch.getCurrentUserChatColor(), []);

  const [value, handleChange] = useUsernameEffectSetting({
    userField: UsernameEffectFields.EFFECT,
    saveEffect: updateUsernameEffect,
    isEligible: isEligibleForUsernameEffect,
    openSignInModal: openUsernameEffectSignInModal,
    openUpgradeModal: openUsernameEffectSubscriptionUpgradeModal,
  });

  return (
    <React.Fragment>
      <SettingWrapper
        reverse
        name={formatMessage({defaultMessage: 'Username effect'})}
        description={formatMessage({defaultMessage: 'Choose how your username is styled in chat.'})}
        showProBadge
      />
      <div className={styles.cards}>
        <SettingRadioCardGroup value={value} onChange={handleChange} capAtFourPerRow>
          <SettingRadioCard
            key={NONE}
            value={NONE}
            className={styles.usernameCard}
            tooltip={formatMessage({defaultMessage: 'Disable effect'})}
            ariaLabel={formatMessage({defaultMessage: 'Disable effect'})}
            withIndicators={false}>
            <Icon icon={faXmark} className={styles.cardIcon} />
          </SettingRadioCard>
          {EFFECT_CARDS.map(({value: effectValue, label}) => (
            <SettingRadioCard
              key={effectValue}
              value={effectValue}
              className={styles.usernameCard}
              tooltip={label}
              ariaLabel={label}
              withIndicators={false}>
              <Text
                truncate
                size="xl"
                style={getChatColorStyle(effectValue, chatColor)}
                className={UsernameEffectRequirementClassNamesByEffect[effectValue]}>
                {getPreviewDisplayName(currentUser, user)}
              </Text>
            </SettingRadioCard>
          ))}
        </SettingRadioCardGroup>
      </div>
    </React.Fragment>
  );
}

export default SettingUsernameEffect;
