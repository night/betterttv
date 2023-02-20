import React, {useRef, useState} from 'react';
import classNames from 'classnames';
import {mergeRefs} from 'react-merge-refs';
import {Popover} from 'rsuite';
import EmoteMenu from './EmoteMenu.jsx';
import styles from './EmoteMenuPopover.module.css';
import ThemeProvider from '../../../common/components/ThemeProvider.jsx';
import useAutoPositionPopover from '../hooks/AutoRepositionPopover.jsx';
import useHorizontalResize from '../hooks/ResizeBorder.jsx';
import useStorageState from '../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../constants.js';

const EmoteMenuPopover = React.forwardRef(
  ({toggleWhisper, appendToChat, className, style, boundingQuerySelector, whisperOpen, ...props}, ref) => {
    const [emoteMenuWidth, setEmoteMenuWidth] = useStorageState(SettingIds.EMOTE_MENU_WIDTH);
    const handleRef = useRef(null);
    const [hasTip, setTip] = useState(false);
    const localRef = useRef(null);

    function handleSetTip(show) {
      if ((show && hasTip) || (!show && !hasTip)) {
        return;
      }

      setTip(show);
    }

    const width = useHorizontalResize(emoteMenuWidth, boundingQuerySelector, 300, handleRef);
    useAutoPositionPopover(localRef, boundingQuerySelector, style, hasTip, width);

    React.useEffect(() => {
      setEmoteMenuWidth(width);
    }, [width]);

    return (
      <ThemeProvider>
        <Popover
          {...props}
          ref={mergeRefs([localRef, ref])}
          className={classNames(className, styles.popover, hasTip ? styles.withTip : null)}
          style={{width}}
          full>
          <div ref={handleRef} className={styles.resizeHandle} />
          <div className={styles.emoteMenu}>
            <EmoteMenu
              toggleWhisper={toggleWhisper}
              appendToChat={(...args) => appendToChat(...args)}
              onSetTip={(show) => handleSetTip(show)}
            />
          </div>
        </Popover>
      </ThemeProvider>
    );
  }
);

export default EmoteMenuPopover;
