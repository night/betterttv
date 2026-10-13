import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {Text} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import {updateUsernameFont} from '../../../actions/account';
import Icon from '../../../common/components/Icon';
import UsernameEffectText from '../../../common/components/UsernameEffectText';
import useCurrentUser from '../../../common/hooks/CurrentUser';
import useUsernameEffectSetting, {NONE} from '../../../common/hooks/UsernameEffectSetting';
import {openSignInModal, openSubscriptionUpgradeModal} from '../../../common/utils/modal';
import {UsernameFonts} from '../../../constants';
import formatMessage from '../../../i18n/index';
import useAuthStore from '../../../stores/auth';
import {isUserPro} from '../../../utils/pro';
import {getCurrentUser, getPreviewDisplayName} from '../../../utils/user';
import SettingRadioCard from './SettingRadioCard';
import SettingRadioCardGroup from './SettingRadioCardGroup';
import styles from './SettingUsernameEffect.module.css';
import SettingWrapper from './SettingWrapper';

// font names are proper nouns, so they aren't translated
const FONT_CARDS = [
  {value: UsernameFonts.GEORGIA, label: 'Georgia'},
  {value: UsernameFonts.PALATINO, label: 'Palatino'},
  {value: UsernameFonts.COURIER, label: 'Courier'},
  {value: UsernameFonts.COMIC_SANS, label: 'Comic Sans'},
  {value: UsernameFonts.IMPACT, label: 'Impact'},
  {value: UsernameFonts.BRUSH_SCRIPT, label: 'Brush Script'},
  {value: UsernameFonts.TREBUCHET, label: 'Trebuchet'},
];

const USERNAME_FONT_TITLE = formatMessage({defaultMessage: 'Username Font'});

function isEligibleForUsernameFont(eligibility, value) {
  return eligibility?.usernameFonts?.[value] === true;
}

function UsernameFontPreviewText({value, className, children}) {
  const usernameEffect = useAuthStore((state) => state.user?.usernameEffect ?? null);

  return (
    <Text truncate size="xl" className={classNames(className, styles.flavorUsername)}>
      <UsernameEffectText effect={usernameEffect} font={value}>
        {children}
      </UsernameEffectText>
    </Text>
  );
}

function UsernameFontRequirementDisplay({value, displayName}) {
  return (
    <div className={styles.usernameEffectRequirement}>
      <div className={styles.usernamePreview}>
        <UsernameFontPreviewText value={value} className={styles.previewUsername}>
          {displayName}
        </UsernameFontPreviewText>
      </div>
      <Text c="dimmed" size="lg">
        {formatMessage({defaultMessage: 'Rewarded to any Pro user.'})}
      </Text>
    </div>
  );
}

function openUsernameFontSubscriptionUpgradeModal(value, callback) {
  const displayName = getPreviewDisplayName(getCurrentUser(), useAuthStore.getState().user);
  // every font unlocks with pro, so a pro user has nothing to upgrade to
  const upgradeDisabled = isUserPro(useAuthStore.getState().user);

  return openSubscriptionUpgradeModal(
    {
      title: USERNAME_FONT_TITLE,
      children: <UsernameFontRequirementDisplay value={value} displayName={displayName} />,
      confirmProps: {size: 'lg', variant: 'elevated', color: 'contrast', disabled: upgradeDisabled},
    },
    callback
  );
}

function openUsernameFontSignInModal(value, callback) {
  const displayName = getPreviewDisplayName(getCurrentUser(), useAuthStore.getState().user);

  return openSignInModal(
    {
      title: USERNAME_FONT_TITLE,
      children: <UsernameFontRequirementDisplay value={value} displayName={displayName} />,
    },
    callback
  );
}

function SettingUsernameFont() {
  const currentUser = useCurrentUser();
  const user = useAuthStore((state) => state.user);
  const previewDisplayName = getPreviewDisplayName(currentUser, user);

  const [value, handleChange] = useUsernameEffectSetting({
    userField: 'usernameFont',
    saveEffect: updateUsernameFont,
    isEligible: isEligibleForUsernameFont,
    openSignInModal: openUsernameFontSignInModal,
    openUpgradeModal: openUsernameFontSubscriptionUpgradeModal,
  });

  return (
    <React.Fragment>
      <SettingWrapper
        reverse
        name={formatMessage({defaultMessage: 'Font'})}
        description={formatMessage({
          defaultMessage: 'Choose the font your username is shown in for everyone in chat.',
        })}
        showProBadge
      />
      <div className={styles.cards}>
        <SettingRadioCardGroup value={value} onChange={handleChange} capAtFourPerRow>
          <SettingRadioCard
            key={NONE}
            value={NONE}
            className={styles.usernameCard}
            tooltip={formatMessage({defaultMessage: 'Default font'})}
            ariaLabel={formatMessage({defaultMessage: 'Default font'})}
            withIndicators={false}>
            <Icon icon={faXmark} className={styles.cardIcon} />
          </SettingRadioCard>
          {FONT_CARDS.map(({value: fontValue, label}) => (
            <SettingRadioCard
              key={fontValue}
              value={fontValue}
              className={styles.usernameCard}
              tooltip={label}
              ariaLabel={label}
              withIndicators={false}>
              <UsernameFontPreviewText value={fontValue}>{previewDisplayName}</UsernameFontPreviewText>
            </SettingRadioCard>
          ))}
        </SettingRadioCardGroup>
      </div>
    </React.Fragment>
  );
}

export default SettingUsernameFont;
