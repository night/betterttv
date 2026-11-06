import {Button} from '@mantine/core';
import React, {use} from 'react';
import {PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Blacklist Keywords'});
const BLACKLIST_KEYWORDS_DESCRIPTION = formatMessage({
  defaultMessage: 'Remove certain words, phrases or users from your chat.',
});

function BlacklistKeywords({ref, ...props}) {
  const {setPage} = use(PageContext);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingWrapper name={SETTING_NAME} reverse description={BLACKLIST_KEYWORDS_DESCRIPTION}>
        <Button size="lg" onClick={() => setPage(PageTypes.BLACKLIST_KEYWORDS)}>
          {formatMessage({defaultMessage: 'Edit'})}
        </Button>
      </SettingWrapper>
    </SettingGroup>
  );
}

registerSearchEntry({
  query: SETTING_NAME,
  description: BLACKLIST_KEYWORDS_DESCRIPTION,
  settingPanelId: SettingPanelIds.BLACKLIST_KEYWORDS,
  onAccept: ({setPage}) => setPage(PageTypes.BLACKLIST_KEYWORDS),
});

SettingStore.registerSetting(BlacklistKeywords, {
  settingPanelId: SettingPanelIds.BLACKLIST_KEYWORDS,
  settingCategoryId: SettingCategoryIds.MODERATION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default BlacklistKeywords;
