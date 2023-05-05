import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {Button, TagInput} from 'rsuite';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes, AnonChatFilterTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Anon Chat'});

function AnonChat() {
  const [value, setValue] = useStorageState(SettingIds.ANON_CHAT);
  const [filter, setFilter] = useStorageState(SettingIds.ANON_CHAT_FILTER_TYPE);
  const [channels, setChannels] = useStorageState(SettingIds.ANON_CHAT_CHANNELS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Join chat anonymously without appearing in the userlist'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
      {value ? (
        <>
          <div className={styles.settingRow}>
            <p className={styles.settingDescription}>
              {filter === AnonChatFilterTypes.WHITELIST
                ? formatMessage({defaultMessage: 'Whitelist channels that bypass Anon Chat'})
                : formatMessage({defaultMessage: 'Blacklist channels that enable Anon Chat'})}
            </p>
            <TagInput
              value={channels}
              className={styles.settingTagInput}
              onChange={(newValue) => setChannels(newValue)}
              placeholder={formatMessage({defaultMessage: 'username, etc..'})}
            />
          </div>
          <div className={styles.settingRowRightAlign}>
            {formatMessage(
              {defaultMessage: 'Use <button>{filterType}</button> instead.'},
              {
                filterType: filter === AnonChatFilterTypes.WHITELIST ? 'Blacklist' : 'Whitelist',
                // eslint-disable-next-line react/no-unstable-nested-components
                button: (text) => (
                  <Button
                    key={text}
                    className={styles.settingLinkButton}
                    type="button"
                    appearance="link"
                    onClick={() =>
                      setFilter(
                        filter === AnonChatFilterTypes.WHITELIST
                          ? AnonChatFilterTypes.BLACKLIST
                          : AnonChatFilterTypes.WHITELIST
                      )
                    }>
                    {text}
                  </Button>
                ),
              }
            )}
          </div>
        </>
      ) : null}
    </Panel>
  );
}

registerComponent(AnonChat, {
  settingId: SettingIds.ANON_CHAT,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['anon', 'chat'],
});
