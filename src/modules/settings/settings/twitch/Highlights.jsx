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
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Highlights'});

const HIGHLIGHT_KEYWORDS_NAME = formatMessage({defaultMessage: 'Highlight Keywords'});
const HIGHLIGHT_KEYWORDS_DESCRIPTION = formatMessage({
  defaultMessage: 'Highlight certain words, phrases or users in your chat.',
});
const PINNED_HIGHLIGHTS_NAME = formatMessage({defaultMessage: 'Pinned Highlights'});
const PINNED_HIGHLIGHTS_DESCRIPTION = formatMessage({defaultMessage: 'Pin your highlighted messages above chat.'});
const EXPIRE_PINNED_HIGHLIGHTS_NAME = formatMessage({defaultMessage: 'Expire Pinned Highlights'});
const EXPIRE_PINNED_HIGHLIGHTS_DESCRIPTION = formatMessage({defaultMessage: 'Hide pinned highlights after 1 minute.'});
const MAX_PINNED_HIGHLIGHTS_NAME = formatMessage({defaultMessage: 'Maximum Pinned highlights'});
const MAX_PINNED_HIGHLIGHTS_DESCRIPTION = formatMessage({
  defaultMessage: 'Number of pinned highlights that can be displayed.',
});
const HIGHLIGHT_FEEDBACK_NAME = formatMessage({defaultMessage: 'Play A Sound'});
const HIGHLIGHT_FEEDBACK_DESCRIPTION = formatMessage({defaultMessage: 'Play a sound for messages directed at you.'});
const FIRST_TIME_CHATTERS_NAME = formatMessage({defaultMessage: 'Highlight First-Time Chatters'});
const FIRST_TIME_CHATTERS_DESCRIPTION = formatMessage({
  defaultMessage: 'Highlight messages from viewers chatting in the channel for the first time.',
});
const HIGHLIGHT_DELETED_MESSAGES_NAME = formatMessage({defaultMessage: 'Highlight Deleted Messages'});
const HIGHLIGHT_DELETED_MESSAGES_DESCRIPTION = formatMessage({
  defaultMessage: 'Highlight and prevent deletion of messages.',
});

function Highlights({ref, ...props}) {
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
      <SettingWrapper name={HIGHLIGHT_KEYWORDS_NAME} reverse description={HIGHLIGHT_KEYWORDS_DESCRIPTION}>
        <Button size="lg" onClick={() => setPage(PageTypes.HIGHLIGHT_KEYWORDS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
      <SettingSwitch
        reverse
        name={PINNED_HIGHLIGHTS_NAME}
        description={PINNED_HIGHLIGHTS_DESCRIPTION}
        value={value}
        onChange={setValue}
      />
      <SettingSwitch
        reverse
        name={EXPIRE_PINNED_HIGHLIGHTS_NAME}
        description={EXPIRE_PINNED_HIGHLIGHTS_DESCRIPTION}
        value={timeoutHighlightsValue}
        onChange={setTimeoutHighlightsValue}
        disabled={!value}
      />
      <SettingNumberInput
        name={MAX_PINNED_HIGHLIGHTS_NAME}
        description={MAX_PINNED_HIGHLIGHTS_DESCRIPTION}
        value={maxPinnedHighlights}
        onChange={setMaxPinnedHighlights}
        min={1}
        max={25}
        disabled={!value}
      />
      <SettingSwitch
        reverse
        name={HIGHLIGHT_FEEDBACK_NAME}
        description={HIGHLIGHT_FEEDBACK_DESCRIPTION}
        value={highlightFeedback}
        onChange={setHighlightFeedback}
      />
      <SettingSwitch
        reverse
        name={FIRST_TIME_CHATTERS_NAME}
        description={FIRST_TIME_CHATTERS_DESCRIPTION}
        value={highlightFirstTimeChatters}
        onChange={setHighlightFirstTimeChatters}
      />
      <SettingSwitch
        reverse
        name={HIGHLIGHT_DELETED_MESSAGES_NAME}
        description={HIGHLIGHT_DELETED_MESSAGES_DESCRIPTION}
        value={deletedMessages === DeletedMessageTypes.HIGHLIGHT}
        onChange={(value) => setDeletedMessages(value ? DeletedMessageTypes.HIGHLIGHT : DeletedMessageTypes.DEFAULT)}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Highlights, {
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

for (const entry of [
  {name: HIGHLIGHT_KEYWORDS_NAME, description: HIGHLIGHT_KEYWORDS_DESCRIPTION},
  {name: PINNED_HIGHLIGHTS_NAME, description: PINNED_HIGHLIGHTS_DESCRIPTION},
  {name: EXPIRE_PINNED_HIGHLIGHTS_NAME, description: EXPIRE_PINNED_HIGHLIGHTS_DESCRIPTION},
  {name: MAX_PINNED_HIGHLIGHTS_NAME, description: MAX_PINNED_HIGHLIGHTS_DESCRIPTION},
  {name: HIGHLIGHT_FEEDBACK_NAME, description: HIGHLIGHT_FEEDBACK_DESCRIPTION},
  {name: FIRST_TIME_CHATTERS_NAME, description: FIRST_TIME_CHATTERS_DESCRIPTION},
  {name: HIGHLIGHT_DELETED_MESSAGES_NAME, description: HIGHLIGHT_DELETED_MESSAGES_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.HIGHLIGHTS)});
}

export default Highlights;
