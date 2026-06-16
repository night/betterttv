import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';

const SETTING_NAME = formatMessage({defaultMessage: 'Tab Completion'});

function TabCompletion(props, ref) {
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

SettingStore.registerSetting(React.forwardRef(TabCompletion), {
  settingPanelId: SettingPanelIds.TAB_COMPLETION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['tab', 'completion', 'emote', 'priority'],
});

export default React.forwardRef(TabCompletion);
