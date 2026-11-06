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
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Highlights'});

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
      <SettingWrapper
        name={formatMessage({defaultMessage: 'Highlight keywords'})}
        reverse
        description={formatMessage({defaultMessage: 'Make certain words, phrases or users stand out in your chat.'})}>
        <Button size="lg" onClick={() => setPage(PageTypes.HIGHLIGHT_KEYWORDS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Pin highlights'})}
        description={formatMessage({defaultMessage: 'Keeps your highlighted messages above chat.'})}
        value={value}
        onChange={setValue}
      />
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Expire pinned highlights'})}
        description={formatMessage({defaultMessage: 'Removes them after 1 minute.'})}
        value={timeoutHighlightsValue}
        onChange={setTimeoutHighlightsValue}
        disabled={!value}
      />
      <SettingNumberInput
        name={formatMessage({defaultMessage: 'Limit pinned highlights'})}
        description={formatMessage({defaultMessage: 'How many can show at once.'})}
        value={maxPinnedHighlights}
        onChange={setMaxPinnedHighlights}
        min={1}
        max={25}
        disabled={!value}
      />
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Play a sound'})}
        description={formatMessage({defaultMessage: 'For messages directed at you.'})}
        value={highlightFeedback}
        onChange={setHighlightFeedback}
      />
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Highlight first-time chatters'})}
        description={formatMessage({
          defaultMessage: 'Marks the first message a viewer sends in the channel.',
        })}
        value={highlightFirstTimeChatters}
        onChange={setHighlightFirstTimeChatters}
      />
      <SettingSwitch
        reverse
        name={formatMessage({defaultMessage: 'Highlight deleted messages'})}
        description={formatMessage({defaultMessage: 'Keeps them in chat and makes them stand out.'})}
        value={deletedMessages === DeletedMessageTypes.HIGHLIGHT}
        onChange={(value) => setDeletedMessages(value ? DeletedMessageTypes.HIGHLIGHT : DeletedMessageTypes.DEFAULT)}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Highlights, {
  settingPanelId: SettingPanelIds.HIGHLIGHTS,
  settingCategoryId: SettingCategoryIds.MODERATION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Highlights;
