import React, {useRef, useState} from 'react';
import classNames from 'classnames';
import mergeRefs from 'react-merge-refs';
import {Popover} from 'rsuite';
import EmoteMenu from './EmoteMenu.jsx';
import styles from './EmoteMenuPopover.module.css';
import ThemeProvider from '../../../common/components/ThemeProvider.jsx';
import useAutoPositionPopover from '../hooks/AutoRepositionPopover.jsx';

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

    useAutoPositionPopover(localRef, boundingQuerySelector, style, hasTip);

    return (
      <ThemeProvider>
        <Popover
          {...props}
          ref={mergeRefs([localRef, ref])}
          className={classNames(className, styles.popover, hasTip ? styles.withTip : null)}
          full>
          <EmoteMenu
            toggleWhisper={toggleWhisper}
            appendToChat={(...args) => appendToChat(...args)}
            onSetTip={(show) => handleSetTip(show)}
          />
        </Popover>
      </ThemeProvider>
    );
  }
);

export default EmoteMenuPopover;
