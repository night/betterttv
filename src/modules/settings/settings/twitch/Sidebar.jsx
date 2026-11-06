import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, SidebarFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Sidebar'});

function SidebarComponent({ref, ...props}) {
  const [sidebar, setSidebar] = useStorageState(SettingIds.SIDEBAR);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={sidebar}
      onChange={setSidebar}
      flags={Object.values(SidebarFlags)}>
      <SettingCheckbox
        value={SidebarFlags.RECENTLY_WATCHED_CHANNELS}
        name={formatMessage({defaultMessage: 'Show recently watched channels'})}
        description={formatMessage({defaultMessage: 'Keeps this list in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.RECOMMENDED_CHANNELS}
        name={formatMessage({defaultMessage: 'Show recommended channels'})}
        description={formatMessage({defaultMessage: 'Keeps this list in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.RECOMMENDED_CATEGORIES}
        name={formatMessage({defaultMessage: 'Show recommended categories'})}
        description={formatMessage({defaultMessage: 'Keeps this list in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.SIMILAR_CHANNELS}
        name={formatMessage({defaultMessage: 'Show similar channels'})}
        description={formatMessage({defaultMessage: 'Keeps this list in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.OFFLINE_FOLLOWED_CHANNELS}
        name={formatMessage({defaultMessage: 'Show offline followed channels'})}
        description={formatMessage({defaultMessage: 'Keeps this list in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.AUTO_EXPAND_CHANNELS}
        name={formatMessage({defaultMessage: 'Expand channels automatically'})}
        description={formatMessage({
          defaultMessage: 'Clicks the Load More followed channels button in the sidebar for you.',
        })}
      />
      <SettingCheckbox
        value={SidebarFlags.STORIES}
        name={formatMessage({defaultMessage: 'Show stories'})}
        description={formatMessage({defaultMessage: 'Keeps them in the sidebar.'})}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(SidebarComponent, {
  settingPanelId: SettingPanelIds.SIDEBAR,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
});

export default SidebarComponent;
