import React from 'react';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import Panel from 'rsuite/Panel';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {SettingIds, CategoryTypes, AutoClaimFlags, ChannelPointsFlags} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import {hasFlag, setFlag} from '../../../../../utils/flags.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Claim'});
const CHANNEL_POINTS_BONUSES = 'bonusChannelPoints';

function AutoClaim() {
  const [autoClaim, setAutoClaim] = useStorageState(SettingIds.AUTO_CLAIM);
  const [channelPoints, setChannelPoints] = useStorageState(SettingIds.CHANNEL_POINTS);

  const groupValue = Object.values(AutoClaimFlags).filter((value) => hasFlag(autoClaim, value));
  if (hasFlag(channelPoints, ChannelPointsFlags.AUTO_CLAIM)) {
    groupValue.push(CHANNEL_POINTS_BONUSES);
  }

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <CheckboxGroup
          value={groupValue}
          onChange={(value) => {
            const newAutoClaimValue = value
              .filter((item) => item !== CHANNEL_POINTS_BONUSES)
              .reduce((a, b) => a | b, 0);
            const isChannelPointsBonusesEnabled = value.includes(CHANNEL_POINTS_BONUSES);
            setAutoClaim(newAutoClaimValue);
            setChannelPoints(setFlag(channelPoints, ChannelPointsFlags.AUTO_CLAIM, isChannelPointsBonusesEnabled));
          }}>
          <Checkbox key="channelPointsBonuses" value={CHANNEL_POINTS_BONUSES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Bonus Channel Points'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Automatically claim bonus channel points when available'})}
            </p>
          </Checkbox>
          <Checkbox key="drops" value={AutoClaimFlags.DROPS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Drops'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Automatically claim all drops once you earn them'})}
            </p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

export default registerComponent(AutoClaim, {
  settingId: SettingIds.AUTO_CLAIM,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['auto', 'claim', 'drops', 'moments', 'points'],
});
