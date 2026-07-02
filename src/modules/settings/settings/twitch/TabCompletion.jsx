import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Tab Completion'});

const PRIORITIZE_EMOTES_NAME = formatMessage({defaultMessage: 'Prioritize Emotes'});
const PRIORITIZE_EMOTES_DESCRIPTION = formatMessage({
  defaultMessage: 'Prefer emotes over usernames when using tab completion.',
});

function TabCompletion({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.TAB_COMPLETION_EMOTE_PRIORITY);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={PRIORITIZE_EMOTES_NAME}
        description={PRIORITIZE_EMOTES_DESCRIPTION}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(TabCompletion, {
  settingPanelId: SettingPanelIds.TAB_COMPLETION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

searchStore.registerSearchEntry({
  name: PRIORITIZE_EMOTES_NAME,
  description: PRIORITIZE_EMOTES_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.TAB_COMPLETION),
});

export default TabCompletion;
