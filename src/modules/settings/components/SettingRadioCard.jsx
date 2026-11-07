import {RadioCard, Tooltip} from '@mantine/core';
import classNames from 'classnames';
import {CircleCheck} from 'lucide-react';
import React, {useCallback} from 'react';
import usePortalRef from '@/common/hooks/PortalRef';
import clickableStyles from './ClickableContainer.module.css';
import styles from './SettingRadioCard.module.css';

function SettingRadioCard({
  value,
  tooltip,
  ariaLabel,
  className,
  locked = false,
  radioCardProps = {},
  withIndicators = true,
  onHover,
  children,
}) {
  const portalRef = usePortalRef();
  const handleMouseEnter = useCallback(() => onHover?.(value), [onHover, value]);
  const handleMouseLeave = useCallback(() => onHover?.(undefined), [onHover]);

  const card = (
    <RadioCard
      value={value}
      radius="lg"
      className={classNames(clickableStyles.clickableContainer, styles.card, className)}
      aria-label={ariaLabel}
      aria-disabled={locked || undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...radioCardProps}>
      {children}
      {withIndicators ? <CircleCheck className={classNames(styles.iconIndicator, styles.checkIcon)} /> : null}
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
