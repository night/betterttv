import React, {useRef} from 'react';
import classNames from 'classnames';
import Popover from 'rsuite/Popover';
import mergeRefs from 'react-merge-refs';
import styles from './AutocompletePopover.module.css';
import Emotes from './Emotes.jsx';
import repositionPopover from '../../../utils/popover.js';
import useAutoRepositionPopout from '../../../common/hooks/AutoRepositionPopover.jsx';

const TOP_PADDING = 2;

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
      getChatInputPartialEmote,
      ...props
    },
    ref
  ) => {
    const localRef = useRef(null);

    const reposition = () => repositionPopover(localRef, boundingQuerySelector, TOP_PADDING);
    const [popoverWidth] = useAutoRepositionPopout(reposition, chatInputElement, [localRef, style]);

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

export default EmoteMenuPopover;
