import React from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import {registerComponent} from '../Store.jsx';
import {CategoryTypes, SettingIds, ChatFlags} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import {hasFlag} from '../../../../utils/flags.js';
import useStorageState from '../../../../common/hooks/StorageState.jsx';

function ChatModule() {
  const [chat, setChat] = useStorageState(SettingIds.CHAT);

  return (
    <Panel header="Chat">
      <div className={styles.setting}>
        <p className={styles.description}>Edit or modify chat features</p>
        <CheckboxGroup
          value={Object.values(ChatFlags).filter((value) => hasFlag(chat, value))}
          onChange={(value) => setChat(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="chatMessageHistory" value={ChatFlags.CHAT_MESSAGE_HISTORY}>
            <p className={styles.heading}>Chat Message History</p>
            <p className={styles.description}>Restore what you previously typed by pressing up/down arrow in chat</p>
          </Checkbox>
          <Checkbox key="chatReplies" value={ChatFlags.CHAT_REPLIES}>
            <p className={styles.heading}>Chat Replies</p>
            <p className={styles.description}>Show the click to reply button in chat</p>
          </Checkbox>
          <Checkbox key="bits" value={ChatFlags.BITS}>
            <p className={styles.heading}>Bits</p>
            <p className={styles.description}>Show bits in the chat window</p>
          </Checkbox>
          <Checkbox key="chatClips" value={ChatFlags.CHAT_CLIPS}>
            <p className={styles.heading}>Chat Clips</p>
            <p className={styles.description}>Show clip embeds in the chat window</p>
          </Checkbox>
          <Checkbox key="viewerGreetings" value={ChatFlags.VIEWER_GREETING}>
            <p className={styles.heading}>Viewer Greetings</p>
            <p className={styles.description}>Show new viewer greetings in the chat window</p>
          </Checkbox>
          <Checkbox key="subscriptionNotices" value={ChatFlags.SUB_NOTICE}>
            <p className={styles.heading}>Subscription Notices</p>
            <p className={styles.description}>Show subs, re-subs, and gift subs notices in the chat window</p>
          </Checkbox>
          <Checkbox key="communityHighlights" value={ChatFlags.COMMUNITY_HIGHLIGHTS}>
            <p className={styles.heading}>Community Highlights</p>
            <p className={styles.description}>Show alerts above chat window for hype trains, community chest, etc.</p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

export default registerComponent(ChatModule, {
  settingId: SettingIds.CHAT,
  name: 'Chat',
  category: CategoryTypes.CHAT,
  keywords: ['bits', 'highlights', 'community', 'chat', 'replies', 'clips', 'subs', 'subscriptions'],
});
