import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from './VirtualizedList.module.css';
import throttle from 'lodash.throttle';
import {useMergedRef} from '@mantine/hooks';

function VirtualizedList(
  {
    className,
    totalRows,
    rowHeight,
    renderRow,
    windowHeight,
    stickyRows,
    onHeaderChange = () => {},
    bottomGuardHeight = 0,
    topGuardHeight = 0,
    overscanCount = 10,
    ...props
  },
  forwardedRef
) {
  const ref = useRef(null);
  const mergedRef = useMergedRef(forwardedRef, ref);

  const listHeight = useMemo(
    () => Math.max(rowHeight * totalRows + topGuardHeight + bottomGuardHeight, windowHeight),
    [totalRows, rowHeight, windowHeight, topGuardHeight, bottomGuardHeight]
  );

  const [data, setData] = useState({
    top: 0,
    rows: [],
    headerIndex: null,
  });

  const isInViewport = useCallback(() => {
    const currentWrapperRef = ref.current;
    if (currentWrapperRef == null) {
      return;
    }
    const {scrollTop} = currentWrapperRef;
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

    setData((prevData) => {
      if (prevData.headerIndex !== stickyRowIndex) {
        onHeaderChange(stickyRowIndex);
      }

      return {...prevData, rows: rowsVisible, top, headerIndex: stickyRowIndex};
    });
  }, [totalRows, rowHeight, windowHeight, stickyRows, overscanCount]);

  useEffect(() => {
    const currentWrapperRef = ref.current;
    if (currentWrapperRef == null) {
      return;
    }

    isInViewport();
    const throttledCallback = throttle(isInViewport, 50);

    currentWrapperRef.addEventListener('scroll', throttledCallback);
    return () => {
      currentWrapperRef.removeEventListener('scroll', throttledCallback);
    };
  }, [isInViewport]);

  const rows = useMemo(
    () =>
      data.rows.map((value) =>
        renderRow({
          key: `row-${value}`,
          index: value,
          style: {height: `${rowHeight}px`},
        })
      ),
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
