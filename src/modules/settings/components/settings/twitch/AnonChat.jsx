import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {TagInput} from 'rsuite';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Anon Chat'});

function AnonChat() {
  const [value, setValue] = useStorageState(SettingIds.ANON_CHAT);
  const [channels, setChannels] = useStorageState(SettingIds.ANON_CHAT_WHITELISTED_CHANNELS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Join chat anonymously without appearing in the userlist'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Whitelist channels that bypass Anon Chat'})}
        </p>
        <TagInput
          value={channels}
          className={styles.settingTagInput}
          onChange={(newValue) => setChannels(newValue)}
          placeholder="username, etc.."
        />
      </div>
    </Panel>
  );
}

registerComponent(AnonChat, {
  settingId: SettingIds.ANON_CHAT,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['anon', 'chat'],
});
