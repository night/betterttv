import React from 'react';
import formatMessage from '@/i18n/index';
import SubscriptionBadgeSetting from '@/modules/settings/components/SubscriptionBadgeSetting';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Subscriber Badge'});

function Badge({ref, ...props}) {
  return <SubscriptionBadgeSetting ref={ref} {...props} name={SETTING_NAME} />;
}

registerSearchEntry({
  query: formatMessage({defaultMessage: 'Display your badge'}),
  description: formatMessage({defaultMessage: 'Everyone using BetterTTV sees it when you type in chat.'}),
  keywords: ['subscriber', 'pro'],
  settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
});

SettingStore.registerSetting(Badge, {
  settingPanelId: SettingPanelIds.SUBSCRIPTION_BADGE,
  settingCategoryId: SettingCategoryIds.USERNAME,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Badge;
