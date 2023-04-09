import React from 'react';
import useStorageState from '../../../common/hooks/StorageState.jsx';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import {SettingIds} from '../../../constants.js';

const MIN_WIDTH = 300;
const WINDOW_HORIZONTAL_MARGIN = 20;

export default function useHorizontalResize({boundingQuerySelector, handleRef, reposition}) {
  const [emoteMenuWidth, setEmoteMenuWidth] = useStorageState(SettingIds.EMOTE_MENU_WIDTH); // desired width
  const [displayWidth, setDisplayWidth] = React.useState(emoteMenuWidth); // actual width
  const [isResizing, setIsResizing] = React.useState(false);

  React.useEffect(() => {
    emoteMenuViewStore.updateTotalColumns(displayWidth);
  }, []);

  function setWidth(width, windowResize = false) {
    let newWidth = width;
    if (newWidth < MIN_WIDTH) {
      newWidth = MIN_WIDTH;
    }
    const maxWidth = window.innerWidth - WINDOW_HORIZONTAL_MARGIN;
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
    }
    if (!windowResize) {
      setEmoteMenuWidth(newWidth);
    }
    setDisplayWidth(newWidth);
    emoteMenuViewStore.updateTotalColumns(newWidth);
    reposition();
  }

  React.useEffect(() => {
    if (handleRef.current == null) {
      return undefined;
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

    handleRef.current.addEventListener('mousedown', handleResizeStart);
    document.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (handleRef.current != null) {
        handleRef.current.removeEventListener('mousedown', handleResizeStart);
      }
      document.addEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [handleRef, emoteMenuWidth]);

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
