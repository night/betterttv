import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from './VirtualizedList.module.css';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';

function VirtualizedList(
  {
    className,
    totalRows,
    rowHeight,
    renderRow,
    windowHeight,
    stickyRows,
    onHeaderChange = () => {},
    stickyBottomComponent,
    bottomGuardHeight = 0,
    topGuardHeight = 0,
    ...props
  },
  ref
) {
  const listHeight = useMemo(
    () => Math.max(rowHeight * totalRows + topGuardHeight + bottomGuardHeight, windowHeight),
    [totalRows, rowHeight, windowHeight, topGuardHeight, bottomGuardHeight]
  );

  const [data, setData] = useState({
    top: 0,
    rows: [],
    headerIndex: null,
  });

  useEffect(() => {
    onHeaderChange(data.headerIndex);
  }, [data.headerIndex]);

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

    const rowsVisible = [];
    const hasAdditionalStickyRow = stickyRowIndex < startIndex;
    if (hasAdditionalStickyRow) {
      rowsVisible.push(stickyRowIndex);
    }

    for (let i = startIndex; i <= endIndex; i++) {
      rowsVisible.push(i);
    }

    const indexOffset = hasAdditionalStickyRow ? startIndex - 1 : startIndex;
    setData({rows: rowsVisible, top: indexOffset * rowHeight, headerIndex: stickyRowIndex});
  }, [totalRows, rowHeight, windowHeight, stickyRows]);

  useEffect(() => {
    const currentWrapperRef = ref.current;
    if (currentWrapperRef == null) {
      return null;
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
    <div className={classNames(styles.list, className)} style={{height: windowHeight}} ref={ref} {...props}>
      <div className={styles.rows} style={{top: data.top}}>
        <div className={styles.guard} style={{height: topGuardHeight}} />
        {rows}
        <div className={styles.guard} style={{height: bottomGuardHeight}} />
      </div>
      <div className={styles.ghostRows} style={{height: listHeight}} />
      <div className={styles.stickyBottomComponent}>{stickyBottomComponent}</div>
    </div>
  );
}

export default React.forwardRef(VirtualizedList);
