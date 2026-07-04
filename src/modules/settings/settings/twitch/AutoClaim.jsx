import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, AutoClaimFlags, ChannelPointsFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import {hasFlag, setFlag} from '@/utils/flags';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Claim'});

function AutoClaim({ref, ...props}) {
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

SettingStore.registerSetting(AutoClaim, {
  settingPanelId: SettingPanelIds.AUTO_CLAIM,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['auto', 'claim', 'drops', 'moments', 'points'],
});

export default AutoClaim;
