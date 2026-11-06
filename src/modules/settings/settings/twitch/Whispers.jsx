import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Whispers'});
const SETTING_DESCRIPTION = formatMessage({defaultMessage: 'Enable and receive Twitch whispers.'});

function DisableWhispers({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.WHISPERS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={SETTING_NAME} description={SETTING_DESCRIPTION} value={value} onChange={setValue} />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: SETTING_NAME,
  description: SETTING_DESCRIPTION,
  settingPanelId: SettingPanelIds.WHISPERS,
});

SettingStore.registerSetting(DisableWhispers, {
  settingPanelId: SettingPanelIds.WHISPERS,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
});

export default DisableWhispers;
