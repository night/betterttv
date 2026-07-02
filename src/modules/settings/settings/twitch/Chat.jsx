import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, ChatFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat'});

const CHAT_REPLIES_NAME = formatMessage({defaultMessage: 'Chat Replies'});
const CHAT_REPLIES_DESCRIPTION = formatMessage({defaultMessage: 'Show the reply button in chat.'});
const BITS_NAME = formatMessage({defaultMessage: 'Bits'});
const BITS_DESCRIPTION = formatMessage({defaultMessage: 'Show bits in the chat window.'});
const VIEWER_GREETING_NAME = formatMessage({defaultMessage: 'Viewer Greetings'});
const VIEWER_GREETING_DESCRIPTION = formatMessage({defaultMessage: 'Show new viewer greetings in the chat window.'});
const SUB_NOTICE_NAME = formatMessage({defaultMessage: 'Subscription Notices'});
const SUB_NOTICE_DESCRIPTION = formatMessage({
  defaultMessage: 'Show subs, re-subs, and gift subs notices in the chat window.',
});
const CHAT_CLIPS_NAME = formatMessage({defaultMessage: 'Clip Embeds'});
const CHAT_CLIPS_DESCRIPTION = formatMessage({defaultMessage: 'Show clip previews in the chat window.'});
const COMMUNITY_HIGHLIGHTS_NAME = formatMessage({defaultMessage: 'Community Highlights'});
const COMMUNITY_HIGHLIGHTS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show alerts above chat window for hype trains, drops, pinned messages, etc.',
});
const CHAT_MESSAGE_HISTORY_NAME = formatMessage({defaultMessage: 'Message History'});
const CHAT_MESSAGE_HISTORY_DESCRIPTION = formatMessage({
  defaultMessage: 'Restore what you previously typed by pressing up/down arrow in chat.',
});

function ChatModule({ref, ...props}) {
  const [chat, setChat] = useStorageState(SettingIds.CHAT);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={chat}
      onChange={setChat}
      flags={Object.values(ChatFlags)}>
      <SettingCheckbox value={ChatFlags.CHAT_REPLIES} name={CHAT_REPLIES_NAME} description={CHAT_REPLIES_DESCRIPTION} />
      <SettingCheckbox value={ChatFlags.BITS} name={BITS_NAME} description={BITS_DESCRIPTION} />
      <SettingCheckbox
        value={ChatFlags.VIEWER_GREETING}
        name={VIEWER_GREETING_NAME}
        description={VIEWER_GREETING_DESCRIPTION}
      />
      <SettingCheckbox value={ChatFlags.SUB_NOTICE} name={SUB_NOTICE_NAME} description={SUB_NOTICE_DESCRIPTION} />
      <SettingCheckbox value={ChatFlags.CHAT_CLIPS} name={CHAT_CLIPS_NAME} description={CHAT_CLIPS_DESCRIPTION} />
      <SettingCheckbox
        value={ChatFlags.COMMUNITY_HIGHLIGHTS}
        name={COMMUNITY_HIGHLIGHTS_NAME}
        description={COMMUNITY_HIGHLIGHTS_DESCRIPTION}
      />
      <SettingCheckbox
        value={ChatFlags.CHAT_MESSAGE_HISTORY}
        name={CHAT_MESSAGE_HISTORY_NAME}
        description={CHAT_MESSAGE_HISTORY_DESCRIPTION}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(ChatModule, {
  settingPanelId: SettingPanelIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

for (const entry of [
  {name: CHAT_REPLIES_NAME, description: CHAT_REPLIES_DESCRIPTION},
  {name: BITS_NAME, description: BITS_DESCRIPTION},
  {name: VIEWER_GREETING_NAME, description: VIEWER_GREETING_DESCRIPTION},
  {name: SUB_NOTICE_NAME, description: SUB_NOTICE_DESCRIPTION},
  {name: CHAT_CLIPS_NAME, description: CHAT_CLIPS_DESCRIPTION},
  {name: COMMUNITY_HIGHLIGHTS_NAME, description: COMMUNITY_HIGHLIGHTS_DESCRIPTION},
  {name: CHAT_MESSAGE_HISTORY_NAME, description: CHAT_MESSAGE_HISTORY_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.CHAT)});
}

export default ChatModule;
