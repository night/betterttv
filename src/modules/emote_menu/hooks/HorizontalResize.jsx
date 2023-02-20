import React from 'react';

export default function useHorizontalResize(initialWidth, boundingQuerySelector, minWidth, ref) {
  const [isResizing, setIsResizing] = React.useState(false);
  const [width, setWidth] = React.useState(initialWidth);

  React.useEffect(() => {
    if (ref.current == null) {
      return undefined;
    }

    function handleWindowResize() {
      const textArea = document.querySelector(boundingQuerySelector);
      if (textArea == null) {
        return;
      }
      const {width: textAreaWidth} = textArea.getBoundingClientRect();
      if (width > window.innerWidth) {
        setWidth(textAreaWidth);
      }
    }

    function handleResizeStart() {
      setIsResizing(true);
    }

    function handleResizeEnd() {
      if (!isResizing) {
        return;
      }
      setIsResizing(false);
    }

    handleWindowResize();

    ref.current.addEventListener('mousedown', handleResizeStart);
    document.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (ref.current != null) {
        ref.current.removeEventListener('mousedown', handleResizeStart);
      }
      document.addEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [ref, isResizing]);

  React.useEffect(() => {
    if (!isResizing) {
      return undefined;
    }

    function handleResizeMove(e) {
      const textArea = document.querySelector(boundingQuerySelector);
      if (textArea == null) {
        return;
      }
      const {right, width: textAreaWidth} = textArea.getBoundingClientRect();
      const newWidth = right - e.clientX;
      setWidth(() => {
        if (newWidth > window.innerWidth) {
          return textAreaWidth;
        }
        if (newWidth < minWidth) {
          return minWidth;
        }
        return newWidth;
      });
    }

    document.addEventListener('mousemove', handleResizeMove);
    return () => document.removeEventListener('mousemove', handleResizeMove);
  }, [isResizing, boundingQuerySelector]);

  return width;
}
