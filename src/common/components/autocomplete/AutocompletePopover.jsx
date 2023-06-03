import React, {useCallback, useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import Popover from 'rsuite/Popover';
import {mergeRefs} from 'react-merge-refs';
import Items from './Items.jsx';
import repositionPopover from '../../../utils/popover.js';
import useResize from '../../hooks/Resize.jsx';
import styles from './AutocompletePopover.module.css';

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
      getChatInputPartialInput,
      renderRow,
      computeMatches,
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
        <Items
          chatInputElement={chatInputElement}
          repositionPopover={() => reposition()}
          onComplete={onComplete}
          getChatInputPartialInput={getChatInputPartialInput}
          renderRow={renderRow}
          computeMatches={computeMatches}
        />
      </Popover>
    );
  }
);

export default AutocompletePopover;
