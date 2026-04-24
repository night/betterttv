import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from './VirtualizedList.module.css';
import throttle from 'lodash.throttle';
import {useElementSize, useMergedRef} from '@mantine/hooks';

function VirtualizedList(
  {
    className,
    totalRows,
    rowHeight,
    renderRow,
    stickyRows,
    onHeaderChange = () => {},
    bottomGuardHeight = 0,
    topGuardHeight = 0,
    overscanCount = 10,
    ...props
  },
  forwardedRef
) {
  const {ref, height: windowHeight} = useElementSize(null);
  const mergedRef = useMergedRef(forwardedRef, ref);
  const headerIndex = useRef(null);

  const listHeight = useMemo(
    () => Math.max(rowHeight * totalRows + topGuardHeight + bottomGuardHeight, windowHeight),
    [totalRows, rowHeight, windowHeight, topGuardHeight, bottomGuardHeight]
  );

  const handleViewportUpdate = useCallback(
    (scrollTop = 0) => {
      const scrollBottom = scrollTop + windowHeight;
      const startIndex = Math.floor(scrollTop / rowHeight);
      const endIndex = Math.min(totalRows - 1, Math.floor(scrollBottom / rowHeight));

      let stickyRowIndex;
      for (const rowIndex of stickyRows ?? []) {
        if (rowIndex > startIndex) {
          break;
        }
        stickyRowIndex = rowIndex;
      }

      const hasAdditionalStickyRow = stickyRowIndex != null && stickyRowIndex < startIndex;
      const hasCollapsedGap = hasAdditionalStickyRow && startIndex > stickyRowIndex + 1;

      const renderEnd = Math.min(totalRows - 1, endIndex + overscanCount);

      let renderStart = Math.max(0, startIndex - overscanCount);
      if (hasAdditionalStickyRow) {
        renderStart = Math.max(stickyRowIndex + 1, renderStart);
      }

      if (hasCollapsedGap && startIndex - overscanCount > stickyRowIndex + 1) {
        renderStart = startIndex;
      }

      const rowsVisible = [];
      if (hasAdditionalStickyRow) {
        rowsVisible.push(stickyRowIndex);
      }

      for (let i = renderStart; i <= renderEnd; i++) {
        rowsVisible.push(i);
      }

      let top = renderStart * rowHeight;

      if (hasAdditionalStickyRow && hasCollapsedGap && renderStart < startIndex) {
        top = stickyRowIndex * rowHeight;
      } else if (hasAdditionalStickyRow) {
        top = (startIndex - 1) * rowHeight;
      }

      return {rows: rowsVisible, top, headerIndex: stickyRowIndex};
    },
    [totalRows, rowHeight, windowHeight, stickyRows, overscanCount, onHeaderChange]
  );

  const [data, setData] = useState(handleViewportUpdate(0));

  const handleScroll = useCallback(() => {
    console.log('handleScroll');
    const currentWrapperRef = ref.current;
    const scrollTop = currentWrapperRef?.scrollTop ?? 0;

    const {rows, top, headerIndex: newHeaderIndex} = handleViewportUpdate(scrollTop);

    if (headerIndex.current != null && headerIndex.current !== newHeaderIndex) {
      onHeaderChange(newHeaderIndex);
    }

    headerIndex.current = newHeaderIndex;
    setData({rows, top, headerIndex: newHeaderIndex});
  }, [handleViewportUpdate, onHeaderChange]);

  useEffect(() => {
    const currentWrapperRef = ref.current;
    if (currentWrapperRef == null) {
      return;
    }

    const throttledCallback = throttle(handleScroll, 50);

    currentWrapperRef.addEventListener('scroll', throttledCallback);
    return () => currentWrapperRef.removeEventListener('scroll', throttledCallback);
  }, [handleScroll]);

  const rows = useMemo(
    () => data.rows.map((value) => renderRow({key: `row-${value}`, index: value, style: {height: `${rowHeight}px`}})),
    [data.rows, renderRow]
  );

  return (
    <div className={classNames(styles.list, className)} style={{height: windowHeight}} ref={mergedRef} {...props}>
      <div className={styles.rows} style={{top: data.top}}>
        <div className={styles.guard} style={{height: topGuardHeight}} />
        {rows}
        <div className={styles.guard} style={{height: bottomGuardHeight}} />
      </div>
      <div className={styles.ghostRows} style={{height: listHeight}} />
    </div>
  );
}

export default React.forwardRef(VirtualizedList);
