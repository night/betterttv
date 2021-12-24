import React, {useEffect} from 'react';
import classNames from 'classnames';
import Popover from 'rsuite/lib/Popover/index.js';
import styles from './AutocompletePopover.module.css';
import Emotes from './Emotes.jsx';
import repositionPopover from '../../../utils/popover.js';

const TOP_PADDING = 2;

export default function AutocompletePopover({
  triggerRef,
  appendToChat,
  className,
  style,
  htmlElementRef,
  boundingQuerySelector,
  chatInputElement,
  ...props
}) {
  const reposition = () => repositionPopover(htmlElementRef, boundingQuerySelector, TOP_PADDING);

  useEffect(() => {
    reposition();
  }, [htmlElementRef, style]);

  useEffect(() => {
    function handleResize() {
      reposition();
      // Twitch animates chat moving on zoom changes
      setTimeout(reposition, 500);
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Popover className={classNames(className, styles.popover)} full htmlElementRef={htmlElementRef} {...props}>
      <Emotes chatInputElement={chatInputElement} repositionPopover={() => reposition()} />
    </Popover>
  );
}
