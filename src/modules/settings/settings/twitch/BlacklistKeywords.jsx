import {Button} from '@mantine/core';
import React, {use} from 'react';
import {PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingWrapper from '@/modules/settings/components/SettingWrapper';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';

const SETTING_NAME = formatMessage({defaultMessage: 'Blacklist Keywords'});

function BlacklistKeywords({ref, ...props}) {
  const {setPage} = use(PageContext);

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

SettingStore.registerSetting(BlacklistKeywords, {
  settingPanelId: SettingPanelIds.BLACKLIST_KEYWORDS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['black', 'list', 'keywords', 'banned', 'remove', 'hide'],
});

export default BlacklistKeywords;
