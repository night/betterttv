import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Autocomplete'});

function EmoteAutocomplete() {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_AUTOCOMPLETE);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Typing : before text will attempt to autocomplete your emote'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(EmoteAutocomplete, {
  settingId: SettingIds.EMOTE_AUTOCOMPLETE,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['auto', 'autocomplete', 'emote', ':'],
});
