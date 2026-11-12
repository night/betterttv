import {Text, Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import {useSettingFlash} from '@/modules/settings/stores/setting-flash';
import SettingBadges from './SettingBadges';
import styles from './SettingWrapper.module.css';

function scrollToRow(row) {
  row?.scrollIntoView({block: 'center'});
}

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
  const flashing = useSettingFlash(name);

  return (
    <div
      ref={flashing ? scrollToRow : undefined}
      className={classNames(styles.root, {[styles.shouldWrap]: wrap})}
      data-flash={flashing || undefined}>
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
