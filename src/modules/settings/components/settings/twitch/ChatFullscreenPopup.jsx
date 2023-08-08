import React from 'react';
import Panel from 'rsuite/Panel';
import Radio from 'rsuite/Radio';
import RadioGroup from 'rsuite/RadioGroup';
import FormGroup from 'rsuite/FormGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, ChatFullscreenPopupTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Fullscreen Popup'});

function ChatFullscreenPopup() {
  const [value, setValue] = useStorageState(SettingIds.CHAT_FULLSCREEN_POPUP);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>{formatMessage({defaultMessage: 'Enable toggling chat in fullscreen mode by pressing \'c\''})}</p>
        <FormGroup controlId="radioList">
          <RadioGroup name="radioList" value={value} onChange={(state) => setValue(state)}>
            <Radio key="disabled" value={ChatFullscreenPopupTypes.DISABLED}>
              <div>
                <p className={styles.heading}>{formatMessage({defaultMessage: 'Disabled'})}</p>
                <p className={styles.settingDescription}>
                  {formatMessage({defaultMessage: 'Disables the plugin.'})}
                </p>
              </div>
            </Radio>
            <Radio key="enabled" value={ChatFullscreenPopupTypes.ENABLED}>
              <div>
                <p className={styles.heading}>{formatMessage({defaultMessage: 'Enabled'})}</p>
                <p className={styles.settingDescription}>
                  {formatMessage({defaultMessage: 'Enables the plugin.'})}
                </p>
              </div>
            </Radio>
          </RadioGroup>
        </FormGroup>
      </div>
    </Panel>
  );
}

registerComponent(ChatFullscreenPopup, {
  settingId: SettingIds.CHAT_FULLSCREEN_POPUP,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['chat', 'fullscreen', 'position', 'placement', 'popup'],
});
