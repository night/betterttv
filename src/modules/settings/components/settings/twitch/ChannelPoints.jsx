import React from 'react';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import Panel from 'rsuite/Panel';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {SettingIds, CategoryTypes, ChannelPointsFlags} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import {hasFlag} from '../../../../../utils/flags.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Channel Points'});

function ChannelPointsModule() {
  const [channelPoints, setChannelPoints] = useStorageState(SettingIds.CHANNEL_POINTS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Edit or modify the channel points'})}
        </p>
        <CheckboxGroup
          value={Object.values(ChannelPointsFlags).filter((value) => hasFlag(channelPoints, value))}
          onChange={(value) => setChannelPoints(value.reduce((a, b) => a | b, 0))}>
          <Checkbox key="channelPoints" value={ChannelPointsFlags.CHANNEL_POINTS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Channel Points'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show channel points in the chat window'})}
            </p>
          </Checkbox>
          <Checkbox key="autoClaim" value={ChannelPointsFlags.AUTO_CLAIM}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Auto-claim Bonus Channel Points'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Automatically claim bonus channel points'})}
            </p>
          </Checkbox>
          <Checkbox key="messageHighlights" value={ChannelPointsFlags.MESSAGE_HIGHLIGHTS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Message Highlight Rewards'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show channel point highlighted messages in the chat window'})}
            </p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

registerComponent(ChannelPointsModule, {
  settingId: SettingIds.CHANNEL_POINTS,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['channel', 'points', 'auto', 'claim'],
});
