import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Radio from 'rsuite/lib/Radio/index.js';
import RadioGroup from 'rsuite/lib/RadioGroup/index.js';
import FormGroup from 'rsuite/lib/FormGroup/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds, DeletedMessageTypes} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function DeletedMessagesModule() {
  const [value, setValue] = useStorageState(SettingIds.DELETED_MESSAGES);

  return (
    <Panel header="Deleted Messages">
      <div className={styles.setting}>
        <p className={styles.description}>How should deleted messages be handled.</p>
        <FormGroup controlId="radioList">
          <RadioGroup name="radioList" value={value} onChange={(state) => setValue(state)}>
            <Radio key="default" value={DeletedMessageTypes.DEFAULT}>
              <div>
                <p>Default</p>
                <p className={styles.description}>Do what twitch normally does.</p>
              </div>
            </Radio>
            <Radio key="hideDeletedMessages" value={DeletedMessageTypes.HIDE}>
              <div>
                <p>Hide Deleted Messages</p>
                <p className={styles.description}>Completely removes timed out messages from view.</p>
              </div>
            </Radio>
            <Radio key="showDeletedMessages" value={DeletedMessageTypes.SHOW}>
              <div>
                <p>Show Deleted Messages</p>
                <p className={styles.description}>{"Changes <message deleted> back to users' original messages."}</p>
              </div>
            </Radio>
          </RadioGroup>
        </FormGroup>
      </div>
    </Panel>
  );
}

export default registerComponent(DeletedMessagesModule, {
  settingId: SettingIds.DELETED_MESSAGES,
  name: 'Deleted Messages',
  category: CategoryTypes.CHAT,
  keywords: ['messages', 'deleted'],
});
