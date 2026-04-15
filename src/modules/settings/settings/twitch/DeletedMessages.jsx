import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds, DeletedMessageTypes} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingRadio from '../../components/SettingRadio.jsx';
import SettingRadioGroup from '../../components/SettingRadioGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Deleted Messages'});

function DeletedMessagesModule(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.DELETED_MESSAGES);

  return (
    <SettingRadioGroup ref={ref} {...props} name={SETTING_NAME} value={value} onChange={setValue}>
      <SettingRadio
        optionValue={DeletedMessageTypes.DEFAULT}
        name={formatMessage({defaultMessage: 'Default'})}
        description={formatMessage({defaultMessage: 'Do what Twitch normally does.'})}
      />
      <SettingRadio
        optionValue={DeletedMessageTypes.HIDE}
        name={formatMessage({defaultMessage: 'Hide Deleted Messages'})}
        description={formatMessage({defaultMessage: 'Remove timed out messages from view.'})}
      />
      <SettingRadio
        optionValue={DeletedMessageTypes.SHOW}
        name={formatMessage({defaultMessage: 'Restore Deleted Messages'})}
        description={formatMessage({
          defaultMessage: "Changes '<'message deleted'>' back to users' original messages.",
        })}
      />
      <SettingRadio
        optionValue={DeletedMessageTypes.HIGHLIGHT}
        name={formatMessage({defaultMessage: 'Restore and Highlight Deleted Messages'})}
        description={formatMessage({
          defaultMessage: "Changes '<'message deleted'>' back to users' original messages and highlights them.",
        })}
      />
    </SettingRadioGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(DeletedMessagesModule), {
  settingPanelId: SettingPanelIds.DELETED_MESSAGES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['messages', 'deleted'],
});

export default React.forwardRef(DeletedMessagesModule);
