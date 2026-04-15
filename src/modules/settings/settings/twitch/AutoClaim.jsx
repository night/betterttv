import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds, AutoClaimFlags, ChannelPointsFlags} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import {hasFlag, setFlag} from '../../../../utils/flags.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingCheckbox from '../../components/SettingCheckbox.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Claim'});

function AutoClaim(props, ref) {
  const [autoClaim, setAutoClaim] = useStorageState(SettingIds.AUTO_CLAIM);
  const [channelPoints, setChannelPoints] = useStorageState(SettingIds.CHANNEL_POINTS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingCheckbox
        name={formatMessage({defaultMessage: 'Bonus Channel Points'})}
        description={formatMessage({
          defaultMessage: 'Claim bonus channel points when available.',
        })}
        checked={hasFlag(channelPoints, ChannelPointsFlags.AUTO_CLAIM)}
        onChange={(checked) => setChannelPoints(setFlag(channelPoints, ChannelPointsFlags.AUTO_CLAIM, checked))}
      />
      <SettingCheckbox
        name={formatMessage({defaultMessage: 'Drops'})}
        description={formatMessage({
          defaultMessage: 'Claim all drops once you earn them.',
        })}
        checked={hasFlag(autoClaim, AutoClaimFlags.DROPS)}
        onChange={(checked) => setAutoClaim(setFlag(autoClaim, AutoClaimFlags.DROPS, checked))}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(AutoClaim), {
  settingPanelId: SettingPanelIds.AUTO_CLAIM,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['auto', 'claim', 'drops', 'moments', 'points'],
});

export default React.forwardRef(AutoClaim);
