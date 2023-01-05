import React from 'react';
import Panel from 'rsuite/Panel';
import Checkbox from 'rsuite/Checkbox';
import CheckboxGroup from 'rsuite/CheckboxGroup';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds, SidebarFlags} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import {hasFlag} from '../../../../../utils/flags.js';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

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
          onChange={(value) => setSidebar(value.length > 0 ? value.reduce((a, b) => a | b) : 0)}>
          <Checkbox key="featuredChannels" value={SidebarFlags.FEATURED_CHANNELS}>
            <p className={styles.heading}>{formatMessage({defaultMessage: 'Featured Channels'})}</p>
            <p className={styles.settingDescription}>
              {formatMessage({defaultMessage: 'Show recommended channels in the sidebar'})}
            </p>
          </Checkbox>
          <Checkbox key="hideOfflineFollowedChannels" value={SidebarFlags.OFFLINE_FOLLOWED_CHANNELS}>
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
        </CheckboxGroup>
      </div>
    </Panel>
  );
}

registerComponent(SidebarComponent, {
  settingId: SettingIds.SIDEBAR,
  name: SETTING_NAME,
  category: CategoryTypes.DIRECTORY,
  keywords: ['sidebar', 'featured', 'offline', 'channels', 'expand'],
});
