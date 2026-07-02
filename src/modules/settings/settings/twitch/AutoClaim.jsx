import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, AutoClaimFlags, ChannelPointsFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';
import {hasFlag, setFlag} from '@/utils/flags';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Claim'});

const BONUS_CHANNEL_POINTS_NAME = formatMessage({defaultMessage: 'Bonus Channel Points'});
const BONUS_CHANNEL_POINTS_DESCRIPTION = formatMessage({defaultMessage: 'Claim bonus channel points when available.'});
const DROPS_NAME = formatMessage({defaultMessage: 'Drops'});
const DROPS_DESCRIPTION = formatMessage({defaultMessage: 'Claim all drops once you earn them.'});

function AutoClaim({ref, ...props}) {
  const [autoClaim, setAutoClaim] = useStorageState(SettingIds.AUTO_CLAIM);
  const [channelPoints, setChannelPoints] = useStorageState(SettingIds.CHANNEL_POINTS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingCheckbox
        name={BONUS_CHANNEL_POINTS_NAME}
        description={BONUS_CHANNEL_POINTS_DESCRIPTION}
        checked={hasFlag(channelPoints, ChannelPointsFlags.AUTO_CLAIM)}
        onChange={(checked) => setChannelPoints(setFlag(channelPoints, ChannelPointsFlags.AUTO_CLAIM, checked))}
      />
      <SettingCheckbox
        name={DROPS_NAME}
        description={DROPS_DESCRIPTION}
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
});

for (const entry of [
  {name: BONUS_CHANNEL_POINTS_NAME, description: BONUS_CHANNEL_POINTS_DESCRIPTION},
  {name: DROPS_NAME, description: DROPS_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.AUTO_CLAIM)});
}

export default AutoClaim;
