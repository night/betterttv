import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Moderation View'});
const AUTO_ENTER_NAME = formatMessage({defaultMessage: 'Auto-Enter'});
const AUTO_ENTER_DESCRIPTION = formatMessage({
  defaultMessage: 'Automatically enter moderation view on channels you moderate.',
});

function ModerationView({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_MOD_VIEW);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={AUTO_ENTER_NAME} description={AUTO_ENTER_DESCRIPTION} value={value} onChange={setValue} />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: AUTO_ENTER_NAME,
  description: AUTO_ENTER_DESCRIPTION,
  settingPanelId: SettingPanelIds.MODERATION,
});

SettingStore.registerSetting(ModerationView, {
  settingPanelId: SettingPanelIds.MODERATION,
  settingCategoryId: SettingCategoryIds.MODERATION,
  name: SETTING_NAME,
});

export default ModerationView;
