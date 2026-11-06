import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, DeletedMessageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingRadio from '@/modules/settings/components/SettingRadio';
import SettingRadioGroup from '@/modules/settings/components/SettingRadioGroup';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Deleted Messages'});
const DEFAULT_NAME = formatMessage({defaultMessage: 'Default'});
const DEFAULT_DESCRIPTION = formatMessage({defaultMessage: 'Do what Twitch normally does.'});
const HIDE_DELETED_MESSAGES_NAME = formatMessage({defaultMessage: 'Hide Deleted Messages'});
const HIDE_DELETED_MESSAGES_DESCRIPTION = formatMessage({defaultMessage: 'Remove timed out messages from view.'});
const RESTORE_DELETED_MESSAGES_NAME = formatMessage({defaultMessage: 'Restore Deleted Messages'});
const RESTORE_DELETED_MESSAGES_DESCRIPTION = formatMessage({
  defaultMessage: "Changes '<'message deleted'>' back to users' original messages.",
});
const RESTORE_AND_HIGHLIGHT_DELETED_MESSAGES_NAME = formatMessage({
  defaultMessage: 'Restore and Highlight Deleted Messages',
});
const RESTORE_AND_HIGHLIGHT_DELETED_MESSAGES_DESCRIPTION = formatMessage({
  defaultMessage: "Changes '<'message deleted'>' back to users' original messages and highlights them.",
});

function DeletedMessagesModule({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.DELETED_MESSAGES);

  return (
    <SettingRadioGroup ref={ref} {...props} name={SETTING_NAME} value={value} onChange={setValue}>
      <SettingRadio optionValue={DeletedMessageTypes.DEFAULT} name={DEFAULT_NAME} description={DEFAULT_DESCRIPTION} />
      <SettingRadio
        optionValue={DeletedMessageTypes.HIDE}
        name={HIDE_DELETED_MESSAGES_NAME}
        description={HIDE_DELETED_MESSAGES_DESCRIPTION}
      />
      <SettingRadio
        optionValue={DeletedMessageTypes.SHOW}
        name={RESTORE_DELETED_MESSAGES_NAME}
        description={RESTORE_DELETED_MESSAGES_DESCRIPTION}
      />
      <SettingRadio
        optionValue={DeletedMessageTypes.HIGHLIGHT}
        name={RESTORE_AND_HIGHLIGHT_DELETED_MESSAGES_NAME}
        description={RESTORE_AND_HIGHLIGHT_DELETED_MESSAGES_DESCRIPTION}
      />
    </SettingRadioGroup>
  );
}

registerSearchEntry({
  query: DEFAULT_NAME,
  description: DEFAULT_DESCRIPTION,
  settingPanelId: SettingPanelIds.DELETED_MESSAGES,
});

registerSearchEntry({
  query: HIDE_DELETED_MESSAGES_NAME,
  description: HIDE_DELETED_MESSAGES_DESCRIPTION,
  settingPanelId: SettingPanelIds.DELETED_MESSAGES,
});

registerSearchEntry({
  query: RESTORE_DELETED_MESSAGES_NAME,
  description: RESTORE_DELETED_MESSAGES_DESCRIPTION,
  settingPanelId: SettingPanelIds.DELETED_MESSAGES,
});

registerSearchEntry({
  query: RESTORE_AND_HIGHLIGHT_DELETED_MESSAGES_NAME,
  description: RESTORE_AND_HIGHLIGHT_DELETED_MESSAGES_DESCRIPTION,
  settingPanelId: SettingPanelIds.DELETED_MESSAGES,
});

SettingStore.registerSetting(DeletedMessagesModule, {
  settingPanelId: SettingPanelIds.DELETED_MESSAGES,
  settingCategoryId: SettingCategoryIds.MODERATION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default DeletedMessagesModule;
