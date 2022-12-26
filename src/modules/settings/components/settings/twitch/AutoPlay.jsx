import React from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes, AutoPlayFlags} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import {hasFlag} from '../../../../../utils/flags.js';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function AutoplayModule() {
  const [autoplay, setAutoplay] = useStorageState(SettingIds.AUTO_PLAY);

  return (
    <Panel header="Auto Play" className={styles.setting}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>Control Auto Play on various Twitch video players.</p>
        <CheckboxGroup
          value={Object.values(AutoPlayFlags).filter((value) => hasFlag(autoplay, value))}
          onChange={(value) => setAutoplay(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="fpPlayer" value={AutoPlayFlags.FP_VIDEO}>
            <p className={styles.heading}>Front-page Player</p>
            <p className={styles.settingDescription}>Enable auto play for homepage video player</p>
          </Checkbox>
          <Checkbox key="hostPlayer" value={AutoPlayFlags.HOST_MODE}>
            <p className={styles.heading}>Host-mode Player</p>
            <p className={styles.settingDescription}>Enable auto play for channel hosting video player</p>
          </Checkbox>
          <Checkbox key="vodPlayer" value={AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY}>
            <p className={styles.heading}>VOD Player</p>
            <p className={styles.settingDescription}>Enable auto play of recommended videos on VoDs</p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

registerComponent(AutoplayModule, {
  settingId: SettingIds.AUTO_PLAY,
  name: 'Auto Play',
  category: CategoryTypes.CHANNEL,
  keywords: ['auto', 'play'],
});
