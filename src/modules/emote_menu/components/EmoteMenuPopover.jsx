import React, {useState, useEffect} from 'react';
import classNames from 'classnames';
import Popover from 'rsuite/lib/Popover/index.js';
import EmoteMenu from './EmoteMenu.jsx';
import styles from './EmoteMenuPopover.module.css';

const TOP_PADDING = 2;

export default function EmoteMenuPopover({
  triggerRef,
  appendToChat,
  className,
  style,
  htmlElementRef,
  boundingQuerySelector,
  ...props
}) {
  const [hasTip, setTip] = useState(false);

  function handleSetTip(show) {
    if ((show && hasTip) || (!show && !hasTip)) {
      return;
    }

    setTip(show);
  }

  function repositionPopover() {
    const popoverElement = htmlElementRef.current;
    if (popoverElement == null) {
      return;
    }

    const chatTextArea = document.querySelector(boundingQuerySelector);
    if (chatTextArea == null) {
      return;
    }

    const {x, y} = chatTextArea.getBoundingClientRect();
    const rightX = x + chatTextArea.offsetWidth;

    const popoverTop = `${y - popoverElement.offsetHeight - TOP_PADDING}px`;
    const wantedPopoverLeft = rightX - popoverElement.offsetWidth;
    const popoverLeft = `${wantedPopoverLeft < 0 ? x : wantedPopoverLeft}px`;

    if (popoverTop !== popoverElement.style.top) {
      popoverElement.style.top = popoverTop;
    }
    if (popoverLeft !== popoverElement.style.left) {
      popoverElement.style.left = popoverLeft;
    }
  }

  useEffect(() => {
    repositionPopover();
  }, [htmlElementRef, style, hasTip]);

  useEffect(() => {
    function handleResize() {
      repositionPopover();
      // Twitch animates chat moving on zoom changes
      setTimeout(repositionPopover, 500);
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Popover
      className={classNames(className, styles.popover, hasTip ? styles.withTip : null)}
      full
      htmlElementRef={htmlElementRef}
      {...props}>
      <EmoteMenu
        triggerRef={triggerRef}
        appendToChat={(...args) => {
          const result = appendToChat(...args);
          repositionPopover();
          return result;
        }}
        onSetTip={(show) => handleSetTip(show)}
      />
    </Popover>
  );
}
