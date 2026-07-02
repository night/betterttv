import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, AutoPlayFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';
import {isStandaloneWindow} from '@/utils/window';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Play'});

const FP_VIDEO_NAME = formatMessage({defaultMessage: 'Front Page Player'});
const FP_VIDEO_DESCRIPTION = formatMessage({defaultMessage: 'Automatically play videos on the front page.'});
const OFFLINE_CHANNEL_VIDEO_NAME = formatMessage({defaultMessage: 'Offline Channel Player'});
const OFFLINE_CHANNEL_VIDEO_DESCRIPTION = formatMessage({
  defaultMessage: 'Automatically play the welcome video or last stream on offline channels.',
});
const VOD_RECOMMENDATION_NAME = formatMessage({defaultMessage: 'VOD Player'});
const VOD_RECOMMENDATION_DESCRIPTION = formatMessage({
  defaultMessage: 'Automatically play recommended videos on VoDs.',
});

function AutoplayModule({ref, ...props}) {
  const [autoplay, setAutoplay] = useStorageState(SettingIds.AUTO_PLAY);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={autoplay}
      onChange={setAutoplay}
      flags={Object.values(AutoPlayFlags)}>
      <SettingCheckbox value={AutoPlayFlags.FP_VIDEO} name={FP_VIDEO_NAME} description={FP_VIDEO_DESCRIPTION} />
      <SettingCheckbox
        value={AutoPlayFlags.OFFLINE_CHANNEL_VIDEO}
        name={OFFLINE_CHANNEL_VIDEO_NAME}
        description={OFFLINE_CHANNEL_VIDEO_DESCRIPTION}
      />
      <SettingCheckbox
        value={AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY}
        name={VOD_RECOMMENDATION_NAME}
        description={VOD_RECOMMENDATION_DESCRIPTION}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(AutoplayModule, {
  settingPanelId: SettingPanelIds.AUTO_PLAY,
  name: SETTING_NAME,
});

for (const entry of [
  {name: FP_VIDEO_NAME, description: FP_VIDEO_DESCRIPTION},
  {name: OFFLINE_CHANNEL_VIDEO_NAME, description: OFFLINE_CHANNEL_VIDEO_DESCRIPTION},
  {name: VOD_RECOMMENDATION_NAME, description: VOD_RECOMMENDATION_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({
    ...entry,
    goto: () => gotoSettingPanel(SettingPanelIds.AUTO_PLAY),
    predicate: () => !isStandaloneWindow(),
  });
}

export default AutoplayModule;
