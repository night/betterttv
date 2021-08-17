import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from '../styles/list.module.css';

function VirtualizedList(
  {className, totalRows, rowHeight, renderRow, windowHeight, stickyRows = [], onHeaderChange = () => {}},
  ref
) {
  const listHeight = useMemo(() => rowHeight * totalRows, [totalRows, rowHeight]);

  const [data, setData] = useState({
    header: null,
    rows: [],
  });

  useEffect(() => {
    onHeaderChange(data.header);
  }, [data.header]);

  const wrapperRef = ref || useRef(null);

  const isInViewport = useCallback(() => {
    const {scrollTop} = wrapperRef.current;
    const scrollBottom = scrollTop + windowHeight;

    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(totalRows - 1, Math.floor(scrollBottom / rowHeight));

    const rowsVisible = [];

    for (let i = startIndex; i <= endIndex; i++) {
      rowsVisible.push(i);
    }

    let current = 0;
    let next = 0;

    next = stickyRows.find((a) => {
      if (a > startIndex) {
        return true;
      }

      current = a;
      return false;
    });

    const isAbsolute = startIndex >= next - 1;

    setData({
      header: {
        current,
        top: !isAbsolute ? 0 : (next - 1) * rowHeight,
        position: !isAbsolute ? 'sticky' : 'absolute',
      },
      rows: rowsVisible,
    });
  }, [totalRows, rowHeight, windowHeight]);

  useEffect(() => {
    wrapperRef.current.addEventListener('scroll', isInViewport, false);
    isInViewport();
    return () => {
      if (wrapperRef.current == null) {
        return;
      }
      wrapperRef.current.removeEventListener('scroll', isInViewport, false);
    };
  }, [isInViewport]);

  return (
    <div className={classNames(styles.list, className)} style={{height: windowHeight}} ref={wrapperRef}>
      <div className={styles.rows} style={{height: listHeight}}>
        {data.rows.map((value) =>
          renderRow({
            key: `row-${value}`,
            index: value,
            style: {
              top: `${value * rowHeight}px`,
              height: `${rowHeight}px`,
            },
            className: styles.row,
          })
        )}
        {data.header != null
          ? renderRow({
              key: `row-${data.header.current}`,
              index: data.header.current,
              style: {
                height: `${rowHeight}px`,
                top: `${data.header.top}px`,
                position: data.header.position,
              },
              className: styles.header,
            })
          : null}
      </div>
    </div>
  );
}

export default React.forwardRef(VirtualizedList);
