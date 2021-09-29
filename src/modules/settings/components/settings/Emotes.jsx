import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Checkbox from 'rsuite/lib/Checkbox/index.js';
import CheckboxGroup from 'rsuite/lib/CheckboxGroup/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds, EmoteTypeFlags} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import {hasFlag} from '../../../../utils/flags.js';

function EmotesModule() {
  const [emotes, setEmotes] = useStorageState(SettingIds.EMOTES);

  return (
    <Panel header="Emotes">
      <div className={styles.setting}>
        <p className={styles.description}>Adds more emotes to your chat</p>
        <CheckboxGroup
          value={Object.values(EmoteTypeFlags).filter((value) => hasFlag(emotes, value))}
          onChange={(value) => setEmotes(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="bttvEmotes" value={EmoteTypeFlags.BTTV_EMOTES}>
            <p>BetterTTV Emotes</p>
            <p className={styles.description}>Adds extra cool emotes for you to use</p>
          </Checkbox>
          <Checkbox key="bttvGifEmotes" value={EmoteTypeFlags.BTTV_GIF_EMOTES}>
            <p>BetterTTV Animated Emotes</p>
            <p className={styles.description}>Adds animated emotes (not everyone likes GIFs, but some people do)</p>
          </Checkbox>
          <Checkbox key="ffzEmotes" value={EmoteTypeFlags.FFZ_EMOTES}>
            <p>FrankerFaceZ Emotes</p>
            <p className={styles.description}>Enables emotes from that other extension people sometimes use</p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

export default registerComponent(EmotesModule, {
  settingId: SettingIds.EMOTES,
  name: 'Emotes',
  category: CategoryTypes.CHAT,
  keywords: ['bttv', 'ffz', 'betterttv', 'frankerfacez', 'animated', 'gif', 'images', 'emotes'],
});
