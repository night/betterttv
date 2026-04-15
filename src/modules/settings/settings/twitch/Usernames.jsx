import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds, UsernameFlags} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingCheckbox from '../../components/SettingCheckbox.jsx';
import SettingCheckboxGroup from '../../components/SettingCheckboxGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Usernames'});

function UsernamesModule(props, ref) {
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
        name={formatMessage({defaultMessage: 'Localized Usernames'})}
        description={formatMessage({
          defaultMessage: 'Show localized display names in the chat window.',
        })}
      />
      <SettingCheckbox
        value={UsernameFlags.COLORS}
        name={formatMessage({defaultMessage: 'Username Colors'})}
        description={formatMessage({defaultMessage: 'Show username colors in the chat window.'})}
      />
      <SettingCheckbox
        value={UsernameFlags.READABLE}
        name={formatMessage({defaultMessage: 'Readable Colors'})}
        description={formatMessage({
          defaultMessage: 'Show username colors with higher contrast (prevents hard to read names).',
        })}
      />
      <SettingCheckbox
        value={UsernameFlags.BADGES}
        name={formatMessage({defaultMessage: 'Badges'})}
        description={formatMessage({defaultMessage: 'Show chat badges next to usernames.'})}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(UsernamesModule), {
  settingPanelId: SettingPanelIds.USERNAMES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['color', 'username', 'accessibility', 'readability'],
});

export default React.forwardRef(UsernamesModule);
