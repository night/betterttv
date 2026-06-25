import React, {useContext} from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {DeletedMessageTypes, DEFAULT_HIGHLIGHT_COLOR, PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingNumberInput from '@/modules/settings/components/SettingNumberInput';
import SettingColorPicker from '@/modules/settings/components/SettingColorPicker';
import {Button} from '@mantine/core';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import {PageContext} from '@/modules/settings/contexts/PageContext';

const SETTING_NAME = formatMessage({defaultMessage: 'Highlights'});

function Highlights(props, ref) {
  const {setPage} = useContext(PageContext);
  const [value, setValue] = useStorageState(SettingIds.PINNED_HIGHLIGHTS);
  const [deletedMessages, setDeletedMessages] = useStorageState(SettingIds.DELETED_MESSAGES);
  const [maxPinnedHighlights, setMaxPinnedHighlights] = useStorageState(SettingIds.MAX_PINNED_HIGHLIGHTS);
  const [timeoutHighlightsValue, setTimeoutHighlightsValue] = useStorageState(SettingIds.TIMEOUT_HIGHLIGHTS);
  const [highlightFeedback, setHighlightFeedback] = useStorageState(SettingIds.HIGHLIGHT_FEEDBACK);
  const [highlightFirstTimeChatters, setHighlightFirstTimeChatters] = useStorageState(
    SettingIds.HIGHLIGHT_FIRST_TIME_CHATTERS
  );
  const [firstMessageColor, setFirstMessageColor] = useStorageState(SettingIds.FIRST_MESSAGE_HIGHLIGHT_COLOR);
  const [deletedMessagesColor, setDeletedMessagesColor] = useStorageState(SettingIds.DELETED_MESSAGES_HIGHLIGHT_COLOR);

  function makeColorChangeHandler(setColor) {
    return (newColor) => {
      if (newColor == null || newColor === '' || newColor === DEFAULT_HIGHLIGHT_COLOR) {
        setColor(null);
        return;
      }
      setColor(newColor);
    };
  }

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
      {highlightFirstTimeChatters ? (
        <SettingColorPicker
          reverse
          name={formatMessage({defaultMessage: 'First-Time Chatter Highlight Color'})}
          description={formatMessage({defaultMessage: 'The color used to highlight first-time chatter messages.'})}
          value={firstMessageColor}
          defaultValue={DEFAULT_HIGHLIGHT_COLOR}
          onChange={makeColorChangeHandler(setFirstMessageColor)}
        />
      ) : null}
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Highlight Deleted Messages'})}
        description={formatMessage({defaultMessage: 'Highlight and prevent deletion of messages.'})}
        value={deletedMessages === DeletedMessageTypes.HIGHLIGHT}
        onChange={(value) => setDeletedMessages(value ? DeletedMessageTypes.HIGHLIGHT : DeletedMessageTypes.DEFAULT)}
      />
      {deletedMessages === DeletedMessageTypes.HIGHLIGHT ? (
        <SettingColorPicker
          reverse
          name={formatMessage({defaultMessage: 'Deleted Message Highlight Color'})}
          description={formatMessage({defaultMessage: 'The color used to highlight deleted messages.'})}
          value={deletedMessagesColor}
          defaultValue={DEFAULT_HIGHLIGHT_COLOR}
          onChange={makeColorChangeHandler(setDeletedMessagesColor)}
        />
      ) : null}
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(Highlights), {
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: [
    'pinned',
    'highlights',
    'highlight',
    'feedback',
    'keywords',
    'first',
    'chatter',
    'first-time',
    'deleted',
    'color',
  ],
});

export default React.forwardRef(Highlights);
