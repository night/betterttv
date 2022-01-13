import React, {useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import mergeRefs from 'react-merge-refs';
import {Popover} from 'rsuite';
import EmoteMenu from './EmoteMenu.jsx';
import styles from './EmoteMenuPopover.module.css';
import ThemeProvider from '../../../common/components/ThemeProvider.jsx';
import repositionPopover from '../../../utils/popover.js';
import useResize from '../../../common/hooks/useResize.js';

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

    const reposition = () => repositionPopover(localRef, boundingQuerySelector, TOP_PADDING);

    useEffect(() => reposition(), [localRef, style, hasTip]);
    useResize(reposition);

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
