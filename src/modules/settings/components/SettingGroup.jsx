import {Title} from '@mantine/core';
import {useMergedRef} from '@mantine/hooks';
import classNames from 'classnames';
import React from 'react';
import {useSettingFlash} from '@/modules/settings/stores/setting-flash';
import panelStyles from './Panel.module.css';
import SettingBadges from './SettingBadges';
import styles from './SettingGroup.module.css';

function scrollToGroup(group) {
  group?.scrollIntoView({block: 'start'});
}

// A section of the settings page: its heading over a pane of settings. A grid of cards is its own
// surface, so one can leave the pane out with withPane={false}.
function SettingGroup({children, name, showNewBadge = false, withPane = true, ref, ...restProps}) {
  const flashing = useSettingFlash(name);
  const sectionRef = useMergedRef(ref, flashing ? scrollToGroup : undefined);

  return (
    <section ref={sectionRef} className={styles.section} data-flash={flashing || undefined} {...restProps}>
      <Title order={2} className={styles.name}>
        {name}
        <SettingBadges showNewBadge={showNewBadge} />
      </Title>
      <div className={classNames({[panelStyles.panel]: withPane}, styles.settingGroup)}>{children}</div>
    </section>
  );
}

export default SettingGroup;
