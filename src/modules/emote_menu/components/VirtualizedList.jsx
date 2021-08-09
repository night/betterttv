import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

const style = (index, rowHeight) => ({
  position: 'absolute',
  top: `${index * rowHeight}px`,
  height: `${rowHeight}px`,
});

const headerStyle = (rowHeight) => ({
  position: 'sticky',
  top: '0px',
  height: `${rowHeight}px`,
});

function VirtualizedList(
  {totalRows, rowHeight, renderRow, windowHeight, stickyRows = [], onHeaderChange = () => {}, ...restProps},
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

    setData({
      header: stickyRows.length > 0 ? stickyRows.reduce((a, b) => (startIndex >= b ? b : a), stickyRows[0]) : null,
      rows: rowsVisible,
    });
  }, [totalRows, rowHeight, windowHeight]);

  useEffect(() => {
    wrapperRef.current.addEventListener('scroll', isInViewport, false);
    isInViewport();
    return () => {
      if (wrapperRef.current) wrapperRef.current.removeEventListener('scroll', isInViewport, false);
    };
  }, [isInViewport]);

  return (
    <div {...restProps} style={{height: windowHeight, overflowY: 'scroll'}} ref={wrapperRef}>
      <div style={{position: 'relative', height: listHeight, width: '100%'}}>
        {data.rows.map((value) => renderRow({key: `row-${value}`, index: value, style: style(value, rowHeight)}))}
        {data.header != null
          ? renderRow({key: `row-${data.header}`, index: data.header, style: headerStyle(rowHeight)})
          : null}
      </div>
    </div>
  );
}

export default React.forwardRef(VirtualizedList);
