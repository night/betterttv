import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Autocomplete'});
const SETTING_DESCRIPTION = formatMessage({
  defaultMessage: 'Typing : before text will attempt to autocomplete your emote.',
});

function EmoteAutocomplete({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_AUTOCOMPLETE);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={SETTING_NAME} description={SETTING_DESCRIPTION} value={value} onChange={setValue} />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: SETTING_NAME,
  description: SETTING_DESCRIPTION,
  settingPanelId: SettingPanelIds.EMOTE_AUTOCOMPLETE,
});

SettingStore.registerSetting(EmoteAutocomplete, {
  settingPanelId: SettingPanelIds.EMOTE_AUTOCOMPLETE,
  settingCategoryId: SettingCategoryIds.EMOTES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default EmoteAutocomplete;
