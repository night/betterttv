import React from 'react';
import Panel from 'rsuite/Panel';
import TagInput from 'rsuite/TagInput';
import Table, {Types} from '../../Table.jsx';
import {KeywordTypes} from '../../../../../utils/keywords.js';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import ColorPicker from '../../../../../common/components/ColorPicker.jsx';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Highlight Keywords'});

function AdditionalSettings({color, onColorChange, channels, onChannelsChange}) {
  color = color || '#ff0000';
  channels = channels || [];

  return (
    <div>
      <div className={styles.settingTitle}>{formatMessage({defaultMessage: 'Advanced Settings'})}</div>
      <div className={styles.settingRow}>
        <div className={styles.settingDescription}>{formatMessage({defaultMessage: 'Highlight Color'})}</div>
        <ColorPicker color={color} onChange={(newColor) => onColorChange(newColor)} />
      </div>
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

function HighlightKeywords() {
  const [value, setValue] = useStorageState(SettingIds.HIGHLIGHT_KEYWORDS);

  return (
    <Panel header={SETTING_NAME} className={styles.panelWithOverflow}>
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
          renderAdditionalSettings={(rowId, rowData) => (
            <AdditionalSettings
              color={rowData.color}
              channels={rowData.channels}
              onColorChange={(color) => {
                value[rowData.id].color = color;
                setValue({...value});
              }}
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

registerComponent(HighlightKeywords, {
  settingId: SettingIds.HIGHLIGHT_KEYWORDS,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['keywords', 'highlight'],
});
