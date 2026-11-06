import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, AutoPlayFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

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
        name={formatMessage({defaultMessage: 'Autoplay on the homepage'})}
        description={formatMessage({defaultMessage: 'Starts videos as soon as the page loads.'})}
      />
      <SettingCheckbox
        value={AutoPlayFlags.OFFLINE_CHANNEL_VIDEO}
        name={formatMessage({defaultMessage: 'Autoplay on offline channels'})}
        description={formatMessage({
          defaultMessage: 'Starts the welcome video or last stream automatically.',
        })}
      />
      <SettingCheckbox
        value={AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY}
        name={formatMessage({defaultMessage: 'Autoplay on VODs'})}
        description={formatMessage({
          defaultMessage: 'Starts recommended videos.',
        })}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(AutoplayModule, {
  settingPanelId: SettingPanelIds.AUTO_PLAY,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
});

export default AutoplayModule;
