import React from 'react';
import formatMessage from '@/i18n/index';
import SubscriptionBadgeSetting, {
  DISPLAY_BADGE_DESCRIPTION,
  DISPLAY_BADGE_NAME,
} from '@/modules/settings/components/SubscriptionBadgeSetting';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Subscriber Badge'});

function Badge({ref, ...props}) {
  return <SubscriptionBadgeSetting ref={ref} {...props} name={SETTING_NAME} />;
}

registerSearchEntry({
  query: DISPLAY_BADGE_NAME,
  description: DISPLAY_BADGE_DESCRIPTION,
  keywords: ['subscriber', 'pro'],
  // the row is replaced by the badges for anyone who has a choice of them
  onAccept: ({goToSetting, flashSetting}) => {
    goToSetting(SettingPanelIds.SUBSCRIPTION_BADGE);
    flashSetting(SETTING_NAME);
  },
  settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
});

SettingStore.registerSetting(Badge, {
  settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
  settingCategoryId: SettingCategoryIds.USERNAME,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Badge;
