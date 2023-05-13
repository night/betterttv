import React from 'react';
import Panel from 'rsuite/Panel';
import {Toggle} from 'rsuite';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, EmoteMenuTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Menu'});

function EmoteMenu() {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_MENU);
  const toggled = value !== EmoteMenuTypes.NONE;
  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Enables a more advanced emote menu for chat'})}
        </p>
        <Toggle
          checked={toggled}
          onChange={(state) => setValue(state ? EmoteMenuTypes.ENABLED : EmoteMenuTypes.NONE)}
        />
      </div>
      {toggled ? (
        <div className={styles.settingRow}>
          <p className={styles.settingDescription}>
            {formatMessage({defaultMessage: "Replace Twitch's native emote menu."})}
          </p>
          <Toggle
            checked={value === EmoteMenuTypes.ENABLED}
            onChange={(state) => setValue(state ? EmoteMenuTypes.ENABLED : EmoteMenuTypes.LEGACY_ENABLED)}
          />
        </div>
      ) : null}
    </Panel>
  );
}

registerComponent(EmoteMenu, {
  settingId: SettingIds.EMOTE_MENU,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['emotes', 'popup'],
});
