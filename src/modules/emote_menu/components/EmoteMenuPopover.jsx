import React, {useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import mergeRefs from 'react-merge-refs';
import {Popover} from 'rsuite';
import EmoteMenu from './EmoteMenu.jsx';
import styles from './EmoteMenuPopover.module.css';
import ThemeProvider from '../../../common/components/ThemeProvider.jsx';

const TOP_PADDING = 2;

const EmoteMenuPopover = React.forwardRef(
  ({toggleWhisper, appendToChat, className, style, boundingQuerySelector, whisperOpen, ...props}, ref) => {
    const [hasTip, setTip] = useState(false);
    const localRef = useRef(null);

    function handleSetTip(show) {
      if ((show && hasTip) || (!show && !hasTip)) {
        return;
      }

      setTip(show);
    }

    function repositionPopover() {
      const popoverElement = localRef.current;
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
    }, [ref, style, hasTip]);

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
      <ThemeProvider>
        <Popover
          {...props}
          ref={mergeRefs([localRef, ref])}
          className={classNames(className, styles.popover, hasTip ? styles.withTip : null)}
          full>
          <EmoteMenu
            toggleWhisper={toggleWhisper}
            appendToChat={(...args) => {
              const result = appendToChat(...args);
              repositionPopover();
              return result;
            }}
            onSetTip={(show) => handleSetTip(show)}
          />
        </Popover>
      </ThemeProvider>
    );
  }
);

export default EmoteMenuPopover;
