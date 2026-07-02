import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';
import {isStandaloneWindow} from '@/utils/window';

const SETTING_NAME = formatMessage({defaultMessage: 'Whispers'});
const SETTING_DESCRIPTION = formatMessage({defaultMessage: 'Enable and recieve Twitch whispers.'});

function DisableWhispers({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.WHISPERS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={SETTING_NAME} description={SETTING_DESCRIPTION} value={value} onChange={setValue} />
    </SettingGroup>
  );
}

SettingStore.registerSetting(DisableWhispers, {
  settingPanelId: SettingPanelIds.WHISPERS,
  name: SETTING_NAME,
});

searchStore.registerSearchEntry({
  name: SETTING_NAME,
  description: SETTING_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.WHISPERS),
  predicate: () => !isStandaloneWindow(),
});

export default DisableWhispers;
