import React from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, ChatFlags} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import {hasFlag} from '../../../../../utils/flags.js';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat'});

function ChatModule() {
  const [chat, setChat] = useStorageState(SettingIds.CHAT);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>{formatMessage({defaultMessage: 'Edit or modify chat features'})}</p>
        <CheckboxGroup
          value={Object.values(ChatFlags).filter((value) => hasFlag(chat, value))}
          onChange={(value) => setChat(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="chatMessageHistory" value={ChatFlags.CHAT_MESSAGE_HISTORY}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Chat Message History'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Restore what you previously typed by pressing up/down arrow in chat'})}
            </p>
          </Checkbox>
          <Checkbox key="chatReplies" value={ChatFlags.CHAT_REPLIES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Chat Replies'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show the reply button in chat'})}
            </p>
          </Checkbox>
          <Checkbox key="bits" value={ChatFlags.BITS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Bits'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show bits in the chat window'})}
            </p>
          </Checkbox>
          <Checkbox key="chatClips" value={ChatFlags.CHAT_CLIPS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Chat Clips'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show clip embeds in the chat window'})}
            </p>
          </Checkbox>
          <Checkbox key="viewerGreetings" value={ChatFlags.VIEWER_GREETING}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Viewer Greetings'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show new viewer greetings in the chat window'})}
            </p>
          </Checkbox>
          <Checkbox key="subscriptionNotices" value={ChatFlags.SUB_NOTICE}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Subscription Notices'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show subs, re-subs, and gift subs notices in the chat window'})}
            </p>
          </Checkbox>
          <Checkbox key="communityHighlights" value={ChatFlags.COMMUNITY_HIGHLIGHTS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Community Highlights'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({
                defaultMessage: 'Show alerts above chat window for hype trains, drops, pinned messages, etc.',
              })}
            </p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

registerComponent(ChatModule, {
  settingId: SettingIds.CHAT,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['bits', 'highlights', 'community', 'chat', 'replies', 'clips', 'subs', 'subscriptions'],
});
