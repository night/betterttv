import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, DeletedMessageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingRadio from '@/modules/settings/components/SettingRadio';
import SettingRadioGroup from '@/modules/settings/components/SettingRadioGroup';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Deleted Messages'});

const DEFAULT_NAME = formatMessage({defaultMessage: 'Default'});
const DEFAULT_DESCRIPTION = formatMessage({defaultMessage: 'Do what Twitch normally does.'});
const HIDE_NAME = formatMessage({defaultMessage: 'Hide Deleted Messages'});
const HIDE_DESCRIPTION = formatMessage({defaultMessage: 'Remove timed out messages from view.'});
const SHOW_NAME = formatMessage({defaultMessage: 'Restore Deleted Messages'});
const SHOW_DESCRIPTION = formatMessage({
  defaultMessage: "Changes '<'message deleted'>' back to users' original messages.",
});
const HIGHLIGHT_NAME = formatMessage({defaultMessage: 'Restore and Highlight Deleted Messages'});
const HIGHLIGHT_DESCRIPTION = formatMessage({
  defaultMessage: "Changes '<'message deleted'>' back to users' original messages and highlights them.",
});

function DeletedMessagesModule({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.DELETED_MESSAGES);

  return (
    <SettingRadioGroup ref={ref} {...props} name={SETTING_NAME} value={value} onChange={setValue}>
      <SettingRadio optionValue={DeletedMessageTypes.DEFAULT} name={DEFAULT_NAME} description={DEFAULT_DESCRIPTION} />
      <SettingRadio optionValue={DeletedMessageTypes.HIDE} name={HIDE_NAME} description={HIDE_DESCRIPTION} />
      <SettingRadio optionValue={DeletedMessageTypes.SHOW} name={SHOW_NAME} description={SHOW_DESCRIPTION} />
      <SettingRadio
        optionValue={DeletedMessageTypes.HIGHLIGHT}
        name={HIGHLIGHT_NAME}
        description={HIGHLIGHT_DESCRIPTION}
      />
    </SettingRadioGroup>
  );
}

SettingStore.registerSetting(DeletedMessagesModule, {
  settingPanelId: SettingPanelIds.DELETED_MESSAGES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

for (const entry of [
  {name: HIDE_NAME, description: HIDE_DESCRIPTION},
  {name: SHOW_NAME, description: SHOW_DESCRIPTION},
  {name: HIGHLIGHT_NAME, description: HIGHLIGHT_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.DELETED_MESSAGES)});
}

export default DeletedMessagesModule;
