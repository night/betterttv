import React, {useEffect, useRef} from 'react';
import classNames from 'classnames';
import Popover from 'rsuite/Popover';
import mergeRefs from 'react-merge-refs';
import styles from './AutocompletePopover.module.css';
import Emotes from './Emotes.jsx';
import repositionPopover from '../../../utils/popover.js';
import useResize from '../../../common/hooks/useResize.js';

const TOP_PADDING = 2;

const EmoteMenuPopover = React.forwardRef(
  ({triggerRef, appendToChat, className, style, boundingQuerySelector, chatInputElement, ...props}, ref) => {
    const localRef = useRef(null);
    const reposition = () => repositionPopover(localRef, boundingQuerySelector, TOP_PADDING);

    useEffect(() => reposition(), [localRef, style]);
    useResize(reposition);

    return (
      <Popover className={classNames(className, styles.popover)} full ref={mergeRefs([localRef, ref])} {...props}>
        <Emotes chatInputElement={chatInputElement} repositionPopover={() => reposition()} />
      </Popover>
    );
  }
);

export default EmoteMenuPopover;
