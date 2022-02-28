import React, {useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import Popover from 'rsuite/Popover';
import mergeRefs from 'react-merge-refs';
import styles from './AutocompletePopover.module.css';
import Emotes from './Emotes.jsx';
import repositionPopover from '../../../utils/popover.js';
import useResize from '../../../common/hooks/Resize.jsx';

const TOP_PADDING = 2;
const DEFAULT_POPOVER_WIDTH = 300;

const EmoteMenuPopover = React.forwardRef(
  (
    {
      triggerRef,
      appendToChat,
      className,
      style,
      boundingQuerySelector,
      chatInputElement,
      onComplete,
      getAutocomplete,
      ...props
    },
    ref
  ) => {
    const localRef = useRef(null);
    const [popoverWidth, setPopoverWidth] = useState(DEFAULT_POPOVER_WIDTH);

    const reposition = () => repositionPopover(localRef, boundingQuerySelector, TOP_PADDING);
    useEffect(() => reposition(), [localRef, style]);

    useResize(() => {
      const {width} = chatInputElement.getBoundingClientRect();
      setPopoverWidth(width);
      reposition();
    });

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
          getAutocomplete={getAutocomplete}
        />
      </Popover>
    );
  }
);

export default EmoteMenuPopover;
