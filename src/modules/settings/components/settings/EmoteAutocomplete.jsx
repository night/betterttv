import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent, useStorageState} from '../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function EmoteAutocomplete() {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_AUTOCOMPLETE);

  return (
    <Panel header="Emote Autocomplete">
      <div className={styles.toggle}>
        <p className={styles.description}>Autocomplete your emote when you type :</p>
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
