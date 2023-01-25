import React, {useCallback, useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import Popover from 'rsuite/Popover';
import {mergeRefs} from 'react-merge-refs';
import styles from './AutocompletePopover.module.css';
import Emotes from './Emotes.jsx';
import repositionPopover from '../../../utils/popover.js';
import useResize from '../../../common/hooks/Resize.jsx';

const TOP_PADDING = 2;

const AutocompletePopover = React.forwardRef(
  (
    {
      triggerRef,
      appendToChat,
      className,
      style,
      boundingQuerySelector,
      chatInputElement,
      onComplete,
      getChatInputPartialEmote,
      ...props
    },
    ref
  ) => {
    const localRef = useRef(null);
    const [popoverWidth, setPopoverWidth] = useState(null);

    const reposition = useCallback(() => {
      if (chatInputElement == null) {
        return;
      }
      const {width} = chatInputElement.getBoundingClientRect();
      setPopoverWidth(width);
      repositionPopover(localRef, boundingQuerySelector, TOP_PADDING);
    }, [setPopoverWidth, chatInputElement]);

    useResize(reposition);
    useEffect(() => {
      reposition();
    }, [reposition, localRef, style]);

    return (
      <Popover
        full
        className={classNames(className, styles.popover)}
        style={{width: popoverWidth}}
        ref={mergeRefs([localRef, ref])}
        {...props}>
        <Emotes
          chatInputElement={chatInputElement}
          repositionPopover={() => reposition()}
          onComplete={onComplete}
          getChatInputPartialEmote={getChatInputPartialEmote}
        />
      </Popover>
    );
  }
);

export default AutocompletePopover;
