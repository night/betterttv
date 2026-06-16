import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';

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
