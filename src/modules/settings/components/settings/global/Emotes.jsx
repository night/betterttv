import React from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, EmoteTypeFlags} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import {hasFlag} from '../../../../../utils/flags.js';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Emotes'});

function EmotesModule() {
  const [emotes, setEmotes] = useStorageState(SettingIds.EMOTES);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>{formatMessage({defaultMessage: 'Adds more emotes to your chat'})}</p>
        <CheckboxGroup
          value={Object.values(EmoteTypeFlags).filter((value) => hasFlag(emotes, value))}
          onChange={(value) => setEmotes(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="bttvEmotes" value={EmoteTypeFlags.BTTV_EMOTES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'BetterTTV Emotes'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Adds extra cool emotes for you to use'})}
            </p>
          </Checkbox>
          <Checkbox key="bttvGifEmotes" value={EmoteTypeFlags.BTTV_GIF_EMOTES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'BetterTTV Animated Emotes'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Adds animated emotes (not everyone likes GIFs, but some people do'})})
            </p>
          </Checkbox>
          <Checkbox key="ffzEmotes" value={EmoteTypeFlags.FFZ_EMOTES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'FrankerFaceZ Emotes'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Enables emotes from that other extension people sometimes use'})}
            </p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

registerComponent(EmotesModule, {
  settingId: SettingIds.EMOTES,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['bttv', 'ffz', 'betterttv', 'frankerfacez', 'animated', 'gif', 'images', 'emotes'],
});
