import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {NavigationModeTypes, EMOTE_MENU_GRID_ROW_HEIGHT} from '../../../constants.js';
import useGridKeyboardNavigation from '../hooks/GridKeyboardNavigation.jsx';
import EmoteButton from './EmoteButton.jsx';
import Icons from './Icons.jsx';
import VirtualizedList from './VirtualizedList.jsx';
import Preview from './Preview.jsx';
import {mergeRefs, useElementSize, useMergedRef} from '@mantine/hooks';
import {Text} from '@mantine/core';
import styles from './EmoteList.module.css';
import scrollbarStyles from '../../../common/styles/Scrollbar.module.css';

const GUARD_HEIGHT = 8;

function getEmoteKey(emote) {
  return `${emote.category.id}-${emote.id}`;
}

function getRowColumnCounts(emoteListRows) {
  return emoteListRows.map((row) => (!Array.isArray(row) ? 0 : row.length));
}

function getSelectedAtCoords(emoteListRows, coords) {
  const row = emoteListRows[coords.y];
  const cell = row?.[coords.x];
  return cell != null ? cell : null;
}

function getCoordsOfSelected(emoteListRows, selected) {
  if (selected == null) {
    return null;
  }

  for (let y = 0; y < emoteListRows.length; y++) {
    if (!Array.isArray(emoteListRows[y])) {
      continue;
    }

    for (let x = 0; x < emoteListRows[y].length; x++) {
      if (getEmoteKey(emoteListRows[y][x]) === getEmoteKey(selected)) {
        return {y, x};
      }
    }
  }

  return null;
}

function getFirstCoords(emoteListRows) {
  for (let y = 0; y < emoteListRows.length; y++) {
    if (!Array.isArray(emoteListRows[y])) {
      continue;
    }

    for (let x = 0; x < emoteListRows[y].length; x++) {
      if (emoteListRows[y][x] != null) {
        return {y, x};
      }
    }
  }
  return null;
}

function HeaderRow({style, className, row}) {
  return (
    <div style={style} className={classNames(className, styles.header)}>
      <div className={styles.headerIcon}>{row.icon}</div>
      <Text c="dimmed" size="sm" className={styles.headerText}>
        {row.displayName}
      </Text>
    </div>
  );
}

function EmoteRow({style, className, row, rowIndex: y, coords, onClick, onMouseOver}) {
  return (
    <div style={style} className={classNames(className, styles.row)}>
      {row.map((emote, x) => {
        return (
          <EmoteButton
            key={getEmoteKey(emote)}
            emote={emote}
            onClick={onClick}
            onMouseOver={() => onMouseOver({x, y})}
            active={x === coords.x && y === coords.y}
          />
        );
      })}
    </div>
  );
}

function EmptySearchState() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{Icons.HEART_BROKEN}</div>
      <Text c="dimmed">No results...</Text>
    </div>
  );
}

const BrowseEmotes = React.forwardRef(
  (
    {emoteListRows, onClick, onSection, setCoords, coords, navigationMode, className, windowHeight, headerRows},
    ref
  ) => {
    const handleMouseOver = useCallback(
      (newCoords) => {
        if (navigationMode === NavigationModeTypes.MOUSE) {
          setCoords(newCoords);
        }
      },
      [navigationMode, setCoords]
    );

    const renderRow = useCallback(
      ({key, style, index: y, className}) => {
        const row = emoteListRows[y];

        if (row == null) {
          return null;
        }

        if (!Array.isArray(row)) {
          return <HeaderRow key={key} style={style} className={className} row={row} />;
        }

        return (
          <EmoteRow
            key={key}
            style={style}
            className={className}
            row={row}
            rowIndex={y}
            coords={coords}
            onClick={onClick}
            onMouseOver={handleMouseOver}
          />
        );
      },
      [coords, onClick, handleMouseOver, emoteListRows]
    );

    const handleHeaderChange = useCallback(
      (rowIndex) => {
        const header = emoteListRows[rowIndex];
        if (header == null) {
          return;
        }
        onSection(header.id);
      },
      [onSection, emoteListRows]
    );

    if (emoteListRows.length === 0) {
      return <EmptySearchState />;
    }

    return (
      <VirtualizedList
        ref={ref}
        bottomGuardHeight={GUARD_HEIGHT}
        stickyRows={headerRows}
        rowHeight={EMOTE_MENU_GRID_ROW_HEIGHT}
        windowHeight={windowHeight}
        totalRows={emoteListRows.length}
        renderRow={renderRow}
        className={classNames(styles.emotesContainer, className, scrollbarStyles.scroll)}
        onHeaderChange={handleHeaderChange}
      />
    );
  }
);

