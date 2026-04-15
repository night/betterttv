import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds, EmoteTypeFlags} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import {hasFlag} from '../../../../utils/flags.js';
import globalEmotes from '../../../emotes/global-emotes.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingCheckbox from '../../components/SettingCheckbox.jsx';
import SettingCheckboxGroup from '../../components/SettingCheckboxGroup.jsx';
import styles from './Emotes.module.css';
import {Anchor, Kbd, Text} from '@mantine/core';
import {openConfirmModal, openModal} from '../../../../common/utils/modal.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Emotes'});

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

function EmotesModule(props, ref) {
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
        name={formatMessage({defaultMessage: 'Animated Emotes'})}
        description={formatMessage({
          defaultMessage: 'Autoplays animated emotes, otherwise only when hovered.',
        })}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.ANIMATED_PERSONAL_EMOTES}
        name={formatMessage({defaultMessage: 'Animated Personal Emotes'})}
        description={formatMessage({
          defaultMessage: 'Autoplays animated personal emotes, otherwise only when hovered.',
        })}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.EMOTE_MODIFIERS}
        name={formatMessage({defaultMessage: 'Emote Modifiers'})}
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
        name={formatMessage({defaultMessage: 'BetterTTV Emotes'})}
        description={formatMessage({defaultMessage: 'Adds extra cool emotes for you to use.'})}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.FFZ_EMOTES}
        name={formatMessage({defaultMessage: 'FrankerFaceZ Emotes'})}
        description={formatMessage({
          defaultMessage: 'Enables emotes from the third party FrankerFaceZ extension.',
        })}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.SEVENTV_EMOTES}
        name={formatMessage({defaultMessage: '7TV Emotes'})}
        description={formatMessage({
          defaultMessage: 'Enables emotes from the third party 7TV extension.',
        })}
      />
      <SettingCheckbox
        value={EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES}
        name={formatMessage({defaultMessage: 'Unlisted 7TV Emotes'})}
        description={formatMessage({
          defaultMessage: 'Enables unlisted emotes from the third party 7TV extension.',
        })}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(EmotesModule), {
  settingPanelId: SettingPanelIds.EMOTES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['bttv', 'ffz', '7tv', 'betterttv', 'frankerfacez', 'animated', 'gif', 'images', 'emotes'],
});

export default React.forwardRef(EmotesModule);
