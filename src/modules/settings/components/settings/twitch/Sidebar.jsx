import React from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, SidebarFlags} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import {hasFlag} from '../../../../../utils/flags.js';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function SidebarComponent() {
  const [sidebar, setSidebar] = useStorageState(SettingIds.SIDEBAR);

  return (
    <Panel header="Sidebar">
      <div className={styles.setting}>
        <p className={styles.description}>Edit or modify the left sidebar</p>
        <CheckboxGroup
          value={Object.values(SidebarFlags).filter((value) => hasFlag(sidebar, value))}
          onChange={(value) => setSidebar(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="featuredChannels" value={SidebarFlags.FEATURED_CHANNELS}>
            <p className={styles.heading}>Featured Channels</p>
            <p className={styles.description}>Show recommended channels in the sidebar</p>
          </Checkbox>
          <Checkbox key="hideOfflineFollowedChannels" value={SidebarFlags.OFFLINE_FOLLOWED_CHANNELS}>
            <p className={styles.heading}> Offline Followed Channels</p>
            <p className={styles.description}>Show offline followed channels in the sidebar</p>
          </Checkbox>
          <Checkbox key="autoExpandChannels" value={SidebarFlags.AUTO_EXPAND_CHANNELS}>
            <p className={styles.heading}>Auto-Expand Channels</p>
            <p className={styles.description}>Clicks the Load More followed channels button in the sidebar for you</p>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

registerComponent(SidebarComponent, {
  settingId: SettingIds.SIDEBAR,
  name: 'Sidebar',
  category: CategoryTypes.DIRECTORY,
  keywords: ['sidebar', 'channels', 'expand'],
});
