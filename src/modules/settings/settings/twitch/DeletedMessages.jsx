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
        name={formatMessage({defaultMessage: 'Use the default'})}
        description={formatMessage({defaultMessage: 'Do what Twitch normally does.'})}
      />
      <SettingRadio
        optionValue={DeletedMessageTypes.HIDE}
        name={formatMessage({defaultMessage: 'Hide deleted messages'})}
        description={formatMessage({defaultMessage: 'Remove timed out messages from view.'})}
      />
      <SettingRadio
        optionValue={DeletedMessageTypes.SHOW}
        name={formatMessage({defaultMessage: 'Restore deleted messages'})}
        description={formatMessage({
          defaultMessage: "Changes '<'message deleted'>' back to what the user wrote.",
        })}
      />
      <SettingRadio
        optionValue={DeletedMessageTypes.HIGHLIGHT}
        name={formatMessage({defaultMessage: 'Restore and highlight deleted messages'})}
        description={formatMessage({
          defaultMessage: "Changes '<'message deleted'>' back to what the user wrote and marks it.",
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
