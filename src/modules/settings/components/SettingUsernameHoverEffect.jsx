import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {Text} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import {updateUsernameHoverEffect} from '../../../actions/account';
import Icon from '../../../common/components/Icon';
import UsernameEffectText from '../../../common/components/UsernameEffectText';
import useCurrentUser from '../../../common/hooks/CurrentUser';
import useUsernameEffectSetting, {NONE} from '../../../common/hooks/UsernameEffectSetting';
import effects from '../../../common/styles/UsernameEffects.module.css';
import {openSignInModal, openSubscriptionUpgradeModal} from '../../../common/utils/modal';
import {UsernameHoverEffects} from '../../../constants';
import formatMessage from '../../../i18n/index';
import useAuthStore from '../../../stores/auth';
import {isUserPro} from '../../../utils/pro';
import {getCurrentUser, getPreviewDisplayName} from '../../../utils/user';
import {useHasPromotion} from '../stores/promotion-store';
import {SettingPanelIds} from '../stores/setting-store';
import SettingRadioCard from './SettingRadioCard';
import SettingRadioCardGroup from './SettingRadioCardGroup';
import styles from './SettingUsernameEffect.module.css';
import SettingWrapper from './SettingWrapper';

const EFFECT_CARDS = [
  {value: UsernameHoverEffects.WAVE, label: formatMessage({defaultMessage: 'Wave'})},
  {value: UsernameHoverEffects.BOUNCE, label: formatMessage({defaultMessage: 'Bounce'})},
  {value: UsernameHoverEffects.FLIP, label: formatMessage({defaultMessage: 'Flip'})},
];

const UsernameHoverEffectRequirementDisplayTitleByEffect = {
  [UsernameHoverEffects.WAVE]: formatMessage({defaultMessage: 'Wave Effect'}),
  [UsernameHoverEffects.BOUNCE]: formatMessage({defaultMessage: 'Bounce Effect'}),
  [UsernameHoverEffects.FLIP]: formatMessage({defaultMessage: 'Flip Effect'}),
};

const UsernameHoverEffectRequirementDisplayTextByEffect = {
  [UsernameHoverEffects.WAVE]: formatMessage({defaultMessage: 'Rewarded to any Pro user.'}),
  [UsernameHoverEffects.BOUNCE]: formatMessage({defaultMessage: 'Rewarded to any Pro user.'}),
  [UsernameHoverEffects.FLIP]: formatMessage({defaultMessage: 'Rewarded to any annual Pro user.'}),
};

function isEligibleForUsernameHoverEffect(eligibility, value) {
  return eligibility?.usernameHoverEffects?.[value] === true;
}

function UsernameHoverEffectPreviewText({value, className, children}) {
  const usernameEffect = useAuthStore((state) => state.user?.usernameEffect ?? null);

  return (
    <Text truncate size="xl" className={classNames(className, styles.flavorUsername)}>
      <UsernameEffectText effect={usernameEffect} hoverEffect={value}>
        {children}
      </UsernameEffectText>
    </Text>
  );
}

function UsernameHoverEffectRequirementDisplay({value, displayName}) {
  return (
    <div className={styles.usernameEffectRequirement}>
      <div className={classNames(styles.usernamePreview, effects.hoverTrigger)}>
        <UsernameHoverEffectPreviewText value={value} className={styles.previewUsername}>
          {displayName}
        </UsernameHoverEffectPreviewText>
      </div>
      <Text c="dimmed" size="lg">
        {UsernameHoverEffectRequirementDisplayTextByEffect[value]}
      </Text>
    </div>
  );
}

function openUsernameHoverEffectSubscriptionUpgradeModal(value, callback) {
  const displayName = getPreviewDisplayName(getCurrentUser(), useAuthStore.getState().user);
  // a pro user can only ever be missing flip, which upgrading to annual unlocks
  const upgradeDisabled = isUserPro(useAuthStore.getState().user) && value !== UsernameHoverEffects.FLIP;

  return openSubscriptionUpgradeModal(
    {
      title: UsernameHoverEffectRequirementDisplayTitleByEffect[value],
      children: <UsernameHoverEffectRequirementDisplay value={value} displayName={displayName} />,
      confirmProps: {size: 'lg', variant: 'elevated', color: 'contrast', disabled: upgradeDisabled},
    },
    callback
  );
}

function openUsernameHoverEffectSignInModal(value, callback) {
  const displayName = getPreviewDisplayName(getCurrentUser(), useAuthStore.getState().user);

  return openSignInModal(
    {
      title: UsernameHoverEffectRequirementDisplayTitleByEffect[value],
      children: <UsernameHoverEffectRequirementDisplay value={value} displayName={displayName} />,
    },
    callback
  );
}

function SettingUsernameHoverEffect() {
  const currentUser = useCurrentUser();
  const user = useAuthStore((state) => state.user);
  const previewDisplayName = getPreviewDisplayName(currentUser, user);
  const hasPromotion = useHasPromotion(SettingPanelIds.USERNAME_HOVER_EFFECT);

  const [value, handleChange] = useUsernameEffectSetting({
    userField: 'usernameHoverEffect',
    saveEffect: updateUsernameHoverEffect,
    isEligible: isEligibleForUsernameHoverEffect,
    openSignInModal: openUsernameHoverEffectSignInModal,
    openUpgradeModal: openUsernameHoverEffectSubscriptionUpgradeModal,
  });

  return (
    <React.Fragment>
      <SettingWrapper
        reverse
        name={formatMessage({defaultMessage: 'Hover effect'})}
        description={formatMessage({
          defaultMessage: 'Choose an animation that plays while your username is hovered in chat.',
        })}
        showNewBadge={hasPromotion}
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
              className={classNames(styles.usernameCard, effects.hoverTrigger)}
              tooltip={label}
              // below the card so it never covers the preview mid-animation
              tooltipPosition="bottom"
              ariaLabel={label}
              withIndicators={false}>
              <UsernameHoverEffectPreviewText value={effectValue}>{previewDisplayName}</UsernameHoverEffectPreviewText>
            </SettingRadioCard>
          ))}
        </SettingRadioCardGroup>
      </div>
    </React.Fragment>
  );
}

export default SettingUsernameHoverEffect;
