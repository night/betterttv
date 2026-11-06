import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, UsernameFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Usernames'});
const LOCALIZED_USERNAMES_NAME = formatMessage({defaultMessage: 'Localized Usernames'});
const LOCALIZED_USERNAMES_DESCRIPTION = formatMessage({
  defaultMessage: 'Show localized display names in the chat window.',
});
const USERNAME_COLORS_NAME = formatMessage({defaultMessage: 'Username Colors'});
const USERNAME_COLORS_DESCRIPTION = formatMessage({defaultMessage: 'Show username colors in the chat window.'});
const READABLE_COLORS_NAME = formatMessage({defaultMessage: 'Readable Colors'});
const READABLE_COLORS_DESCRIPTION = formatMessage({
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
      <SettingCheckbox
        value={UsernameFlags.LOCALIZED}
        name={LOCALIZED_USERNAMES_NAME}
        description={LOCALIZED_USERNAMES_DESCRIPTION}
      />
      <SettingCheckbox
        value={UsernameFlags.COLORS}
        name={USERNAME_COLORS_NAME}
        description={USERNAME_COLORS_DESCRIPTION}
      />
      <SettingCheckbox
        value={UsernameFlags.READABLE}
        name={READABLE_COLORS_NAME}
        description={READABLE_COLORS_DESCRIPTION}
      />
      <SettingCheckbox value={UsernameFlags.BADGES} name={BADGES_NAME} description={BADGES_DESCRIPTION} />
    </SettingCheckboxGroup>
  );
}

registerSearchEntry({
  query: LOCALIZED_USERNAMES_NAME,
  description: LOCALIZED_USERNAMES_DESCRIPTION,
  settingPanelId: SettingPanelIds.USERNAMES,
});

registerSearchEntry({
  query: USERNAME_COLORS_NAME,
  description: USERNAME_COLORS_DESCRIPTION,
  settingPanelId: SettingPanelIds.USERNAMES,
});

registerSearchEntry({
  query: READABLE_COLORS_NAME,
  description: READABLE_COLORS_DESCRIPTION,
  settingPanelId: SettingPanelIds.USERNAMES,
});

registerSearchEntry({
  query: BADGES_NAME,
  description: BADGES_DESCRIPTION,
  settingPanelId: SettingPanelIds.USERNAMES,
});

SettingStore.registerSetting(UsernamesModule, {
  settingPanelId: SettingPanelIds.USERNAMES,
  settingCategoryId: SettingCategoryIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default UsernamesModule;
