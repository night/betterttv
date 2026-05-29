import React, {useContext} from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {ChatFlags, PageTypes, SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingCheckbox from '../../components/SettingCheckbox.jsx';
import SettingCheckboxGroup from '../../components/SettingCheckboxGroup.jsx';
import SettingWrapper from '../../components/SettingWrapper.jsx';
import {PageContext} from '../../contexts/PageContext.jsx';
import {Button} from '@mantine/core';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat'});

function ChatModule(props, ref) {
  const {setPage} = useContext(PageContext);
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

SettingStore.registerSetting(React.forwardRef(ChatModule), {
  settingPanelId: SettingPanelIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['bits', 'highlights', 'community', 'chat', 'replies', 'clips', 'subs', 'subscriptions', 'text', 'replacements'],
});

export default React.forwardRef(ChatModule);
