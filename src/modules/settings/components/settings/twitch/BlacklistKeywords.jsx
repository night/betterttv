import React from 'react';
import Panel from 'rsuite/Panel';
import TagInput from 'rsuite/TagInput';
import Table, {Types} from '../../Table.jsx';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import {KeywordTypes} from '../../../../../utils/keywords.js';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Blacklist Keywords'});

function AdditionalSettings({channels, onChannelsChange}) {
  channels = channels || [];

  return (
    <div>
      <div className={styles.settingTitle}>{formatMessage({defaultMessage: 'Advanced Settings'})}</div>
      <div className={styles.settingRow}>
        <div className={styles.settingDescription}>{formatMessage({defaultMessage: 'Enabled Channels'})}</div>
        <TagInput
          value={channels}
          className={styles.settingTagInput}
          onChange={(newChannels) => onChannelsChange(newChannels)}
          placeholder="username, etc.."
        />
      </div>
    </div>
  );
}

function BlacklistKeywords() {
  const [value, setValue] = useStorageState(SettingIds.BLACKLIST_KEYWORDS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Removes certain words, phrases or users from your chat.'})}
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
          renderEmpty={() => null}
          renderAdditionalSettings={(rowId, rowData) => (
            <AdditionalSettings
              channels={rowData.channels}
              onChannelsChange={(channels) => {
                value[rowData.id].channels = channels;
                setValue({...value});
              }}
            />
          )}
        />
      </div>
    </Panel>
  );
}

registerComponent(BlacklistKeywords, {
  settingId: SettingIds.BLACKLIST_KEYWORDS,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['black', 'list', 'keywords', 'banned', 'remove', 'hide'],
});
