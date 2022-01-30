import React from 'react';
import Panel from 'rsuite/Panel';
import Radio from 'rsuite/Radio';
import RadioGroup from 'rsuite/RadioGroup';
import FormGroup from 'rsuite/FormGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, ChatLayoutTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

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
                <p className={styles.heading}>Right</p>
                <p className={styles.description}>Moves the chat to the right of the player.</p>
              </div>
            </Radio>
            <Radio key="left" value={ChatLayoutTypes.LEFT}>
              <div>
                <p className={styles.heading}>Left</p>
                <p className={styles.description}>Moves the chat to the left of the player.</p>
              </div>
            </Radio>
          </RadioGroup>
        </FormGroup>
      </div>
    </Panel>
  );
}

registerComponent(ChatLayout, {
  settingId: SettingIds.CHAT_LAYOUT,
  name: 'Chat Layout',
  category: CategoryTypes.CHAT,
  keywords: ['chat', 'layout', 'position', 'placement', 'left', 'right'],
});
