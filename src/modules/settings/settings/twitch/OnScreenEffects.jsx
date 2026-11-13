import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {OnScreenEffectFlags, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'On-Screen Effects'});
const ON_SCREEN_CELEBRATIONS_NAME = formatMessage({defaultMessage: 'On-Screen Celebrations'});
const ON_SCREEN_CELEBRATIONS_DESCRIPTION = formatMessage({
  defaultMessage:
    'Show On-Screen Celebrations, such as fireworks and emote rain that viewers buy with Bits, and celebrations for gifted subs.',
});
const HYPE_TRAIN_ANIMATIONS_NAME = formatMessage({defaultMessage: 'Hype Train Animations'});
const HYPE_TRAIN_ANIMATIONS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show the confetti and fireworks that play during a Hype Train.',
});

function OnScreenEffects({ref, ...props}) {
  const [onScreenEffects, setOnScreenEffects] = useStorageState(SettingIds.ON_SCREEN_EFFECTS);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={onScreenEffects}
      onChange={setOnScreenEffects}
      flags={Object.values(OnScreenEffectFlags)}>
      <SettingCheckbox
        value={OnScreenEffectFlags.ON_SCREEN_CELEBRATIONS}
        name={ON_SCREEN_CELEBRATIONS_NAME}
        description={ON_SCREEN_CELEBRATIONS_DESCRIPTION}
      />
      <SettingCheckbox
        value={OnScreenEffectFlags.HYPE_TRAIN_ANIMATIONS}
        name={HYPE_TRAIN_ANIMATIONS_NAME}
        description={HYPE_TRAIN_ANIMATIONS_DESCRIPTION}
      />
    </SettingCheckboxGroup>
  );
}

registerSearchEntry({
  query: ON_SCREEN_CELEBRATIONS_NAME,
  description: ON_SCREEN_CELEBRATIONS_DESCRIPTION,
  settingPanelId: SettingPanelIds.ON_SCREEN_EFFECTS,
});

registerSearchEntry({
  query: HYPE_TRAIN_ANIMATIONS_NAME,
  description: HYPE_TRAIN_ANIMATIONS_DESCRIPTION,
  settingPanelId: SettingPanelIds.ON_SCREEN_EFFECTS,
});

SettingStore.registerSetting(OnScreenEffects, {
  settingPanelId: SettingPanelIds.ON_SCREEN_EFFECTS,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['confetti', 'fireworks', 'emote rain', 'power-ups'],
});

export default OnScreenEffects;
