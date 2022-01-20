import React from 'react';
import Panel from 'rsuite/Panel';
import Radio from 'rsuite/Radio';
import RadioGroup from 'rsuite/RadioGroup';
import FormGroup from 'rsuite/FormGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, DeletedMessageTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

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
                <p className={styles.heading}>Default</p>
                <p className={styles.description}>Do what twitch normally does.</p>
              </div>
            </Radio>
            <Radio key="hideDeletedMessages" value={DeletedMessageTypes.HIDE}>
              <div>
                <p className={styles.heading}>Hide Deleted Messages</p>
                <p className={styles.description}>Completely removes timed out messages from view.</p>
              </div>
            </Radio>
            <Radio key="showDeletedMessages" value={DeletedMessageTypes.SHOW}>
              <div>
                <p className={styles.heading}>Show Deleted Messages</p>
                <p className={styles.description}>{"Changes <message deleted> back to users' original messages."}</p>
              </div>
            </Radio>
          </RadioGroup>
        </FormGroup>
      </div>
    </Panel>
  );
}

registerComponent(DeletedMessagesModule, {
  settingId: SettingIds.DELETED_MESSAGES,
  name: 'Deleted Messages',
  category: CategoryTypes.CHAT,
  keywords: ['messages', 'deleted'],
});
