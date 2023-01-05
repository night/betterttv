import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import Input from 'rsuite/Input';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Pinned Highlights'});

function PinnedHighlights() {
  const [value, setValue] = useStorageState(SettingIds.PINNED_HIGHLIGHTS);
  const [maxPinnedHighlights, setMaxPinnedHighlights] = useStorageState(SettingIds.MAX_PINNED_HIGHLIGHTS);
  const [timeoutHighlightsValue, setTimeoutHighlightsValue] = useStorageState(SettingIds.TIMEOUT_HIGHLIGHTS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Pin your highlighted messages above chat'})}
        </p>
        <Toggle checked={value} onChange={setValue} />
      </div>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>{formatMessage({defaultMessage: 'Maximum pinned highlights'})}</p>
        <Input
          className={styles.settingInputNumber}
          type="number"
          min={1}
          max={25}
          disabled={!value}
          value={maxPinnedHighlights}
          onChange={setMaxPinnedHighlights}
        />
      </div>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Hide pinned highlights after 1 minute'})}
        </p>
        <Toggle checked={timeoutHighlightsValue} onChange={(state) => setTimeoutHighlightsValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(PinnedHighlights, {
  settingId: SettingIds.PINNED_HIGHLIGHTS,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['pinned', 'highlights'],
});
