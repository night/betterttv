import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Autocomplete'});

function EmoteAutocomplete(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_AUTOCOMPLETE);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={SETTING_NAME}
        description={formatMessage({
          defaultMessage: 'Typing : before text will attempt to autocomplete your emote.',
        })}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(EmoteAutocomplete), {
  settingPanelId: SettingPanelIds.EMOTE_AUTOCOMPLETE,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['auto', 'autocomplete', 'emote', ':'],
});

export default React.forwardRef(EmoteAutocomplete);
