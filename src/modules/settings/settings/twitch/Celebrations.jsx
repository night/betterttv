import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, CelebrationFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'On-Screen Effects'});

function Celebrations({ref, ...props}) {
  const [celebrations, setCelebrations] = useStorageState(SettingIds.CELEBRATIONS);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={celebrations}
      onChange={setCelebrations}
      flags={Object.values(CelebrationFlags)}>
      <SettingCheckbox
        value={CelebrationFlags.CELEBRATIONS}
        name={formatMessage({defaultMessage: 'Celebrations'})}
        description={formatMessage({
          defaultMessage: 'Show On-Screen Celebrations that viewers buy with Bits, such as fireworks and emote rain.',
        })}
      />
      <SettingCheckbox
        value={CelebrationFlags.HYPE_TRAIN_ANIMATIONS}
        name={formatMessage({defaultMessage: 'Hype Train Animations'})}
        description={formatMessage({
          defaultMessage: 'Show the confetti and fireworks that play when a Hype Train levels up.',
        })}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(Celebrations, {
  settingPanelId: SettingPanelIds.CELEBRATIONS,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Celebrations;
