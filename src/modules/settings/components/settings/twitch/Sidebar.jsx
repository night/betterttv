import React from 'react';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import Panel from 'rsuite/Panel';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds, SidebarFlags} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import {hasFlag} from '../../../../../utils/flags.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Sidebar'});

function SidebarComponent() {
  const [sidebar, setSidebar] = useStorageState(SettingIds.SIDEBAR);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.setting}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Edit or modify the left sidebar'})}
        </p>
        <CheckboxGroup
          value={Object.values(SidebarFlags).filter((value) => hasFlag(sidebar, value))}
          onChange={(value) => setSidebar(value.reduce((a, b) => a | b, 0))}>
          <Checkbox key="recentlyWatchedChannels" value={SidebarFlags.RECENTLY_WATCHED_CHANNELS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Recently Watched Channels'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show recently watched channels in the sidebar'})}
            </p>
          </Checkbox>
          <Checkbox key="recommendedChannels" value={SidebarFlags.RECOMMENDED_CHANNELS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Recommended Channels'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show recommended channels in the sidebar'})}
            </p>
          </Checkbox>
          <Checkbox key="recommendedCategories" value={SidebarFlags.RECOMMENDED_CATEGORIES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Recommended Categories'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show recommended categories in the sidebar'})}
            </p>
          </Checkbox>
          <Checkbox key="similarChannels" value={SidebarFlags.SIMILAR_CHANNELS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Similar Channels'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show similar channels in the sidebar'})}
            </p>
          </Checkbox>
          <Checkbox key="offlineFollowedChannels" value={SidebarFlags.OFFLINE_FOLLOWED_CHANNELS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Offline Followed Channels'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show offline followed channels in the sidebar'})}
            </p>
          </Checkbox>
          <Checkbox key="autoExpandChannels" value={SidebarFlags.AUTO_EXPAND_CHANNELS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Auto-Expand Channels'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Clicks the Load More followed channels button in the sidebar for you'})}
            </p>
          </Checkbox>
          <Checkbox key="stories" value={SidebarFlags.STORIES}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Stories'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show stories in the sidebar'})}
            </p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

registerComponent(SidebarComponent, {
  settingId: SettingIds.SIDEBAR,
  name: SETTING_NAME,
  category: CategoryTypes.DIRECTORY,
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
