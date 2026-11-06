import React from 'react';
import formatMessage from '@/i18n/index';
import SubscriptionBadgeSetting from '@/modules/settings/components/SubscriptionBadgeSetting';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Subscriber Badge'});

function Badge({ref, ...props}) {
  return <SubscriptionBadgeSetting ref={ref} {...props} name={SETTING_NAME} />;
}

SettingStore.registerSetting(Badge, {
  settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
  settingCategoryId: SettingCategoryIds.APPEARANCE,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Badge;
