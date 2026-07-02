import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, SidebarFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';
import {isStandaloneWindow} from '@/utils/window';

const SETTING_NAME = formatMessage({defaultMessage: 'Sidebar'});

const RECENTLY_WATCHED_CHANNELS_NAME = formatMessage({defaultMessage: 'Recently Watched Channels'});
const RECENTLY_WATCHED_CHANNELS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show recently watched channels in the sidebar.',
});
const RECOMMENDED_CHANNELS_NAME = formatMessage({defaultMessage: 'Recommended Channels'});
const RECOMMENDED_CHANNELS_DESCRIPTION = formatMessage({defaultMessage: 'Show recommended channels in the sidebar.'});
const RECOMMENDED_CATEGORIES_NAME = formatMessage({defaultMessage: 'Recommended Categories'});
const RECOMMENDED_CATEGORIES_DESCRIPTION = formatMessage({
  defaultMessage: 'Show recommended categories in the sidebar.',
});
const SIMILAR_CHANNELS_NAME = formatMessage({defaultMessage: 'Similar Channels'});
const SIMILAR_CHANNELS_DESCRIPTION = formatMessage({defaultMessage: 'Show similar channels in the sidebar.'});
const OFFLINE_FOLLOWED_CHANNELS_NAME = formatMessage({defaultMessage: 'Offline Followed Channels'});
const OFFLINE_FOLLOWED_CHANNELS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show offline followed channels in the sidebar.',
});
const AUTO_EXPAND_CHANNELS_NAME = formatMessage({defaultMessage: 'Auto-Expand Channels'});
const AUTO_EXPAND_CHANNELS_DESCRIPTION = formatMessage({
  defaultMessage: 'Clicks the Load More followed channels button in the sidebar for you.',
});
const STORIES_NAME = formatMessage({defaultMessage: 'Stories'});
const STORIES_DESCRIPTION = formatMessage({defaultMessage: 'Show stories in the sidebar.'});

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
        name={RECENTLY_WATCHED_CHANNELS_NAME}
        description={RECENTLY_WATCHED_CHANNELS_DESCRIPTION}
      />
      <SettingCheckbox
        value={SidebarFlags.RECOMMENDED_CHANNELS}
        name={RECOMMENDED_CHANNELS_NAME}
        description={RECOMMENDED_CHANNELS_DESCRIPTION}
      />
      <SettingCheckbox
        value={SidebarFlags.RECOMMENDED_CATEGORIES}
        name={RECOMMENDED_CATEGORIES_NAME}
        description={RECOMMENDED_CATEGORIES_DESCRIPTION}
      />
      <SettingCheckbox
        value={SidebarFlags.SIMILAR_CHANNELS}
        name={SIMILAR_CHANNELS_NAME}
        description={SIMILAR_CHANNELS_DESCRIPTION}
      />
      <SettingCheckbox
        value={SidebarFlags.OFFLINE_FOLLOWED_CHANNELS}
        name={OFFLINE_FOLLOWED_CHANNELS_NAME}
        description={OFFLINE_FOLLOWED_CHANNELS_DESCRIPTION}
      />
      <SettingCheckbox
        value={SidebarFlags.AUTO_EXPAND_CHANNELS}
        name={AUTO_EXPAND_CHANNELS_NAME}
        description={AUTO_EXPAND_CHANNELS_DESCRIPTION}
      />
      <SettingCheckbox value={SidebarFlags.STORIES} name={STORIES_NAME} description={STORIES_DESCRIPTION} />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(SidebarComponent, {
  settingPanelId: SettingPanelIds.SIDEBAR,
  name: SETTING_NAME,
});

for (const entry of [
  {name: RECENTLY_WATCHED_CHANNELS_NAME, description: RECENTLY_WATCHED_CHANNELS_DESCRIPTION},
  {name: RECOMMENDED_CHANNELS_NAME, description: RECOMMENDED_CHANNELS_DESCRIPTION},
  {name: RECOMMENDED_CATEGORIES_NAME, description: RECOMMENDED_CATEGORIES_DESCRIPTION},
  {name: SIMILAR_CHANNELS_NAME, description: SIMILAR_CHANNELS_DESCRIPTION},
  {name: OFFLINE_FOLLOWED_CHANNELS_NAME, description: OFFLINE_FOLLOWED_CHANNELS_DESCRIPTION},
  {name: AUTO_EXPAND_CHANNELS_NAME, description: AUTO_EXPAND_CHANNELS_DESCRIPTION},
  {name: STORIES_NAME, description: STORIES_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({
    ...entry,
    goto: () => gotoSettingPanel(SettingPanelIds.SIDEBAR),
    predicate: () => !isStandaloneWindow(),
  });
}

export default SidebarComponent;
