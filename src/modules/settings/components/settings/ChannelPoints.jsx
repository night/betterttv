import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Checkbox from 'rsuite/lib/Checkbox/index.js';
import CheckboxGroup from 'rsuite/lib/CheckboxGroup/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {SettingIds, CategoryTypes, ChannelPointsFlags} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import {hasFlag} from '../../../../utils/flags.js';

function ChannelPointsModule() {
  const [channelPoints, setChannelPoints] = useStorageState(SettingIds.CHANNEL_POINTS);

  return (
    <Panel header="Channel Points">
      <div className={styles.setting}>
        <p className={styles.description}>Edit or modify the channel points</p>
        <CheckboxGroup
          value={Object.values(ChannelPointsFlags).filter((value) => hasFlag(channelPoints, value))}
          onChange={(value) => setChannelPoints(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="channelPoints" value={ChannelPointsFlags.CHANNEL_POINTS}>
            <p>Channel Points</p>
            <p className={styles.description}>Show channel points in the chat window</p>
          </Checkbox>
          <Checkbox key="autoClaim" value={ChannelPointsFlags.AUTO_CLAIM}>
            <p>Auto-claim Bonus Channel Points</p>
            <p className={styles.description}>Automatically claim bonus channel points</p>
          </Checkbox>
          <Checkbox key="messageHighlights" value={ChannelPointsFlags.MESSAGE_HIGHLIGHTS}>
            <p>Message Highlight Rewards</p>
            <p className={styles.description}>Show channel point highlighted messages in the chat window</p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

export default registerComponent(ChannelPointsModule, {
  settingId: SettingIds.CHANNEL_POINTS,
  name: 'Channel Points',
  category: CategoryTypes.CHAT,
  keywords: ['channel', 'points', 'auto', 'claim'],
});
