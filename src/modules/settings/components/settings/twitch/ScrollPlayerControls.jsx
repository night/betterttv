import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Scroll Player Controls'});

function ScrollPlayerControls() {
  const [value, setValue] = useStorageState(SettingIds.SCROLL_PLAYER_CONTROLS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({
            defaultMessage:
              'Enable scrolling the Twitch player to change the player volume. Hold ALT when scrolling to seek.',
          })}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ScrollPlayerControls, {
  settingId: SettingIds.SCROLL_PLAYER_CONTROLS,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['volume', 'seek', 'control', 'scroll'],
});
