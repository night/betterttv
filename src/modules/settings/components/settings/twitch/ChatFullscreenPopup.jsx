import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Fullscreen Popup'});

function ChatFullscreenPopup() {
  const [value, setValue] = useStorageState(SettingIds.CHAT_FULLSCREEN_POPUP);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({
            defaultMessage: "Enable showing and hiding the stream chat in fullscreen mode by pressing 'c'.",
          })}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ChatFullscreenPopup, {
  settingId: SettingIds.CHAT_FULLSCREEN_POPUP,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['chat', 'fullscreen', 'position', 'placement', 'popup'],
});
