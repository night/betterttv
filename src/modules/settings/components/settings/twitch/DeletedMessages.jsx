import React from 'react';
import Panel from 'rsuite/Panel';
import Radio from 'rsuite/Radio';
import RadioGroup from 'rsuite/RadioGroup';
import FormGroup from 'rsuite/FormGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, DeletedMessageTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Deleted Messages'});

function DeletedMessagesModule() {
  const [value, setValue] = useStorageState(SettingIds.DELETED_MESSAGES);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'How should deleted messages be handled.'})}
        </p>
        <FormGroup controlId="radioList">
          <RadioGroup name="radioList" value={value} onChange={(state) => setValue(state)}>
            <Radio key="default" value={DeletedMessageTypes.DEFAULT}>
              <div>
                <p className={styles.heading}>{formatMessage({defaultMessage: 'Default'})}</p>
                <p className={styles.settingDescription}>
                  {formatMessage({defaultMessage: 'Do what Twitch normally does.'})}
                </p>
              </div>
            </Radio>
            <Radio key="hideDeletedMessages" value={DeletedMessageTypes.HIDE}>
              <div>
                <p className={styles.heading}>{formatMessage({defaultMessage: 'Hide Deleted Messages'})}</p>
                <p className={styles.settingDescription}>
                  {formatMessage({defaultMessage: 'Completely removes timed out messages from view.'})}
                </p>
              </div>
            </Radio>
            <Radio key="showDeletedMessages" value={DeletedMessageTypes.SHOW}>
              <div>
                <p className={styles.heading}>{formatMessage({defaultMessage: 'Show Deleted Messages'})}</p>
                <p className={styles.settingDescription}>
                  {formatMessage({defaultMessage: "Changes '<'message deleted'>' back to users' original messages."})}
                </p>
              </div>
            </Radio>
            <Radio key="highlightDeletedMessages" value={DeletedMessageTypes.HIGHLIGHT}>
              <div>
                <p className={styles.heading}>{formatMessage({defaultMessage: 'Highlight Deleted Messages'})}</p>
                <p className={styles.description}>
                  {formatMessage({
                    defaultMessage:
                      "Changes '<'message deleted'>' back to users' original messages and highlights them.",
                  })}
                </p>
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
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['messages', 'deleted'],
});
