import React, {useContext} from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {DeletedMessageTypes, PageTypes, SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';
import SettingNumberInput from '../../components/SettingNumberInput.jsx';
import {Button} from '@mantine/core';
import SettingWrapper from '../../components/SettingWrapper.jsx';
import {PageContext} from '../../contexts/PageContext.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Highlights'});

function Highlights(props, ref) {
  const {setPage} = useContext(PageContext);
  const [value, setValue] = useStorageState(SettingIds.PINNED_HIGHLIGHTS);
  const [deletedMessages, setDeletedMessages] = useStorageState(SettingIds.DELETED_MESSAGES);
  const [maxPinnedHighlights, setMaxPinnedHighlights] = useStorageState(SettingIds.MAX_PINNED_HIGHLIGHTS);
  const [timeoutHighlightsValue, setTimeoutHighlightsValue] = useStorageState(SettingIds.TIMEOUT_HIGHLIGHTS);
  const [highlightFeedback, setHighlightFeedback] = useStorageState(SettingIds.HIGHLIGHT_FEEDBACK);

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
  keywords: ['pinned', 'highlights', 'highlight', 'feedback', 'keywords'],
});

export default React.forwardRef(Highlights);
