import React, {useState} from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import Modal from 'rsuite/Modal';
import Button from 'rsuite/Button';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, EmoteTypeFlags} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import {hasFlag, setFlag} from '../../../../../utils/flags.js';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

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
            'This extension has been flagged by the community for its poor moderation standards. Content from this extension is not reviewed by BetterTTV, and you may encounter unsavory content. Are you sure you want to proceed?',
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

function EmotesModule() {
  const [emotes, setEmotes] = useStorageState(SettingIds.EMOTES);
  const [safetyModalFlagValue, setSafetyModalFlagValue] = useState(0);

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
                  defaultMessage:
                    'Emote modifiers allow you to transform emotes in realtime. Wide: <code>w! emoteName</code>, Horizontal Flip: <code>h! emoteName</code>, Vertical Flip: <code>v! emoteName</code>, Zero-Width: <code>z! emoteName</code>',
                },
                {
                  // eslint-disable-next-line react/no-unstable-nested-components
                  code: (string) => (
                    <span key={string} className={styles.codeBlock}>
                      {string}
                    </span>
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
          <Checkbox
            key="seventvEmotes"
            value={EmoteTypeFlags.SEVENTV_EMOTES}
            onClick={(event) => handleSafetyWarning(event, EmoteTypeFlags.SEVENTV_EMOTES)}>
            <p className={styles.heading}>{formatMessage({defaultMessage: '7TV Emotes'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Enables emotes from the third party 7TV extension'})}
            </p>
          </Checkbox>
        </CheckboxGroup>
      </div>
      <SafetyWarningModal open={safetyModalFlagValue > 0} onClose={(allow) => handleSafetyWarningClose(allow)} />
    </Panel>
  );
}

registerComponent(EmotesModule, {
  settingId: SettingIds.EMOTES,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['bttv', 'ffz', '7tv', 'betterttv', 'frankerfacez', 'animated', 'gif', 'images', 'emotes'],
});
