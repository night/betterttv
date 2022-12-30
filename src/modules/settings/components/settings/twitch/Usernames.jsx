import React from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, UsernameFlags} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import {hasFlag} from '../../../../../utils/flags.js';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Usernames'});

function UsernamesModule() {
  const [usernames, setUsernames] = useStorageState(SettingIds.USERNAMES);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>{formatMessage({defaultMessage: 'Edit or modify chat usernames'})}</p>
        <CheckboxGroup
          value={Object.values(UsernameFlags).filter((value) => hasFlag(usernames, value))}
          onChange={(value) => setUsernames(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="localized" value={UsernameFlags.LOCALIZED}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Localized Usernames'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show localized display names in the chat window'})}
            </p>
          </Checkbox>
          <Checkbox key="usernameColors" value={UsernameFlags.COLORS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Username Colors'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show username colors in the chat window'})}
            </p>
          </Checkbox>
          <Checkbox key="readableColors" value={UsernameFlags.READABLE}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Readable Colors'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({
                defaultMessage: 'Show username colors with higher contrast (prevents hard to read names)',
              })}
            </p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

registerComponent(UsernamesModule, {
  settingId: SettingIds.USERNAMES,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['color', 'username', 'accessibility', 'readability'],
});
