import React from 'react';
import Panel from 'rsuite/Panel';
import Table, {Types} from '../../Table.jsx';
import {KeywordTypes} from '../../../../../utils/keywords.js';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Highlight Keywords'});

function HighlightKeywords() {
  const [value, setValue] = useStorageState(SettingIds.HIGHLIGHT_KEYWORDS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Highlight certain words, phrases or users in your chat.'})}
        </p>
        <Table
          autoHeight
          options={[
            {
              name: 'type',
              header: formatMessage({defaultMessage: 'Type'}),
              type: Types.DROPDOWN,
              options: [
                {
                  name: formatMessage({defaultMessage: 'Message'}),
                  value: KeywordTypes.MESSAGE,
                },
                {
                  name: formatMessage({defaultMessage: 'Username'}),
                  value: KeywordTypes.USER,
                },
                {
                  name: formatMessage({defaultMessage: 'Badge'}),
                  value: KeywordTypes.BADGE,
                },
              ],
              defaultOption: 0,
            },
            {
              name: 'keyword',
              header: formatMessage({defaultMessage: 'Keyword'}),
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

registerComponent(HighlightKeywords, {
  settingId: SettingIds.HIGHLIGHT_KEYWORDS,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['keywords', 'highlight'],
});
