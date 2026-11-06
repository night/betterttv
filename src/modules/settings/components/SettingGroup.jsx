import {Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import panelStyles from './Panel.module.css';
import SettingBadges from './SettingBadges';
import styles from './SettingGroup.module.css';

// A section of the settings page: its heading over a pane of settings. A grid of cards is its own
// surface, so one can leave the pane out with withPane={false}.
function SettingGroup({
  children,
  name,
  rightContent,
  showProBadge = false,
  showNewBadge = false,
  withPane = true,
  className,
  ref,
  ...restProps
}) {
  return (
    <section ref={ref} className={styles.section} {...restProps}>
      <div className={styles.header}>
        {typeof name === 'string' ? (
          <Title order={2} className={styles.name}>
            {name}
            <SettingBadges showProBadge={showProBadge} showNewBadge={showNewBadge} />
          </Title>
        ) : (
          name
        )}
        {rightContent}
      </div>
      <div className={classNames({[panelStyles.panel]: withPane}, styles.settingGroup, className)}>{children}</div>
    </section>
  );
}

export default SettingGroup;
