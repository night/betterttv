import React from 'react';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SubscriptionBadgeSetting from '@/modules/settings/components/SubscriptionBadgeSetting';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Badge'});

function Badge({ref, ...props}) {
  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SubscriptionBadgeSetting />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Badge, {
  settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
  settingCategoryId: SettingCategoryIds.APPEARANCE,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Badge;
