import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, AutoPlayFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Play'});
const FRONT_PAGE_PLAYER_NAME = formatMessage({defaultMessage: 'Front Page Player'});
const FRONT_PAGE_PLAYER_DESCRIPTION = formatMessage({defaultMessage: 'Automatically play videos on the front page.'});
const OFFLINE_CHANNEL_PLAYER_NAME = formatMessage({defaultMessage: 'Offline Channel Player'});
const OFFLINE_CHANNEL_PLAYER_DESCRIPTION = formatMessage({
  defaultMessage: 'Automatically play the welcome video or last stream on offline channels.',
});
const VOD_PLAYER_NAME = formatMessage({defaultMessage: 'VOD Player'});
const VOD_PLAYER_DESCRIPTION = formatMessage({defaultMessage: 'Automatically play recommended videos on VoDs.'});

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
      <SettingCheckbox
        value={AutoPlayFlags.FP_VIDEO}
        name={FRONT_PAGE_PLAYER_NAME}
        description={FRONT_PAGE_PLAYER_DESCRIPTION}
      />
      <SettingCheckbox
        value={AutoPlayFlags.OFFLINE_CHANNEL_VIDEO}
        name={OFFLINE_CHANNEL_PLAYER_NAME}
        description={OFFLINE_CHANNEL_PLAYER_DESCRIPTION}
      />
      <SettingCheckbox
        value={AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY}
        name={VOD_PLAYER_NAME}
        description={VOD_PLAYER_DESCRIPTION}
      />
    </SettingCheckboxGroup>
  );
}

registerSearchEntry({
  query: FRONT_PAGE_PLAYER_NAME,
  description: FRONT_PAGE_PLAYER_DESCRIPTION,
  settingPanelId: SettingPanelIds.AUTO_PLAY,
});

registerSearchEntry({
  query: OFFLINE_CHANNEL_PLAYER_NAME,
  description: OFFLINE_CHANNEL_PLAYER_DESCRIPTION,
  settingPanelId: SettingPanelIds.AUTO_PLAY,
});

registerSearchEntry({
  query: VOD_PLAYER_NAME,
  description: VOD_PLAYER_DESCRIPTION,
  settingPanelId: SettingPanelIds.AUTO_PLAY,
});

SettingStore.registerSetting(AutoplayModule, {
  settingPanelId: SettingPanelIds.AUTO_PLAY,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
});

export default AutoplayModule;
