import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Checkbox from 'rsuite/lib/Checkbox/index.js';
import CheckboxGroup from 'rsuite/lib/CheckboxGroup/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {SettingIds, CategoryTypes, AutoPlayFlags} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import {hasFlag} from '../../../../utils/flags.js';

function AutoplayModule() {
  const [autoplay, setAutoplay] = useStorageState(SettingIds.AUTO_PLAY);

  return (
    <Panel header="Auto Play" className={styles.setting}>
      <div className={styles.setting}>
        <p className={styles.description}>Prevent video-players from autoplaying</p>
        <CheckboxGroup
          value={Object.values(AutoPlayFlags).filter((value) => hasFlag(autoplay, value))}
          onChange={(value) => setAutoplay(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="fpPlayer" value={AutoPlayFlags.FP_VIDEO}>
            <p>Front-page Player</p>
            <p className={styles.description}>Disables autoplaying streams on the homepage</p>
          </Checkbox>
          <Checkbox key="hostPlayer" value={AutoPlayFlags.HOST_MODE}>
            <p>Host-mode Player</p>
            <p className={styles.description}>Disables autoplay during channel hosting</p>
          </Checkbox>
          <Checkbox key="vodPlayer" value={AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY}>
            <p>VOD Player</p>
            <p className={styles.description}>Disables autoplay of recommended videos on VoDs</p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

export default registerComponent(AutoplayModule, {
  settingId: SettingIds.AUTO_PLAY,
  name: 'Auto Play',
  category: CategoryTypes.DIRECTORY,
  keywords: ['auto', 'play'],
});
