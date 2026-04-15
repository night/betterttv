import React from 'react';
import {Badge, Text, Title} from '@mantine/core';
import styles from './SettingWrapper.module.css';
import classNames from 'classnames';

function SettingWrapper({
  name,
  description,
  children,
  showProBadge = false,
  showBetaBadge = false,
  reverse = false,
  wrap = false,
  controlClassName = '',
}) {
  return (
    <div className={classNames(styles.root, {[styles.shouldWrap]: wrap})}>
      {!reverse ? <div className={classNames(styles.control, controlClassName)}>{children}</div> : null}
      <div className={styles.text}>
        {name != null ? (
          <Title order={3} className={styles.title}>
            {name}
            {showProBadge ? (
              <Badge color="indigo" variant="elevated" size="lg">
                Pro
              </Badge>
            ) : null}
            {showBetaBadge ? (
              <Badge color="orange" variant="elevated" size="lg">
                Beta
              </Badge>
            ) : null}
          </Title>
        ) : null}
        {description != null ? (
          <Text c="dimmed" size="lg" className={styles.description}>
            {description}
          </Text>
        ) : null}
      </div>
      {reverse ? <div className={classNames(styles.control, controlClassName)}>{children}</div> : null}
    </div>
  );
}

export default SettingWrapper;
