import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

const style = (index, rowHeight) => ({
  position: 'absolute',
  top: `${index * rowHeight}px`,
  height: `${rowHeight}px`,
  width: '100%',
});

const headerStyle = (rowHeight) => ({
  position: 'sticky',
  top: '0px',
  height: `${rowHeight}px`,
  width: '100%',
});

export default function VirtualizedList({totalRows, rowHeight, renderRow, windowHeight, stickyRows, ...restProps}) {
  const listHeight = useMemo(() => rowHeight * totalRows, [totalRows, rowHeight]);
  const headers = useMemo(() => stickyRows.sort((a, b) => b - a), [stickyRows]);

  const [data, setData] = useState({
    header: null,
    rows: [],
  });

  const wrapperRef = useRef(null);

  const isInViewport = useCallback(() => {
    const {scrollTop} = wrapperRef.current;
    const scrollBottom = scrollTop + windowHeight;

    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(totalRows - 1, Math.floor(scrollBottom / rowHeight));

    const rowsVisible = [];

    for (let i = startIndex; i <= endIndex; i++) {
      rowsVisible.push(i);
    }

    const newHeader = headers != null ? headers.filter((value) => value < startIndex + 1)[0] : null;

    setData({
      header: newHeader,
      rows: rowsVisible,
    });
  }, [totalRows, rowHeight, windowHeight]);

  useEffect(() => {
    const isInViewportListener = isInViewport;
    wrapperRef.current.addEventListener('scroll', isInViewportListener, false);
    isInViewport();
    return () => {
      wrapperRef.current.removeEventListener('scroll', isInViewportListener, false);
    };
  }, [isInViewport]);

  return (
    <div {...restProps} style={{height: windowHeight, overflowY: 'scroll'}} ref={wrapperRef}>
      <div style={{position: 'relative', height: listHeight}}>
        {data.rows.map((value) => renderRow({key: `row-${value}`, index: value, style: style(value, rowHeight)}))}
        {data.header != null &&
          renderRow({key: `row-${data.header}`, index: data.header, style: headerStyle(rowHeight)})}
      </div>
    </div>
  );
}
