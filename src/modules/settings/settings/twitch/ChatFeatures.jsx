import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, ChatFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Features'});

function ChatFeatures({ref, ...props}) {
  const [chat, setChat] = useStorageState(SettingIds.CHAT);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={chat}
      onChange={setChat}
      flags={Object.values(ChatFlags)}>
      <SettingCheckbox
        value={ChatFlags.CHAT_REPLIES}
        name={formatMessage({defaultMessage: 'Show chat replies'})}
        description={formatMessage({defaultMessage: 'Adds the reply button to messages.'})}
      />
      <SettingCheckbox
        value={ChatFlags.BITS}
        name={formatMessage({defaultMessage: 'Show bits'})}
        description={formatMessage({defaultMessage: 'Cheer messages and cheermotes in the chat window.'})}
      />
      <SettingCheckbox
        value={ChatFlags.VIEWER_GREETING}
        name={formatMessage({defaultMessage: 'Show viewer greetings'})}
        description={formatMessage({defaultMessage: 'Welcome messages for new chatters in the chat window.'})}
      />
      <SettingCheckbox
        value={ChatFlags.SUB_NOTICE}
        name={formatMessage({defaultMessage: 'Show subscription notices'})}
        description={formatMessage({
          defaultMessage: 'Subs, re-subs, and gift subs in the chat window.',
        })}
      />
      <SettingCheckbox
        value={ChatFlags.CHAT_CLIPS}
        name={formatMessage({defaultMessage: 'Show clip embeds'})}
        description={formatMessage({defaultMessage: 'Previews of clips in the chat window.'})}
      />
      <SettingCheckbox
        value={ChatFlags.COMMUNITY_HIGHLIGHTS}
        name={formatMessage({defaultMessage: 'Show community highlights'})}
        description={formatMessage({
          defaultMessage: 'Alerts above chat for hype trains, polls, predictions, drops, pinned messages, etc.',
        })}
      />
      <SettingCheckbox
        value={ChatFlags.WATCH_STREAKS}
        name={formatMessage({defaultMessage: 'Show watch streaks'})}
        description={formatMessage({
          defaultMessage: 'Appear in chat and on followed channels in the sidebar.',
        })}
      />
      <SettingCheckbox
        value={ChatFlags.CHAT_MESSAGE_HISTORY}
        name={formatMessage({defaultMessage: 'Keep message history'})}
        description={formatMessage({
          defaultMessage: 'Restore what you previously typed by pressing up/down arrow in chat.',
        })}
      />
      <SettingCheckbox
        value={ChatFlags.CHAT_GIFS}
        name={formatMessage({defaultMessage: 'Show GIFs'})}
        description={formatMessage({
          defaultMessage: 'Sent by Tier 2 and Tier 3 subscribers in the chat window.',
        })}
      />
      <SettingCheckbox
        value={ChatFlags.AI_STREAM_SUMMARY}
        name={formatMessage({defaultMessage: 'Show AI stream summaries'})}
        description={formatMessage({
          defaultMessage: "Twitch's AI-generated mid-stream recaps in the chat window.",
        })}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(ChatFeatures, {
  settingPanelId: SettingPanelIds.CHAT,
  settingCategoryId: SettingCategoryIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default ChatFeatures;
