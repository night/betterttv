import {Anchor, Kbd, Text} from '@mantine/core';
import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {openModal, WIDE_MODAL_SIZE} from '@/common/utils/modal';
import {SettingIds, EmoteTypeFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import globalEmotes from '@/modules/emotes/global-emotes';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';
import styles from './Emotes.module.css';
// settings list in the order they register, and Emote Providers comes first
import './EmoteProviders';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Display'});
const ANIMATED_EMOTES_NAME = formatMessage({defaultMessage: 'Animated Emotes'});
const ANIMATED_EMOTES_DESCRIPTION = formatMessage({
  defaultMessage: 'Autoplays animated emotes, otherwise only when hovered.',
});
const ANIMATED_PERSONAL_EMOTES_NAME = formatMessage({defaultMessage: 'Animated Personal Emotes'});
const ANIMATED_PERSONAL_EMOTES_DESCRIPTION = formatMessage({
  defaultMessage: 'Autoplays animated personal emotes, otherwise only when hovered.',
});
const EMOTE_MODIFIERS_NAME = formatMessage({defaultMessage: 'Emote Modifiers'});

const DISPLAY_FLAGS = [
  EmoteTypeFlags.ANIMATED_EMOTES,
  EmoteTypeFlags.ANIMATED_PERSONAL_EMOTES,
  EmoteTypeFlags.EMOTE_MODIFIERS,
];

const EMOTE_MODIFIERS_DESCRIPTION = {
  'w!': formatMessage({defaultMessage: 'Will display the emote in a wide format'}),
  'h!': formatMessage({defaultMessage: 'Will flip the emote horizontally'}),
  'v!': formatMessage({defaultMessage: 'Will flip the emote vertically'}),
  'z!': formatMessage({defaultMessage: 'Will remove the gap after the prior emote'}),
  'l!': formatMessage({defaultMessage: 'Will rotate the emote left'}),
  'r!': formatMessage({defaultMessage: 'Will rotate the emote right'}),
  'c!': formatMessage({defaultMessage: 'Will display the emote in a cursed format'}),
  'p!': formatMessage({defaultMessage: 'Will display the emote in a party format'}),
  's!': formatMessage({defaultMessage: 'Will display the emote in a shaking motion'}),
};

function EmoteModifier({emote, modifier, description}) {
  return (
    <div className={styles.modifier}>
      {emote != null ? <img className={styles.modifierImage} src={emote.images['4x']} alt={emote.code} /> : null}
      <Kbd size="lg" className={styles.modifierCode}>
        {modifier}
      </Kbd>
      <Text size="md" className={styles.modifierDescription}>
        {description}
      </Text>
    </div>
  );
}

function EmoteModifiersList() {
  return (
    <div className={styles.modifiersList}>
      {Object.entries(EMOTE_MODIFIERS_DESCRIPTION)
        .map(([modifier, description]) => ({modifier, description, emote: globalEmotes.getEligibleEmote(modifier)}))
        .map(({emote, modifier, description}) => (
          <EmoteModifier key={modifier} emote={emote} modifier={modifier} description={description} />
        ))}
    </div>
  );
}

function EmoteModifiersModalBody() {
  return (
    <div className={styles.modifiersModalBody}>
      <Text size="md" className={styles.modifiersModalDescription}>
        {formatMessage({
          defaultMessage:
            'Emote modifiers allow you to transform emotes in realtime. To use them, simply add the modifier to the start of the emote code. For example, w! FeelsGoodMan will display the emote in a wide format.',
        })}
      </Text>
      <EmoteModifiersList />
    </div>
  );
}

function openEmoteModifiersModal() {
  return openModal({
    title: EMOTE_MODIFIERS_NAME,
    size: WIDE_MODAL_SIZE,
    children: <EmoteModifiersModalBody />,
  });
}

function EmoteDisplay({ref, ...props}) {
  const [emotes, setEmotes] = useStorageState(SettingIds.EMOTES);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={emotes}
      onChange={setEmotes}
      flags={DISPLAY_FLAGS}>
      <SettingCheckbox
        value={EmoteTypeFlags.ANIMATED_EMOTES}
        name={ANIMATED_EMOTES_NAME}
        description={ANIMATED_EMOTES_DESCRIPTION}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.ANIMATED_PERSONAL_EMOTES}
        name={ANIMATED_PERSONAL_EMOTES_NAME}
        description={ANIMATED_PERSONAL_EMOTES_DESCRIPTION}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.EMOTE_MODIFIERS}
        name={EMOTE_MODIFIERS_NAME}
        description={formatMessage(
          {defaultMessage: '<link>Emote modifiers</link> allow you to transform emotes in realtime.'},
          {
            link: (string) => (
              <Anchor key="emoteModifiersLink" component="button" onClick={openEmoteModifiersModal}>
                {string}
              </Anchor>
            ),
          }
        )}
      />
    </SettingCheckboxGroup>
  );
}

registerSearchEntry({
  query: ANIMATED_EMOTES_NAME,
  description: ANIMATED_EMOTES_DESCRIPTION,
  settingPanelId: SettingPanelIds.EMOTE_DISPLAY,
});

registerSearchEntry({
  query: ANIMATED_PERSONAL_EMOTES_NAME,
  description: ANIMATED_PERSONAL_EMOTES_DESCRIPTION,
  settingPanelId: SettingPanelIds.EMOTE_DISPLAY,
});

registerSearchEntry({
  query: EMOTE_MODIFIERS_NAME,
  settingPanelId: SettingPanelIds.EMOTE_DISPLAY,
});

SettingStore.registerSetting(EmoteDisplay, {
  settingPanelId: SettingPanelIds.EMOTE_DISPLAY,
  settingCategoryId: SettingCategoryIds.EMOTES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default EmoteDisplay;
