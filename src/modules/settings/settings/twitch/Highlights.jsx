import {Button} from '@mantine/core';
import React, {use} from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {DeletedMessageTypes, PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingNumberInput from '@/modules/settings/components/SettingNumberInput';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';

const SETTING_NAME = formatMessage({defaultMessage: 'Highlights'});

function Highlights(props, ref) {
  const {setPage} = use(PageContext);
  const [value, setValue] = useStorageState(SettingIds.PINNED_HIGHLIGHTS);
  const [deletedMessages, setDeletedMessages] = useStorageState(SettingIds.DELETED_MESSAGES);
  const [maxPinnedHighlights, setMaxPinnedHighlights] = useStorageState(SettingIds.MAX_PINNED_HIGHLIGHTS);
  const [timeoutHighlightsValue, setTimeoutHighlightsValue] = useStorageState(SettingIds.TIMEOUT_HIGHLIGHTS);
  const [highlightFeedback, setHighlightFeedback] = useStorageState(SettingIds.HIGHLIGHT_FEEDBACK);
  const [highlightFirstTimeChatters, setHighlightFirstTimeChatters] = useStorageState(
    SettingIds.HIGHLIGHT_FIRST_TIME_CHATTERS
  );

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingWrapper
        name={formatMessage({defaultMessage: 'Highlight Keywords'})}
        reverse
        description={formatMessage({defaultMessage: 'Highlight certain words, phrases or users in your chat.'})}>
        <Button size="lg" onClick={() => setPage(PageTypes.HIGHLIGHT_KEYWORDS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Pinned Highlights'})}
        description={formatMessage({defaultMessage: 'Pin your highlighted messages above chat.'})}
        value={value}
        onChange={setValue}
      />
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Expire Pinned Highlights'})}
        description={formatMessage({defaultMessage: 'Hide pinned highlights after 1 minute.'})}
        value={timeoutHighlightsValue}
        onChange={setTimeoutHighlightsValue}
        disabled={!value}
      />
      <SettingNumberInput
        name={formatMessage({defaultMessage: 'Maximum Pinned highlights'})}
        description={formatMessage({defaultMessage: 'Number of pinned highlights that can be displayed.'})}
        value={maxPinnedHighlights}
        onChange={setMaxPinnedHighlights}
        min={1}
        max={25}
        disabled={!value}
      />
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Play A Sound'})}
        description={formatMessage({defaultMessage: 'Play a sound for messages directed at you.'})}
        value={highlightFeedback}
        onChange={setHighlightFeedback}
      />
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Highlight First-Time Chatters'})}
        description={formatMessage({
          defaultMessage: 'Highlight messages from viewers chatting in the channel for the first time.',
        })}
        value={highlightFirstTimeChatters}
        onChange={setHighlightFirstTimeChatters}
      />
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Highlight Deleted Messages'})}
        description={formatMessage({defaultMessage: 'Highlight and prevent deletion of messages.'})}
        value={deletedMessages === DeletedMessageTypes.HIGHLIGHT}
        onChange={(value) => setDeletedMessages(value ? DeletedMessageTypes.HIGHLIGHT : DeletedMessageTypes.DEFAULT)}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(Highlights), {
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['pinned', 'highlights', 'highlight', 'feedback', 'keywords', 'first', 'chatter', 'first-time'],
});

export default React.forwardRef(Highlights);
