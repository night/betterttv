import {Button} from '@mantine/core';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';
import {AsyncStatuses} from '@/constants';
import {LoaderIconError, LoaderIconIndicator, LoaderIconSuccess} from './LoaderIcon';
import styles from './StatusButton.module.css';

const STATUS_ICONS = {
  [AsyncStatuses.PENDING]: LoaderIconIndicator,
  [AsyncStatuses.SUCCESS]: LoaderIconSuccess,
  [AsyncStatuses.ERROR]: LoaderIconError,
};

// A button for click → spinner → success/error → label flows. The label and the status icon
// swap in sequence, and the settled icon stays mounted through the fade back so nothing flickers.
export default function StatusButton({status, disabled, className, children, onClick, ...props}) {
  const busy = status !== AsyncStatuses.IDLE;

  // the fade back to the label still shows an icon, so keep the last active status. this is react's
  // documented derive-during-render pattern, not an effect, so the icon is right on the first paint
  const [lastStatus, setLastStatus] = useState(null);
  if (busy && lastStatus !== status) {
    setLastStatus(status);
  }

  const shownStatus = busy ? status : lastStatus;
  const StatusIcon = STATUS_ICONS[shownStatus];

  const handleClick = useCallback(
    (event) => {
      if (disabled || status !== AsyncStatuses.IDLE) {
        return;
      }

      onClick?.(event);
    },
    [disabled, status, onClick]
  );

  return (
    <Button
      {...props}
      // data-disabled keeps the button hoverable so a wrapping Tooltip still fires; handleClick guards the press
      mod={{disabled}}
      // data-disabled isn't a native disabled, so spell it out for screen readers
      aria-disabled={disabled || undefined}
      className={classNames(styles.button, className)}
      classNames={{label: styles.buttonLabel}}
      data-busy={busy || undefined}
      onClick={handleClick}>
      <span className={styles.content}>{children}</span>
      <span className={styles.status} aria-hidden>
        {StatusIcon != null ? <StatusIcon key={shownStatus} /> : null}
      </span>
    </Button>
  );
}
