import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function EmoteAutocomplete() {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_AUTOCOMPLETE);

  return (
    <Panel header="Emote Autocomplete">
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>Typing : before text will attempt to autocomplete your emote</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(EmoteAutocomplete, {
  settingId: SettingIds.EMOTE_AUTOCOMPLETE,
  name: 'Emote Autocomplete',
  category: CategoryTypes.CHAT,
  keywords: ['auto', 'autocomplete', 'emote', ':'],
});
