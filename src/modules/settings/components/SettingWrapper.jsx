import {Text, Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import SettingBadges from './SettingBadges';
import styles from './SettingWrapper.module.css';

function SettingWrapper({
  name,
  description,
  icon,
  rightSection,
  children,
  showProBadge = false,
  showNewBadge = false,
  reverse = false,
  wrap = false,
  controlClassName = '',
}) {
  return (
    <div className={classNames(styles.root, {[styles.shouldWrap]: wrap})}>
      {!reverse ? <div className={classNames(styles.control, controlClassName)}>{children}</div> : null}
      {icon}
      <div className={styles.text}>
        {name != null ? (
          <Title order={3} className={styles.title}>
            {name}
            <SettingBadges showProBadge={showProBadge} showNewBadge={showNewBadge} />
          </Title>
        ) : null}
        {description != null ? (
          <Text c="dimmed" size="lg" className={styles.description}>
            {description}
          </Text>
        ) : null}
      </div>
      {rightSection}
      {reverse ? <div className={classNames(styles.control, controlClassName)}>{children}</div> : null}
    </div>
  );
}

export default SettingWrapper;
