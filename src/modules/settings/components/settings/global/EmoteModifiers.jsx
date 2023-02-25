import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Modifiers'});

function EmoteModifiers() {
  const [emoteModifiersValue, setEmoteModifiersValue] = useStorageState(SettingIds.EMOTE_MODIFIERS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Emote modifiers customize the appearance of emotes in chat.'})}
        </p>
        <Toggle checked={emoteModifiersValue} onChange={(state) => setEmoteModifiersValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(EmoteModifiers, {
  settingId: SettingIds.EMOTE_MENU,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['wide', 'flipped', 'emotes', 'modifier'],
});
