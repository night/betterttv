import {Anchor, Kbd, Text} from '@mantine/core';
import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {openConfirmModal, openModal} from '@/common/utils/modal';
import {SettingIds, EmoteTypeFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import globalEmotes from '@/modules/emotes/global-emotes';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';
import {hasFlag} from '@/utils/flags';
import styles from './Emotes.module.css';

const SETTING_NAME = formatMessage({defaultMessage: 'Emotes'});

const ANIMATED_EMOTES_NAME = formatMessage({defaultMessage: 'Animated Emotes'});
const ANIMATED_EMOTES_DESCRIPTION = formatMessage({
  defaultMessage: 'Autoplays animated emotes, otherwise only when hovered.',
});
const ANIMATED_PERSONAL_EMOTES_NAME = formatMessage({defaultMessage: 'Animated Personal Emotes'});
const ANIMATED_PERSONAL_EMOTES_DESCRIPTION = formatMessage({
  defaultMessage: 'Autoplays animated personal emotes, otherwise only when hovered.',
});
const EMOTE_MODIFIERS_NAME = formatMessage({defaultMessage: 'Emote Modifiers'});
const EMOTE_MODIFIERS_PLAIN_DESCRIPTION = formatMessage({
  defaultMessage: 'Emote modifiers allow you to transform emotes in realtime.',
});
const BTTV_EMOTES_NAME = formatMessage({defaultMessage: 'BetterTTV Emotes'});
const BTTV_EMOTES_DESCRIPTION = formatMessage({defaultMessage: 'Adds extra cool emotes for you to use.'});
const FFZ_EMOTES_NAME = formatMessage({defaultMessage: 'FrankerFaceZ Emotes'});
const FFZ_EMOTES_DESCRIPTION = formatMessage({
  defaultMessage: 'Enables emotes from the third party FrankerFaceZ extension.',
});
const SEVENTV_EMOTES_NAME = formatMessage({defaultMessage: '7TV Emotes'});
const SEVENTV_EMOTES_DESCRIPTION = formatMessage({
  defaultMessage: 'Enables emotes from the third party 7TV extension.',
});
const SEVENTV_UNLISTED_EMOTES_NAME = formatMessage({defaultMessage: 'Unlisted 7TV Emotes'});
const SEVENTV_UNLISTED_EMOTES_DESCRIPTION = formatMessage({
  defaultMessage: 'Enables unlisted emotes from the third party 7TV extension.',
});

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
    title: formatMessage({defaultMessage: 'Emote Modifiers'}),
    children: <EmoteModifiersModalBody />,
  });
}

function EmotesModule({ref, ...props}) {
  const [emotes, setEmotes] = useStorageState(SettingIds.EMOTES);

  function handleEmoteModifiersChange(newFlags) {
    const oldUnlistedSeventvFlag = hasFlag(emotes, EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES);
    const newUnlistedSeventvFlag = hasFlag(newFlags, EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES);

    if (!oldUnlistedSeventvFlag && newUnlistedSeventvFlag) {
      openConfirmModal({
        confirmProps: {color: 'red', size: 'lg', variant: 'elevated'},
        onConfirm: () => setEmotes(newFlags),
        title: formatMessage({defaultMessage: 'Warning'}),
        description: formatMessage({
          defaultMessage:
            'This content has been flagged by the community for its poor moderation standards. Content from this extension is not reviewed by BetterTTV, and you may encounter unsavory content. Are you sure you want to proceed?',
        }),
        labels: {
          confirm: formatMessage({defaultMessage: 'Enable Anyway'}),
          cancel: formatMessage({defaultMessage: 'Cancel'}),
        },
      });

      return;
    }

    setEmotes(newFlags);
  }

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={emotes}
      onChange={handleEmoteModifiersChange}
      flags={Object.values(EmoteTypeFlags)}>
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
      <SettingCheckbox
        value={EmoteTypeFlags.BTTV_EMOTES}
        name={BTTV_EMOTES_NAME}
        description={BTTV_EMOTES_DESCRIPTION}
      />
      <SettingCheckbox value={EmoteTypeFlags.FFZ_EMOTES} name={FFZ_EMOTES_NAME} description={FFZ_EMOTES_DESCRIPTION} />
      <SettingCheckbox
        value={EmoteTypeFlags.SEVENTV_EMOTES}
        name={SEVENTV_EMOTES_NAME}
        description={SEVENTV_EMOTES_DESCRIPTION}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES}
        name={SEVENTV_UNLISTED_EMOTES_NAME}
        description={SEVENTV_UNLISTED_EMOTES_DESCRIPTION}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(EmotesModule, {
  settingPanelId: SettingPanelIds.EMOTES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

for (const entry of [
  {name: ANIMATED_EMOTES_NAME, description: ANIMATED_EMOTES_DESCRIPTION},
  {name: ANIMATED_PERSONAL_EMOTES_NAME, description: ANIMATED_PERSONAL_EMOTES_DESCRIPTION},
  {name: EMOTE_MODIFIERS_NAME, description: EMOTE_MODIFIERS_PLAIN_DESCRIPTION},
  {name: BTTV_EMOTES_NAME, description: BTTV_EMOTES_DESCRIPTION},
  {name: FFZ_EMOTES_NAME, description: FFZ_EMOTES_DESCRIPTION},
  {name: SEVENTV_EMOTES_NAME, description: SEVENTV_EMOTES_DESCRIPTION},
  {name: SEVENTV_UNLISTED_EMOTES_NAME, description: SEVENTV_UNLISTED_EMOTES_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.EMOTES)});
}

export default EmotesModule;
