import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, AutoPlayFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Play'});

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
        name={formatMessage({defaultMessage: 'Front Page Player'})}
        description={formatMessage({defaultMessage: 'Automatically play videos on the front page.'})}
      />
      <SettingCheckbox
        value={AutoPlayFlags.OFFLINE_CHANNEL_VIDEO}
        name={formatMessage({defaultMessage: 'Offline Channel Player'})}
        description={formatMessage({
          defaultMessage: 'Automatically play the welcome video or last stream on offline channels.',
        })}
      />
      <SettingCheckbox
        value={AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY}
        name={formatMessage({defaultMessage: 'VOD Player'})}
        description={formatMessage({
          defaultMessage: 'Automatically play recommended videos on VoDs.',
        })}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(AutoplayModule, {
  settingPanelId: SettingPanelIds.AUTO_PLAY,
  name: SETTING_NAME,
  keywords: ['auto', 'play'],
});

export default AutoplayModule;
