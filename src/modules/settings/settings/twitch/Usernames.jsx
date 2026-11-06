import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, UsernameFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Usernames'});

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
        name={formatMessage({defaultMessage: 'Show localized usernames'})}
        description={formatMessage({
          defaultMessage: 'Display names in their original language.',
        })}
      />
      <SettingCheckbox
        value={UsernameFlags.COLORS}
        name={formatMessage({defaultMessage: 'Show username colors'})}
        description={formatMessage({defaultMessage: "Keep each chatter's own color in the chat window."})}
      />
      <SettingCheckbox
        value={UsernameFlags.READABLE}
        name={formatMessage({defaultMessage: 'Make colors readable'})}
        description={formatMessage({
          defaultMessage: 'Show username colors with higher contrast (prevents hard to read names).',
        })}
      />
      <SettingCheckbox
        value={UsernameFlags.BADGES}
        name={formatMessage({defaultMessage: 'Show badges'})}
        description={formatMessage({defaultMessage: 'Subscriber, moderator and other icons next to usernames.'})}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(UsernamesModule, {
  settingPanelId: SettingPanelIds.USERNAMES,
  settingCategoryId: SettingCategoryIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default UsernamesModule;
