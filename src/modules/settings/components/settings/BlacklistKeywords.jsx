import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Table, {Types} from '../Table.jsx';
import {registerComponent, useStorageState} from '../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import {KeywordTypes} from '../../../../utils/keywords.js';

function BlacklistKeywords() {
  const [value, setValue] = useStorageState(SettingIds.BLACKLIST_KEYWORDS);

  return (
    <Panel header="Blacklist Keywords">
      <div className={styles.setting}>
        <p className={styles.description}>Removes certain words, phrases or users from your chat.</p>
        <Table
          autoHeight
          options={[
            {
              name: 'type',
              header: 'Type',
              type: Types.DROPDOWN,
              options: [
                {
                  name: 'Message',
                  value: KeywordTypes.MESSAGE,
                },
                {
                  name: 'Username',
                  value: KeywordTypes.USER,
                },
              ],
              defaultOption: 0,
            },
            {
              name: 'keyword',
              header: 'Keyword',
              type: Types.STRING,
            },
          ]}
          setValue={setValue}
          value={value}
          renderEmpty={() => null}
        />
      </div>
    </Panel>
  );
}

export default registerComponent(BlacklistKeywords, {
  settingId: SettingIds.BLACKLIST_KEYWORDS,
  name: 'Blacklist Keywords',
  category: CategoryTypes.CHAT,
  keywords: ['black', 'list', 'keywords', 'banned', 'remove', 'hide'],
});
