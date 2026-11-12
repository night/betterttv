import React from 'react';
import formatMessage from '@/i18n/index';
import SubscriptionBadgeSetting, {
  DISPLAY_BADGE_DESCRIPTION,
  DISPLAY_BADGE_NAME,
} from '@/modules/settings/components/SubscriptionBadgeSetting';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Badge'});

function UsernameSubscriberBadge({ref, ...props}) {
  return <SubscriptionBadgeSetting ref={ref} {...props} name={SETTING_NAME} />;
}

registerSearchEntry({
  query: DISPLAY_BADGE_NAME,
  description: DISPLAY_BADGE_DESCRIPTION,
  keywords: ['subscriber', 'pro'],
  onAccept: ({goToSetting, flashSetting}) => {
    goToSetting(SettingPanelIds.SUBSCRIPTION_BADGE);
    flashSetting(SETTING_NAME);
  },
  settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
});

SettingStore.registerSetting(UsernameSubscriberBadge, {
  settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
  settingCategoryId: SettingCategoryIds.USERNAME,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['username', 'subscriber'],
});

export default UsernameSubscriberBadge;
