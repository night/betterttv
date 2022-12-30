import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Menu'});

function EmoteMenu() {
  const [emoteMenuValue, setEmoteMenuValue] = useStorageState(SettingIds.EMOTE_MENU);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Enables a more advanced emote menu for chat'})}
        </p>
        <Toggle checked={emoteMenuValue} onChange={(state) => setEmoteMenuValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(EmoteMenu, {
  settingId: SettingIds.EMOTE_MENU,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['twitch', 'emotes', 'popup'],
});
