import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, DeletedMessageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingRadio from '@/modules/settings/components/SettingRadio';
import SettingRadioGroup from '@/modules/settings/components/SettingRadioGroup';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Deleted Messages'});

function DeletedMessagesModule({ref, ...props}) {
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

SettingStore.registerSetting(DeletedMessagesModule, {
  settingPanelId: SettingPanelIds.DELETED_MESSAGES,
  settingCategoryId: SettingCategoryIds.MODERATION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default DeletedMessagesModule;
