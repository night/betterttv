import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {RadioCard, Tooltip} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import Icon from '../../../common/components/Icon';
import usePortalRef from '../../../common/hooks/PortalRef';
import clickableStyles from './ClickableContainer.module.css';
import styles from './SettingRadioCard.module.css';

function SettingRadioCard({
  value,
  tooltip,
  ariaLabel,
  className,
  radioCardProps = {},
  withIndicators = true,
  children,
}) {
  const portalRef = usePortalRef();

  const card = (
    <RadioCard
      value={value}
      radius="lg"
      className={classNames(clickableStyles.clickableContainer, styles.card, className)}
      aria-label={ariaLabel}
      {...radioCardProps}>
      {children}
      {withIndicators ? (
        <Icon icon={faCheckCircle} className={classNames(styles.iconIndicator, styles.checkIcon)} />
      ) : null}
    </RadioCard>
  );

  if (tooltip == null) {
    return card;
  }

  return (
    <Tooltip
      openDelay={200}
      withArrow
      arrowSize={8}
      radius="md"
      className={styles.tooltip}
      label={tooltip}
      portalProps={{target: portalRef.current}}>
      {card}
    </Tooltip>
  );
}

export default SettingRadioCard;
