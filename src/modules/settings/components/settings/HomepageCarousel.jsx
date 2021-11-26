import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function HomepageCarousel() {
  const [value, setValue] = useStorageState(SettingIds.SHOW_HOMEPAGE_CAROUSEL);

  return (
    <Panel header="Show Homepage Carousel">
      <div className={styles.toggle}>
        <p className={styles.description}>Show the Homepage carousel</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(HomepageCarousel, {
  settingId: SettingIds.SHOW_HOMEPAGE_CAROUSEL,
  name: 'Show Homepage Carousel',
  category: CategoryTypes.DIRECTORY,
  keywords: ['homepage', 'carousel'],
});
