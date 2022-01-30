import React from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import {registerComponent} from '../Store.jsx';
import {CategoryTypes, SettingIds, UsernameFlags} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import {hasFlag} from '../../../../utils/flags.js';
import useStorageState from '../../../../common/hooks/StorageState.jsx';

function UsernamesModule() {
  const [usernames, setUsernames] = useStorageState(SettingIds.USERNAMES);

  return (
    <Panel header="Usernames">
      <div className={styles.setting}>
        <p className={styles.description}>Edit or modify chat usernames</p>
        <CheckboxGroup
          value={Object.values(UsernameFlags).filter((value) => hasFlag(usernames, value))}
          onChange={(value) => setUsernames(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="localized" value={UsernameFlags.LOCALIZED}>
            <p className={styles.heading}>Localized Usernames</p>
            <p className={styles.description}>Show localized display names in the chat window</p>
          </Checkbox>
          <Checkbox key="usernameColors" value={UsernameFlags.COLORS}>
            <p className={styles.heading}>Username Colors</p>
            <p className={styles.description}>Show username colors in the chat window</p>
          </Checkbox>
          <Checkbox key="readableColors" value={UsernameFlags.READABLE}>
            <p className={styles.heading}>Readable Colors</p>
            <p className={styles.description}>
              Show username colors with higher contrast (prevents hard to read names)
            </p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

export default registerComponent(UsernamesModule, {
  settingId: SettingIds.USERNAMES,
  name: 'Chat Usernames',
  category: CategoryTypes.CHAT,
  keywords: ['color', 'username', 'accessibility', 'readability'],
});
