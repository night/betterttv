import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, UsernameFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Usernames'});

const LOCALIZED_NAME = formatMessage({defaultMessage: 'Localized Usernames'});
const LOCALIZED_DESCRIPTION = formatMessage({defaultMessage: 'Show localized display names in the chat window.'});
const COLORS_NAME = formatMessage({defaultMessage: 'Username Colors'});
const COLORS_DESCRIPTION = formatMessage({defaultMessage: 'Show username colors in the chat window.'});
const READABLE_NAME = formatMessage({defaultMessage: 'Readable Colors'});
const READABLE_DESCRIPTION = formatMessage({
  defaultMessage: 'Show username colors with higher contrast (prevents hard to read names).',
});
const BADGES_NAME = formatMessage({defaultMessage: 'Badges'});
const BADGES_DESCRIPTION = formatMessage({defaultMessage: 'Show chat badges next to usernames.'});

function UsernamesModule({ref, ...props}) {
  const [usernames, setUsernames] = useStorageState(SettingIds.USERNAMES);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={usernames}
      onChange={setUsernames}
      flags={Object.values(UsernameFlags)}>
      <SettingCheckbox value={UsernameFlags.LOCALIZED} name={LOCALIZED_NAME} description={LOCALIZED_DESCRIPTION} />
      <SettingCheckbox value={UsernameFlags.COLORS} name={COLORS_NAME} description={COLORS_DESCRIPTION} />
      <SettingCheckbox value={UsernameFlags.READABLE} name={READABLE_NAME} description={READABLE_DESCRIPTION} />
      <SettingCheckbox value={UsernameFlags.BADGES} name={BADGES_NAME} description={BADGES_DESCRIPTION} />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(UsernamesModule, {
  settingPanelId: SettingPanelIds.USERNAMES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

for (const entry of [
  {name: LOCALIZED_NAME, description: LOCALIZED_DESCRIPTION},
  {name: COLORS_NAME, description: COLORS_DESCRIPTION},
  {name: READABLE_NAME, description: READABLE_DESCRIPTION},
  {name: BADGES_NAME, description: BADGES_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.USERNAMES)});
}

export default UsernamesModule;
