import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds, SidebarFlags} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingCheckbox from '../../components/SettingCheckbox.jsx';
import SettingCheckboxGroup from '../../components/SettingCheckboxGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Sidebar'});

function SidebarComponent(props, ref) {
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
        name={formatMessage({defaultMessage: 'Recently Watched Channels'})}
        description={formatMessage({defaultMessage: 'Show recently watched channels in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.RECOMMENDED_CHANNELS}
        name={formatMessage({defaultMessage: 'Recommended Channels'})}
        description={formatMessage({defaultMessage: 'Show recommended channels in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.RECOMMENDED_CATEGORIES}
        name={formatMessage({defaultMessage: 'Recommended Categories'})}
        description={formatMessage({defaultMessage: 'Show recommended categories in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.SIMILAR_CHANNELS}
        name={formatMessage({defaultMessage: 'Similar Channels'})}
        description={formatMessage({defaultMessage: 'Show similar channels in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.OFFLINE_FOLLOWED_CHANNELS}
        name={formatMessage({defaultMessage: 'Offline Followed Channels'})}
        description={formatMessage({defaultMessage: 'Show offline followed channels in the sidebar.'})}
      />
      <SettingCheckbox
        value={SidebarFlags.AUTO_EXPAND_CHANNELS}
        name={formatMessage({defaultMessage: 'Auto-Expand Channels'})}
        description={formatMessage({
          defaultMessage: 'Clicks the Load More followed channels button in the sidebar for you.',
        })}
      />
      <SettingCheckbox
        value={SidebarFlags.STORIES}
        name={formatMessage({defaultMessage: 'Stories'})}
        description={formatMessage({defaultMessage: 'Show stories in the sidebar.'})}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(SidebarComponent), {
  settingPanelId: SettingPanelIds.SIDEBAR,
  name: SETTING_NAME,
  keywords: [
    'sidebar',
    'recently',
    'watched',
    'recommended',
    'similar',
    'offline',
    'categories',
    'channels',
    'expand',
    'stories',
  ],
});

export default React.forwardRef(SidebarComponent);
