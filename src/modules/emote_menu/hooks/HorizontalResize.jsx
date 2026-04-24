import React from 'react';
import useStorageState from '../../../common/hooks/StorageState.jsx';
import {EMOTE_MENU_MIN_WIDTH} from '../../../common/stores/emote-menu-view-store.js';
import {SettingIds} from '../../../constants.js';

const WINDOW_HORIZONTAL_MARGIN = 20;

export default function useHorizontalResize({
  boundingQuerySelector,
  handleRef,
  minWidth = EMOTE_MENU_MIN_WIDTH,
  open = true,
}) {
  const [emoteMenuWidth, setEmoteMenuWidth] = useStorageState(SettingIds.EMOTE_MENU_WIDTH); // desired width
  const [displayWidth, setDisplayWidth] = React.useState(emoteMenuWidth); // actual width
  const [isResizing, setIsResizing] = React.useState(false);

  function setWidth(width, windowResize = false) {
    let newWidth = width;
    if (newWidth < minWidth) {
      newWidth = minWidth;
    }
    const maxWidth = window.innerWidth - WINDOW_HORIZONTAL_MARGIN;
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
    }
    if (!windowResize) {
      setEmoteMenuWidth(newWidth);
    }
    setDisplayWidth(newWidth);
  }

  React.useEffect(() => {
    if (!open) {
      setIsResizing(false);
    }

    const currentRef = handleRef.current;
    if (currentRef == null) {
      return;
    }

    function handleWindowResize() {
      setWidth(emoteMenuWidth, true);
    }

    function handleResizeStart(event) {
      setIsResizing(true);
      event.preventDefault();
    }

    function handleResizeEnd() {
      setIsResizing(false);
    }

    handleWindowResize();

    currentRef.addEventListener('mousedown', handleResizeStart);
    document.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('resize', handleWindowResize);

    // eslint-disable-next-line consistent-return
    return () => {
      currentRef.removeEventListener('mousedown', handleResizeStart);
      document.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [handleRef, emoteMenuWidth, open]);

  React.useEffect(() => {
    function handleResizeMove(e) {
      if (!isResizing) {
        return;
      }
      const boundingNode = document.querySelector(boundingQuerySelector);
      if (boundingNode == null) {
        return;
      }
      const {right} = boundingNode.getBoundingClientRect();
      const newWidth = right - e.clientX;
      setWidth(newWidth);
    }

    document.addEventListener('mousemove', handleResizeMove);
    return () => document.removeEventListener('mousemove', handleResizeMove);
  }, [isResizing, boundingQuerySelector]);

  return displayWidth;
}
