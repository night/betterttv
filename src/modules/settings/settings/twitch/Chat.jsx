import {Button} from '@mantine/core';
import React, {use} from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {ChatFlags, PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat'});

function ChatModule({ref, ...props}) {
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
      <SettingWrapper
        name={formatMessage({defaultMessage: 'Text Replacements'})}
        reverse
        description={formatMessage({
          defaultMessage: 'Create custom text replacements so typing a trigger in chat sends a different string.',
        })}>
        <Button size="lg" onClick={() => setPage(PageTypes.TEXT_REPLACEMENTS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
      <SettingCheckbox
        value={ChatFlags.CHAT_REPLIES}
        name={formatMessage({defaultMessage: 'Chat Replies'})}
        description={formatMessage({defaultMessage: 'Show the reply button in chat.'})}
      />
      <SettingCheckbox
        value={ChatFlags.BITS}
        name={formatMessage({defaultMessage: 'Bits'})}
        description={formatMessage({defaultMessage: 'Show bits in the chat window.'})}
      />
      <SettingCheckbox
        value={ChatFlags.VIEWER_GREETING}
        name={formatMessage({defaultMessage: 'Viewer Greetings'})}
        description={formatMessage({defaultMessage: 'Show new viewer greetings in the chat window.'})}
      />
      <SettingCheckbox
        value={ChatFlags.SUB_NOTICE}
        name={formatMessage({defaultMessage: 'Subscription Notices'})}
        description={formatMessage({
          defaultMessage: 'Show subs, re-subs, and gift subs notices in the chat window.',
        })}
      />
      <SettingCheckbox
        value={ChatFlags.CHAT_CLIPS}
        name={formatMessage({defaultMessage: 'Clip Embeds'})}
        description={formatMessage({defaultMessage: 'Show clip previews in the chat window.'})}
      />
      <SettingCheckbox
        value={ChatFlags.COMMUNITY_HIGHLIGHTS}
        name={formatMessage({defaultMessage: 'Community Highlights'})}
        description={formatMessage({
          defaultMessage: 'Show alerts above chat window for hype trains, drops, pinned messages, etc.',
        })}
      />
      <SettingCheckbox
        value={ChatFlags.CHAT_MESSAGE_HISTORY}
        name={formatMessage({defaultMessage: 'Message History'})}
        description={formatMessage({
          defaultMessage: 'Restore what you previously typed by pressing up/down arrow in chat.',
        })}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(ChatModule, {
  settingPanelId: SettingPanelIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: [
    'bits',
    'highlights',
    'community',
    'chat',
    'replies',
    'clips',
    'subs',
    'subscriptions',
    'text',
    'replacements',
  ],
});

export default ChatModule;
