import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Table, {Types} from '../Table.jsx';
import {KeywordTypes} from '../../../../utils/keywords.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function HighlightKeywords() {
  const [value, setValue] = useStorageState(SettingIds.HIGHLIGHT_KEYWORDS);

  return (
    <Panel header="Highlight Keywords">
      <div className={styles.setting}>
        <p className={styles.description}>Highlight certain words, phrases or users in your chat.</p>
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
          style={{borderRadius: 5}}
          renderEmpty={() => null}
        />
      </div>
    </Panel>
  );
}

export default registerComponent(HighlightKeywords, {
  settingId: SettingIds.HIGHLIGHT_KEYWORDS,
  name: 'Highlight Keywords',
  category: CategoryTypes.CHAT,
  keywords: ['keywords', 'highlight'],
});
