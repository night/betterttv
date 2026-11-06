import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Tab Completion'});

function TabCompletion({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.TAB_COMPLETION_EMOTE_PRIORITY);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Prioritize Emotes'})}
        description={formatMessage({defaultMessage: 'Prefer emotes over usernames when using tab completion.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(TabCompletion, {
  settingPanelId: SettingPanelIds.TAB_COMPLETION,
  settingCategoryId: SettingCategoryIds.EMOTES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default TabCompletion;
