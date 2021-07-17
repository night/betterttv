import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Radio from 'rsuite/lib/Radio/index.js';
import RadioGroup from 'rsuite/lib/RadioGroup/index.js';
import FormGroup from 'rsuite/lib/FormGroup/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds, ChatLayoutTypes} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function ChatLayout() {
  const [value, setValue] = useStorageState(SettingIds.CHAT_LAYOUT);

  return (
    <Panel header="Chat Layout">
      <div className={styles.setting}>
        <p className={styles.description}>Change the chat placement.</p>
        <FormGroup controlId="radioList">
          <RadioGroup name="radioList" value={value} onChange={(state) => setValue(state)}>
            <Radio key="right" value={ChatLayoutTypes.RIGHT}>
              <div>
                <p>Right</p>
                <p className={styles.description}>Moves the chat to the right of the player.</p>
              </div>
            </Radio>
            <Radio key="left" value={ChatLayoutTypes.LEFT}>
              <div>
                <p>Left</p>
                <p className={styles.description}>Moves the chat to the left of the player.</p>
              </div>
            </Radio>
          </RadioGroup>
        </FormGroup>
      </div>
    </Panel>
  );
}

export default registerComponent(ChatLayout, {
  settingId: SettingIds.CHAT_LAYOUT,
  name: 'Chat Layout',
  category: CategoryTypes.CHAT,
  keywords: ['chat', 'layout', 'position', 'placement', 'left', 'right'],
});
