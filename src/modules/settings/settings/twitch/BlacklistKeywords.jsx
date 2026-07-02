import {Button} from '@mantine/core';
import React, {use} from 'react';
import {PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Blacklist Keywords'});
const SETTING_DESCRIPTION = formatMessage({defaultMessage: 'Remove certain words, phrases or users from your chat.'});

function BlacklistKeywords({ref, ...props}) {
  const {setPage} = use(PageContext);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingWrapper name={SETTING_NAME} reverse description={SETTING_DESCRIPTION}>
        <Button size="lg" onClick={() => setPage(PageTypes.BLACKLIST_KEYWORDS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
    </SettingGroup>
  );
}

SettingStore.registerSetting(BlacklistKeywords, {
  settingPanelId: SettingPanelIds.BLACKLIST_KEYWORDS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

searchStore.registerSearchEntry({
  name: SETTING_NAME,
  description: SETTING_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.BLACKLIST_KEYWORDS),
});

export default BlacklistKeywords;
