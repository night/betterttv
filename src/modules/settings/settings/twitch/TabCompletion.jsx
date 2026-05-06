import React, {useContext} from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {PageTypes, SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';
import SettingWrapper from '../../components/SettingWrapper.jsx';
import {PageContext} from '../../contexts/PageContext.jsx';
import {Button} from '@mantine/core';

const SETTING_NAME = formatMessage({defaultMessage: 'Tab Completion'});

function TabCompletion(props, ref) {
  const {setPage} = useContext(PageContext);
  const [value, setValue] = useStorageState(SettingIds.TAB_COMPLETION_EMOTE_PRIORITY);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingWrapper
        name={formatMessage({defaultMessage: 'Emote Aliases'})}
        reverse
        description={formatMessage({
          defaultMessage: 'Create custom aliases so typing a shortcut in chat completes as any emote.',
        })}>
        <Button size="lg" onClick={() => setPage(PageTypes.EMOTE_ALIASES)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
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
