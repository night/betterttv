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
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Highlights'});
const HIGHLIGHT_KEYWORDS_NAME = formatMessage({defaultMessage: 'Highlight Keywords'});
const HIGHLIGHT_KEYWORDS_DESCRIPTION = formatMessage({
  defaultMessage: 'Highlight certain words, phrases or users in your chat.',
});
const PINNED_HIGHLIGHTS_NAME = formatMessage({defaultMessage: 'Pinned Highlights'});
const PINNED_HIGHLIGHTS_DESCRIPTION = formatMessage({defaultMessage: 'Pin your highlighted messages above chat.'});
const EXPIRE_PINNED_HIGHLIGHTS_NAME = formatMessage({defaultMessage: 'Expire Pinned Highlights'});
const EXPIRE_PINNED_HIGHLIGHTS_DESCRIPTION = formatMessage({defaultMessage: 'Hide pinned highlights after 1 minute.'});
const MAXIMUM_PINNED_HIGHLIGHTS_NAME = formatMessage({defaultMessage: 'Maximum Pinned highlights'});
const MAXIMUM_PINNED_HIGHLIGHTS_DESCRIPTION = formatMessage({
  defaultMessage: 'Number of pinned highlights that can be displayed.',
});
const PLAY_A_SOUND_NAME = formatMessage({defaultMessage: 'Play A Sound'});
const PLAY_A_SOUND_DESCRIPTION = formatMessage({defaultMessage: 'Play a sound for messages directed at you.'});
const HIGHLIGHT_FIRST_TIME_CHATTERS_NAME = formatMessage({defaultMessage: 'Highlight First-Time Chatters'});
const HIGHLIGHT_FIRST_TIME_CHATTERS_DESCRIPTION = formatMessage({
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
        name={MAXIMUM_PINNED_HIGHLIGHTS_NAME}
        description={MAXIMUM_PINNED_HIGHLIGHTS_DESCRIPTION}
        value={maxPinnedHighlights}
        onChange={setMaxPinnedHighlights}
        min={1}
        max={25}
        disabled={!value}
      />
      <SettingSwitch
        reverse
        name={PLAY_A_SOUND_NAME}
        description={PLAY_A_SOUND_DESCRIPTION}
        value={highlightFeedback}
        onChange={setHighlightFeedback}
      />
      <SettingSwitch
        reverse
        name={HIGHLIGHT_FIRST_TIME_CHATTERS_NAME}
        description={HIGHLIGHT_FIRST_TIME_CHATTERS_DESCRIPTION}
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

registerSearchEntry({
  query: HIGHLIGHT_KEYWORDS_NAME,
  description: HIGHLIGHT_KEYWORDS_DESCRIPTION,
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
  onAccept: ({setPage}) => setPage(PageTypes.HIGHLIGHT_KEYWORDS),
});

registerSearchEntry({
  query: PINNED_HIGHLIGHTS_NAME,
  description: PINNED_HIGHLIGHTS_DESCRIPTION,
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
});

registerSearchEntry({
  query: EXPIRE_PINNED_HIGHLIGHTS_NAME,
  description: EXPIRE_PINNED_HIGHLIGHTS_DESCRIPTION,
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
});

registerSearchEntry({
  query: MAXIMUM_PINNED_HIGHLIGHTS_NAME,
  description: MAXIMUM_PINNED_HIGHLIGHTS_DESCRIPTION,
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
});

registerSearchEntry({
  query: PLAY_A_SOUND_NAME,
  description: PLAY_A_SOUND_DESCRIPTION,
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
});

registerSearchEntry({
  query: HIGHLIGHT_FIRST_TIME_CHATTERS_NAME,
  description: HIGHLIGHT_FIRST_TIME_CHATTERS_DESCRIPTION,
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
});

registerSearchEntry({
  query: HIGHLIGHT_DELETED_MESSAGES_NAME,
  description: HIGHLIGHT_DELETED_MESSAGES_DESCRIPTION,
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
});

SettingStore.registerSetting(Highlights, {
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
  settingCategoryId: SettingCategoryIds.MODERATION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Highlights;
