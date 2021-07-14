import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Checkbox from 'rsuite/lib/Checkbox/index.js';
import CheckboxGroup from 'rsuite/lib/CheckboxGroup/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds, ChatFlags} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import {hasFlag} from '../../../../utils/flags.js';

function ChatModule() {
  const [chat, setChat] = useStorageState(SettingIds.CHAT);

  return (
    <Panel header="Chat">
      <div className={styles.setting}>
        <p className={styles.description}>Edit or modify chat features</p>
        <CheckboxGroup
          value={Object.values(ChatFlags).filter((value) => hasFlag(chat, value))}
          onChange={(value) => setChat(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="chatReplies" value={ChatFlags.CHAT_REPLIES}>
            <p>Chat Replies</p>
            <p className={styles.description}>Hides the click to reply button in chat</p>
          </Checkbox>
          <Checkbox key="bits" value={ChatFlags.BITS}>
            <p>Bits</p>
            <p className={styles.description}>Disables bits in chat</p>
          </Checkbox>
          <Checkbox key="chatClips" value={ChatFlags.CHAT_CLIPS}>
            <p>Chat Clips</p>
            <p className={styles.description}>Hides clips embeds in chat</p>
          </Checkbox>
          <Checkbox key="viewerGreetings" value={ChatFlags.VIEWER_GREETING}>
            <p>Viewer Greetings</p>
            <p className={styles.description}>Hides the new viewer greeting message from the chat</p>
          </Checkbox>
          <Checkbox key="subscriptionNotices" value={ChatFlags.SUB_NOTICE}>
            <p>Subscription Notices</p>
            <p className={styles.description}>Hides subs, re-subs, and gift subs from the chat</p>
          </Checkbox>
          <Checkbox key="communityHighlights" value={ChatFlags.COMMUNITY_HIGHLIGHTS}>
            <p>Community Highlights</p>
            <p className={styles.description}>Hides the alerts above chat for hype trains, community chest, etc.</p>
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
