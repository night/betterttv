import {Badge, Text, Title, Tooltip} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import usePortalRef from '@/common/hooks/PortalRef';
import formatMessage from '@/i18n';
import styles from './SettingWrapper.module.css';

function SettingWrapper({
  name,
  description,
  children,
  showProBadge = false,
  showNewBadge = false,
  showComingSoonBadge = false,
  reverse = false,
  wrap = false,
  controlClassName = '',
}) {
  const portalRef = usePortalRef();
  return (
    <div className={classNames(styles.root, {[styles.shouldWrap]: wrap})}>
      {!reverse ? <div className={classNames(styles.control, controlClassName)}>{children}</div> : null}
      <div className={styles.text}>
        {name != null ? (
          <Title order={3} className={styles.title}>
            {name}
            {showProBadge ? (
              <Tooltip
                withArrow
                label={
                  <Text size="md">
                    {formatMessage({defaultMessage: 'This feature is only available to BetterTTV Pro users.'})}
                  </Text>
                }
                portalProps={{target: portalRef.current}}>
                <Badge color="indigo" variant="elevated" size="lg">
                  {formatMessage({defaultMessage: 'Pro'})}
                </Badge>
              </Tooltip>
            ) : null}
            {showNewBadge ? (
              <Tooltip
                withArrow
                label={
                  <Text size="md">{formatMessage({defaultMessage: 'This feature is new, and may be changed.'})}</Text>
                }
                portalProps={{target: portalRef.current}}>
                <Badge color="red" variant="elevated" size="lg">
                  {formatMessage({defaultMessage: 'New'})}
                </Badge>
              </Tooltip>
            ) : null}
            {showComingSoonBadge ? (
              <Tooltip
                withArrow
                label={<Text size="md">{formatMessage({defaultMessage: 'This feature is not available yet.'})}</Text>}
                portalProps={{target: portalRef.current}}>
                <Badge color="green" variant="elevated" size="lg">
                  {formatMessage({defaultMessage: 'Coming Soon'})}
                </Badge>
              </Tooltip>
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
