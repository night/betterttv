import React, {useState} from 'react';
import Button from 'rsuite/Button';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import Modal from 'rsuite/Modal';
import Panel from 'rsuite/Panel';
import Tag from 'rsuite/Tag';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds, EmoteTypeFlags} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import {hasFlag, setFlag} from '../../../../../utils/flags.js';
import globalEmotes from '../../../../emotes/global-emotes.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';
import emotesStyles from './Emotes.module.css';

const SETTING_NAME = formatMessage({defaultMessage: 'Emotes'});

function SafetyWarningModal({open, onClose}) {
  return (
    <Modal backdrop="static" role="alertdialog" open={open} onClose={() => onClose(false)} size="xs">
      <Modal.Header>
        <strong>{formatMessage({defaultMessage: 'Warning'})}</strong>
      </Modal.Header>
      <Modal.Body>
        {formatMessage({
          defaultMessage:
            'This content has been flagged by the community for its poor moderation standards. Content from this extension is not reviewed by BetterTTV, and you may encounter unsavory content. Are you sure you want to proceed?',
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => onClose(true)} appearance="subtle">
          {formatMessage({defaultMessage: 'Continue'})}
        </Button>
        <Button onClick={() => onClose(false)}>{formatMessage({defaultMessage: 'Cancel'})}</Button>
      </Modal.Footer>
    </Modal>
  );
}

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

function EmoteModifiersModal({open, onClose}) {
  return (
    <Modal backdrop="static" open={open} onClose={() => onClose()} size="xs">
      <Modal.Header>
        <strong>{formatMessage({defaultMessage: 'Emote Modifiers'})}</strong>
      </Modal.Header>
      <Modal.Body>
        <p className={emotesStyles.modifiersModalDescription}>
          {formatMessage({
            defaultMessage:
              'Emote modifiers allow you to transform emotes in realtime. To use them, simply add the modifier to the start of the emote code. For example, w! FeelsGoodMan will display the emote in a wide format.',
          })}
        </p>
        <div className={emotesStyles.modifiersModalBody}>
          {Object.entries(EMOTE_MODIFIERS_DESCRIPTION).map(([modifier, description]) => {
            const emote = globalEmotes.getEligibleEmote(modifier);
            if (emote == null) {
              return null;
            }
            return (
              <div key={modifier} className={emotesStyles.modifier}>
                <img className={emotesStyles.modifierImage} src={emote.images['4x']} alt={emote.code} />
                <Tag size="sm" className={emotesStyles.modifierCode}>
                  {modifier}
                </Tag>
                <p className={emotesStyles.modifierDescription}>{description}</p>
              </div>
            );
          })}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => onClose(false)}>{formatMessage({defaultMessage: 'Close'})}</Button>
      </Modal.Footer>
    </Modal>
  );
}

function EmotesModule() {
  const [emotes, setEmotes] = useStorageState(SettingIds.EMOTES);
  const [safetyModalFlagValue, setSafetyModalFlagValue] = useState(0);
  const [modifiersModalOpen, setModifiersModalOpen] = useState(false);

  function handleSafetyWarning(event, flagValue) {
    if (hasFlag(emotes, flagValue)) {
      return;
    }

    event.preventDefault();
    setSafetyModalFlagValue(flagValue);
  }

  function handleSafetyWarningClose(allow) {
    if (allow) {
      setEmotes(setFlag(emotes, safetyModalFlagValue, true));
    }
    setSafetyModalFlagValue(0);
  }

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>{formatMessage({defaultMessage: 'Adds more emotes to your chat'})}</p>
        <CheckboxGroup
          value={Object.values(EmoteTypeFlags).filter((value) => hasFlag(emotes, value))}
          onChange={(value) => setEmotes(value.reduce((a, b) => a | b, 0))}>
          <Checkbox key="bttvAnimatedEmotes" value={EmoteTypeFlags.ANIMATED_EMOTES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Animated Emotes'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({
                defaultMessage: 'Autoplays animated emotes. When disabled, emotes only animate when hovered',
              })}
            </p>
          </Checkbox>
          <Checkbox key="bttvAnimatedPersonalEmotes" value={EmoteTypeFlags.ANIMATED_PERSONAL_EMOTES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Animated Personal Emotes'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({
                defaultMessage:
                  'Autoplays animated personal emotes. When disabled, personal emotes only animate when hovered',
              })}
            </p>
          </Checkbox>
          <Checkbox key="emoteModifiers" value={EmoteTypeFlags.EMOTE_MODIFIERS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Emote Modifiers'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage(
                {
                  defaultMessage: '<link>Emote modifiers</link> allow you to transform emotes in realtime.',
                },
                {
                  // eslint-disable-next-line react/no-unstable-nested-components
                  link: (string) => (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a key="emoteModifiersLink" href="#" onClick={() => setModifiersModalOpen(true)}>
                      {string}
                    </a>
                  ),
                }
              )}
            </p>
          </Checkbox>
          <Checkbox key="bttvEmotes" value={EmoteTypeFlags.BTTV_EMOTES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'BetterTTV Emotes'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Adds extra cool emotes for you to use'})}
            </p>
          </Checkbox>
          <Checkbox key="ffzEmotes" value={EmoteTypeFlags.FFZ_EMOTES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'FrankerFaceZ Emotes'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Enables emotes from the third party FrankerFaceZ extension'})}
            </p>
          </Checkbox>
          <Checkbox key="seventvEmotes" value={EmoteTypeFlags.SEVENTV_EMOTES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: '7TV Emotes'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Enables emotes from the third party 7TV extension'})}
            </p>
          </Checkbox>
          {hasFlag(emotes, EmoteTypeFlags.SEVENTV_EMOTES) ? (
            <Checkbox
              key="seventvUnlistedEmotes"
              value={EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES}
              onClick={(event) => handleSafetyWarning(event, EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES)}>
              <p className={styles.heading}>{formatMessage({defaultMessage: 'Unlisted 7TV Emotes'})}</p>
              <p className={styles.settingDescription}>
                {formatMessage({defaultMessage: 'Enables unlisted emotes from the third party 7TV extension'})}
              </p>
            </Checkbox>
          ) : null}
        </CheckboxGroup>
      </div>
      <SafetyWarningModal open={safetyModalFlagValue > 0} onClose={(allow) => handleSafetyWarningClose(allow)} />
      <EmoteModifiersModal open={modifiersModalOpen} onClose={setModifiersModalOpen} />
    </Panel>
  );
}

registerComponent(EmotesModule, {
  settingId: SettingIds.EMOTES,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['bttv', 'ffz', '7tv', 'betterttv', 'frankerfacez', 'animated', 'gif', 'images', 'emotes'],
});
