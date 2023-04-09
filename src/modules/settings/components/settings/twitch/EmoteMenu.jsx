import React from 'react';
import Panel from 'rsuite/Panel';
import Radio from 'rsuite/Radio';
import RadioGroup from 'rsuite/RadioGroup';
import FormGroup from 'rsuite/FormGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, EmoteMenuTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Menu'});

function EmoteMenu() {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_MENU);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Enables a more advanced emote menu for chat'})}
        </p>
        <FormGroup controlId="radioList">
          <RadioGroup name="radioList" value={value} onChange={(state) => setValue(state)}>
            <Radio key="default" value={EmoteMenuTypes.ENABLED}>
              <div>
                <p className={styles.heading}>{formatMessage({defaultMessage: 'Enabled'})}</p>
                <p className={styles.settingDescription}>
                  {formatMessage({defaultMessage: 'Replace the default emote picker button'})}
                </p>
              </div>
            </Radio>
            <Radio key="replace-native" value={EmoteMenuTypes.LEGACY}>
              <div>
                <p className={styles.heading}>{formatMessage({defaultMessage: 'Legacy'})}</p>
                <p className={styles.settingDescription}>
                  {formatMessage({defaultMessage: 'Emote picker button appears below chat input box'})}
                </p>
              </div>
            </Radio>
            <Radio key="none" value={EmoteMenuTypes.NONE}>
              <div>
                <p className={styles.heading}>{formatMessage({defaultMessage: 'None'})}</p>
                <p className={styles.settingDescription}>
                  {formatMessage({defaultMessage: 'Hide the emote picker button entirely'})}
                </p>
              </div>
            </Radio>
          </RadioGroup>
        </FormGroup>
      </div>
    </Panel>
  );
}

registerComponent(EmoteMenu, {
  settingId: SettingIds.EMOTE_MENU,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['twitch', 'emotes', 'popup'],
});
