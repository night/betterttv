import React, {useState, useEffect} from 'react';
import classNames from 'classnames';
import Popover from 'rsuite/lib/Popover/index.js';
import EmoteMenu from './EmoteMenu.jsx';
import styles from './EmoteMenuPopover.module.css';

export default function EmoteMenuPopover({triggerRef, appendToChat, className, ...props}) {
  const [hasTip, setTip] = useState(false);

  function handleSetTip(show) {
    if ((show && hasTip) || (!show && !hasTip)) {
      return;
    }

    setTip(show);
  }

  useEffect(() => {
    // TODO: we should not have logic like this in the parent
    // instead, we should have the popout position be computed on open to the top of the chat input
    // and then automatically reposition when changes like this (or the chat input grows) happen
    const popoverElement = document.getElementsByClassName(styles.popover)[0];
    if (popoverElement != null) {
      const currentTop = parseInt(popoverElement.style.top, 10);
      const newTop = hasTip ? currentTop - 26 : currentTop + 26;
      popoverElement.style.top = `${newTop}px`;
    }
  }, [hasTip]);

  return (
    <Popover className={classNames(className, styles.popover, hasTip ? styles.withTip : null)} full {...props}>
      <EmoteMenu triggerRef={triggerRef} appendToChat={appendToChat} onSetTip={(show) => handleSetTip(show)} />
    </Popover>
  );
}
