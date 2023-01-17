import React from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes, AutoPlayFlags} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import {hasFlag} from '../../../../../utils/flags.js';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Play'});

function AutoplayModule() {
  const [autoplay, setAutoplay] = useStorageState(SettingIds.AUTO_PLAY);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Control Auto Play on various Twitch video players.'})}
        </p>
        <CheckboxGroup
          value={Object.values(AutoPlayFlags).filter((value) => hasFlag(autoplay, value))}
          onChange={(value) => setAutoplay(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="fpPlayer" value={AutoPlayFlags.FP_VIDEO}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Front-page Player'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Enable auto play for homepage video player'})}
            </p>
          </Checkbox>
          <Checkbox key="offlineChannelPlayer" value={AutoPlayFlags.OFFLINE_CHANNEL_VIDEO}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Offline Channel Player'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({
                defaultMessage: 'Enable auto play of the welcome video or last stream on offline channels',
              })}
            </p>
          </Checkbox>
          <Checkbox key="vodPlayer" value={AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'VOD Player'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Enable auto play of recommended videos on VoDs'})}
            </p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

registerComponent(AutoplayModule, {
  settingId: SettingIds.AUTO_PLAY,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['auto', 'play'],
});
