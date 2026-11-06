import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, AutoClaimFlags, ChannelPointsFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {hasFlag, setFlag} from '@/utils/flags';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Claim'});

function AutoClaim({ref, ...props}) {
  const [autoClaim, setAutoClaim] = useStorageState(SettingIds.AUTO_CLAIM);
  const [channelPoints, setChannelPoints] = useStorageState(SettingIds.CHANNEL_POINTS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingCheckbox
        name={formatMessage({defaultMessage: 'Claim bonus points'})}
        description={formatMessage({
          defaultMessage: "Collects them as soon as they're available.",
        })}
        checked={hasFlag(channelPoints, ChannelPointsFlags.AUTO_CLAIM)}
        onChange={(checked) => setChannelPoints(setFlag(channelPoints, ChannelPointsFlags.AUTO_CLAIM, checked))}
      />
      <SettingCheckbox
        name={formatMessage({defaultMessage: 'Claim drops'})}
        description={formatMessage({
          defaultMessage: 'Collects them as soon as you earn them.',
        })}
        checked={hasFlag(autoClaim, AutoClaimFlags.DROPS)}
        onChange={(checked) => setAutoClaim(setFlag(autoClaim, AutoClaimFlags.DROPS, checked))}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(AutoClaim, {
  settingPanelId: SettingPanelIds.AUTO_CLAIM,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default AutoClaim;