const EmoteList = React.forwardRef(
  ({data, onClick, selected, setSelected, section, onSection, setKeyPressCallback, className}, ref) => {
    const {rows, totalCols} = data;
    const {ref: listViewportRef, height} = useElementSize();
    const mergedRef = useMergedRef(ref, listViewportRef);
    const [coords, setCoords] = useState({x: 0, y: 0});
    const rowColumnCounts = useMemo(() => getRowColumnCounts(rows), [rows]);
    const [navigationMode, setNavigationMode] = useState(NavigationModeTypes.MOUSE);
    const handleMouseMove = useCallback(() => setNavigationMode(NavigationModeTypes.MOUSE), [setNavigationMode]);

    const handleCoordsChange = useCallback(
      (newCoords) => {
        if (rows.length === 0) {
          return;
        }

        if (newCoords == null) {
          newCoords = getFirstCoords(rows);
        }

        const selected = getSelectedAtCoords(rows, newCoords);

        setSelected(selected);
        setCoords(newCoords);
      },
      [setCoords, setSelected, rows]
    );

    const {handleKeyPress} = useGridKeyboardNavigation({
      coords,
      setCoords: handleCoordsChange,
      rowColumnCounts,
      maxColumnCount: totalCols,
      setNavigationMode,
    });

    useEffect(() => {
      const coords = getCoordsOfSelected(rows, selected);
      handleCoordsChange(coords);
    }, [rows]);

    const headerRows = useMemo(() => {
      return rows
        .map((row, index) => ({isHeader: !Array.isArray(row), index}))
        .filter((row) => row.isHeader)
        .map((row) => row.index);
    }, [rows]);

    useEffect(() => {
      setKeyPressCallback(handleKeyPress);
    }, [handleKeyPress]);

    useEffect(() => {
      const currentRef = ref.current;
      if (navigationMode !== NavigationModeTypes.ARROW_KEYS || currentRef == null) {
        return;
      }

      const depth = coords.y * EMOTE_MENU_GRID_ROW_HEIGHT;
      const {scrollTop} = currentRef;

      let isPreceededByHeader = false;

      if (headerRows.length > 0) {
        const firstHeaderRowY = headerRows[0] * EMOTE_MENU_GRID_ROW_HEIGHT;
        isPreceededByHeader = firstHeaderRowY < depth;
      }

      if (depth < scrollTop + EMOTE_MENU_GRID_ROW_HEIGHT) {
        currentRef.scrollTo(0, isPreceededByHeader ? depth - EMOTE_MENU_GRID_ROW_HEIGHT : depth);
      }

      if (depth + EMOTE_MENU_GRID_ROW_HEIGHT >= scrollTop + height) {
        currentRef.scrollTo(0, depth + EMOTE_MENU_GRID_ROW_HEIGHT - height);
      }
    }, [coords, navigationMode, height, headerRows]);

    return (
      <div className={classNames(styles.emoteListRoot, className)} onMouseMove={handleMouseMove}>
        <BrowseEmotes
          ref={mergedRef}
          section={section}
          onSection={onSection}
          onClick={onClick}
          emoteListRows={rows}
          navigationMode={navigationMode}
          coords={coords}
          setCoords={handleCoordsChange}
          windowHeight={height}
          headerRows={headerRows}
        />
        <Preview emote={selected} />
      </div>
    );
  }
);

export default React.memo(EmoteList, (prevProps, nextProps) => {
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.setSelected === nextProps.setSelected &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.setKeyPressCallback === nextProps.setKeyPressCallback &&
    prevProps.data.rows === nextProps.data.rows &&
    prevProps.data.totalCols === nextProps.data.totalCols &&
    prevProps.className === nextProps.className &&
    prevProps.section === nextProps.section &&
    prevProps.onSection === nextProps.onSection
  );
});
