import React from 'react';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingUsernameHoverEffect from '@/modules/settings/components/SettingUsernameHoverEffect';
import {useHasPromotion} from '@/modules/settings/stores/promotion-store';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Username Hover Effect'});

function UsernameHoverEffect({ref, ...props}) {
  const hasPromotion = useHasPromotion(SettingPanelIds.USERNAME_HOVER_EFFECT);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME} withPane={false} showNewBadge={hasPromotion}>
      <SettingUsernameHoverEffect />
    </SettingGroup>
  );
}

SettingStore.registerSetting(UsernameHoverEffect, {
  settingPanelId: SettingPanelIds.USERNAME_HOVER_EFFECT,
  settingCategoryId: SettingCategoryIds.APPEARANCE,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default UsernameHoverEffect;
