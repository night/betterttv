import {Button} from '@mantine/core';
import React, {use} from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {ChatFlags, PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Features'});
const TEXT_REPLACEMENTS_NAME = formatMessage({defaultMessage: 'Text Replacements'});
const TEXT_REPLACEMENTS_DESCRIPTION = formatMessage({
  defaultMessage: 'Create custom text replacements so typing a trigger in chat sends a different string.',
});
const CHAT_REPLIES_NAME = formatMessage({defaultMessage: 'Chat Replies'});
const CHAT_REPLIES_DESCRIPTION = formatMessage({defaultMessage: 'Show the reply button in chat.'});
const BITS_NAME = formatMessage({defaultMessage: 'Bits'});
const BITS_DESCRIPTION = formatMessage({defaultMessage: 'Show bits in the chat window.'});
const VIEWER_GREETINGS_NAME = formatMessage({defaultMessage: 'Viewer Greetings'});
const VIEWER_GREETINGS_DESCRIPTION = formatMessage({defaultMessage: 'Show new viewer greetings in the chat window.'});
const SUBSCRIPTION_NOTICES_NAME = formatMessage({defaultMessage: 'Subscription Notices'});
const SUBSCRIPTION_NOTICES_DESCRIPTION = formatMessage({
  defaultMessage: 'Show subs, re-subs, and gift subs notices in the chat window.',
});
const CLIP_EMBEDS_NAME = formatMessage({defaultMessage: 'Clip Embeds'});
const CLIP_EMBEDS_DESCRIPTION = formatMessage({defaultMessage: 'Show clip previews in the chat window.'});
const COMMUNITY_HIGHLIGHTS_NAME = formatMessage({defaultMessage: 'Community Highlights'});
const COMMUNITY_HIGHLIGHTS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show alerts above chat window for hype trains, polls, predictions, drops, pinned messages, etc.',
});
const WATCH_STREAKS_NAME = formatMessage({defaultMessage: 'Watch Streaks in Chat'});
const WATCH_STREAKS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show watch streak milestone messages in the chat window.',
});
const MESSAGE_HISTORY_NAME = formatMessage({defaultMessage: 'Message History'});
const MESSAGE_HISTORY_DESCRIPTION = formatMessage({
  defaultMessage: 'Restore what you previously typed by pressing up/down arrow in chat.',
});
const GIFS_NAME = formatMessage({defaultMessage: 'GIFs'});
const GIFS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show GIFs sent by Tier 2 and Tier 3 subscribers in the chat window.',
});
const AI_STREAM_SUMMARIES_NAME = formatMessage({defaultMessage: 'AI Stream Summaries'});
const AI_STREAM_SUMMARIES_DESCRIPTION = formatMessage({
  defaultMessage: "Show Twitch's AI-generated mid-stream summary recaps in the chat window.",
});

function ChatFeatures({ref, ...props}) {
  const {setPage} = use(PageContext);
  const [chat, setChat] = useStorageState(SettingIds.CHAT);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={chat}
      onChange={setChat}
      flags={Object.values(ChatFlags)}>
      <SettingWrapper name={TEXT_REPLACEMENTS_NAME} reverse description={TEXT_REPLACEMENTS_DESCRIPTION}>
        <Button size="lg" onClick={() => setPage(PageTypes.TEXT_REPLACEMENTS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
      <SettingCheckbox value={ChatFlags.CHAT_REPLIES} name={CHAT_REPLIES_NAME} description={CHAT_REPLIES_DESCRIPTION} />
      <SettingCheckbox value={ChatFlags.BITS} name={BITS_NAME} description={BITS_DESCRIPTION} />
      <SettingCheckbox
        value={ChatFlags.VIEWER_GREETING}
        name={VIEWER_GREETINGS_NAME}
        description={VIEWER_GREETINGS_DESCRIPTION}
      />
      <SettingCheckbox
        value={ChatFlags.SUB_NOTICE}
        name={SUBSCRIPTION_NOTICES_NAME}
        description={SUBSCRIPTION_NOTICES_DESCRIPTION}
      />
      <SettingCheckbox value={ChatFlags.CHAT_CLIPS} name={CLIP_EMBEDS_NAME} description={CLIP_EMBEDS_DESCRIPTION} />
      <SettingCheckbox
        value={ChatFlags.COMMUNITY_HIGHLIGHTS}
        name={COMMUNITY_HIGHLIGHTS_NAME}
        description={COMMUNITY_HIGHLIGHTS_DESCRIPTION}
      />
      <SettingCheckbox
        value={ChatFlags.WATCH_STREAKS}
        name={WATCH_STREAKS_NAME}
        description={WATCH_STREAKS_DESCRIPTION}
      />
      <SettingCheckbox
        value={ChatFlags.CHAT_MESSAGE_HISTORY}
        name={MESSAGE_HISTORY_NAME}
        description={MESSAGE_HISTORY_DESCRIPTION}
      />
      <SettingCheckbox value={ChatFlags.CHAT_GIFS} name={GIFS_NAME} description={GIFS_DESCRIPTION} />
      <SettingCheckbox
        value={ChatFlags.AI_STREAM_SUMMARY}
        name={AI_STREAM_SUMMARIES_NAME}
        description={AI_STREAM_SUMMARIES_DESCRIPTION}
      />
    </SettingCheckboxGroup>
  );
}

registerSearchEntry({
  query: TEXT_REPLACEMENTS_NAME,
  description: TEXT_REPLACEMENTS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
  onAccept: ({setPage}) => setPage(PageTypes.TEXT_REPLACEMENTS),
});

registerSearchEntry({
  query: CHAT_REPLIES_NAME,
  description: CHAT_REPLIES_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

registerSearchEntry({
  query: BITS_NAME,
  description: BITS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

registerSearchEntry({
  query: VIEWER_GREETINGS_NAME,
  description: VIEWER_GREETINGS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

registerSearchEntry({
  query: SUBSCRIPTION_NOTICES_NAME,
  description: SUBSCRIPTION_NOTICES_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

registerSearchEntry({
  query: CLIP_EMBEDS_NAME,
  description: CLIP_EMBEDS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

registerSearchEntry({
  query: COMMUNITY_HIGHLIGHTS_NAME,
  description: COMMUNITY_HIGHLIGHTS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

registerSearchEntry({
  query: WATCH_STREAKS_NAME,
  description: WATCH_STREAKS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

registerSearchEntry({
  query: MESSAGE_HISTORY_NAME,
  description: MESSAGE_HISTORY_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

registerSearchEntry({
  query: GIFS_NAME,
  description: GIFS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

registerSearchEntry({
  query: AI_STREAM_SUMMARIES_NAME,
  description: AI_STREAM_SUMMARIES_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT,
});

SettingStore.registerSetting(ChatFeatures, {
  settingPanelId: SettingPanelIds.CHAT,
  settingCategoryId: SettingCategoryIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default ChatFeatures;
