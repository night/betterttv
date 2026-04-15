import React, {useContext} from 'react';
import {PageTypes, SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import {PageContext} from '../../contexts/PageContext.jsx';
import SettingWrapper from '../../components/SettingWrapper.jsx';
import {Button} from '@mantine/core';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Blacklist Keywords'});

function BlacklistKeywords(props, ref) {
  const {setPage} = useContext(PageContext);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingWrapper
        name={formatMessage({defaultMessage: 'Blacklist Keywords'})}
        reverse
        description={formatMessage({defaultMessage: 'Remove certain words, phrases or users from your chat.'})}>
        <Button size="lg" onClick={() => setPage(PageTypes.BLACKLIST_KEYWORDS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(BlacklistKeywords), {
  settingPanelId: SettingPanelIds.BLACKLIST_KEYWORDS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['black', 'list', 'keywords', 'banned', 'remove', 'hide'],
});

export default React.forwardRef(BlacklistKeywords);
