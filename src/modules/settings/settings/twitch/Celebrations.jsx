import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, CelebrationFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'On-Screen Effects'});
const CELEBRATIONS_NAME = formatMessage({defaultMessage: 'Celebrations'});
const CELEBRATIONS_DESCRIPTION = formatMessage({
  defaultMessage:
    'Show On-Screen Celebrations, such as fireworks and emote rain that viewers buy with Bits, and celebrations for gifted subs.',
});
const HYPE_TRAIN_ANIMATIONS_NAME = formatMessage({defaultMessage: 'Hype Train Animations'});
const HYPE_TRAIN_ANIMATIONS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show the confetti and fireworks that play during a Hype Train.',
});

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
        name={CELEBRATIONS_NAME}
        description={CELEBRATIONS_DESCRIPTION}
      />
      <SettingCheckbox
        value={CelebrationFlags.HYPE_TRAIN_ANIMATIONS}
        name={HYPE_TRAIN_ANIMATIONS_NAME}
        description={HYPE_TRAIN_ANIMATIONS_DESCRIPTION}
      />
    </SettingCheckboxGroup>
  );
}

registerSearchEntry({
  query: CELEBRATIONS_NAME,
  description: CELEBRATIONS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CELEBRATIONS,
});

registerSearchEntry({
  query: HYPE_TRAIN_ANIMATIONS_NAME,
  description: HYPE_TRAIN_ANIMATIONS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CELEBRATIONS,
});

SettingStore.registerSetting(Celebrations, {
  settingPanelId: SettingPanelIds.CELEBRATIONS,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['confetti', 'fireworks', 'emote rain', 'power-ups'],
});

export default Celebrations;
