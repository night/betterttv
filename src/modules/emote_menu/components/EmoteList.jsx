import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {NavigationModeTypes, EMOTE_MENU_GRID_ROW_HEIGHT} from '../../../constants.js';
import useGridKeyboardNavigation from '../hooks/GridKeyboardNavigation.jsx';
import EmoteButton from './EmoteButton.jsx';
import Icons from './Icons.jsx';
import VirtualizedList from './VirtualizedList.jsx';
import Preview from './Preview.jsx';
import {useElementSize, useMergedRef} from '@mantine/hooks';
import {Text} from '@mantine/core';
import styles from './EmoteList.module.css';
import scrollbarStyles from '../../../common/styles/Scrollbar.module.css';
import {getEmoteKey, getRowColumnCounts} from '../utils/emote-list-grid.js';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';

const GUARD_HEIGHT = 8;

const HeaderRow = React.memo(
  ({style, className, row}) => (
    <div style={style} className={classNames(className, styles.header)}>
      <span className={styles.headerIcon}>{row.icon}</span>
      <Text c="dimmed" size="sm" className={styles.headerText}>
        {row.displayName}
      </Text>
    </div>
  ),
  (prevProps, nextProps) => prevProps.row === nextProps.row
);

const EmoteRow = React.memo(
  ({style, className, row, rowIndex: y, coords, onClick, onMouseOver}) => {
    const handleMouseOver = useCallback((x) => onMouseOver({x, y}), [onMouseOver, y]);

    return (
      <div key={y} style={style} className={classNames(className, styles.row)}>
        {row.map((emote, x) => (
          <EmoteButton
            key={getEmoteKey(emote)}
            emote={emote}
            onClick={onClick}
            onMouseOver={() => handleMouseOver(x)}
            active={x === coords.x && y === coords.y}
          />
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    const rowIndex = nextProps.rowIndex;

    const wasActive = prevProps.coords.y === rowIndex;
    const isActive = nextProps.coords.y === rowIndex;
    const activeChanged = wasActive !== isActive;

    const xChanged = prevProps.coords.x !== nextProps.coords.x && isActive;
    const rowChanged = prevProps.row !== nextProps.row;

    const onClickChanged = prevProps.onClick !== nextProps.onClick;
    const onMouseOverChanged = prevProps.onMouseOver !== nextProps.onMouseOver;

    const shouldRerender = activeChanged || xChanged || rowChanged || onClickChanged || onMouseOverChanged;

    return !shouldRerender;
  }
);

const EmptySearchState = React.forwardRef((props, ref) => {
  return (
    <div className={styles.empty} {...props} ref={ref}>
      <div className={styles.emptyIcon}>{Icons.HEART_BROKEN}</div>
      <Text c="dimmed">No results...</Text>
    </div>
  );
});

const BrowseEmotes = React.forwardRef(
  ({emoteListRows, onClick, onSection, setCoords, coords, className, headerRows}, ref) => {
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
            onMouseOver={setCoords}
          />
        );
      },
      [coords, emoteListRows]
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
      return <EmptySearchState ref={ref} />;
    }

    return (
      <VirtualizedList
        ref={ref}
        bottomGuardHeight={GUARD_HEIGHT}
        stickyRows={headerRows}
        rowHeight={EMOTE_MENU_GRID_ROW_HEIGHT}
        totalRows={emoteListRows.length}
        renderRow={renderRow}
        className={classNames(styles.emotesContainer, className, scrollbarStyles.scroll)}
        onHeaderChange={handleHeaderChange}
      />
    );
  }
);

const EmoteList = React.forwardRef(
  (
    {
      data,
      onClick,
      selected,
      section,
      onSection,
      setKeyPressCallback,
      className,
      coords,
      setCoords,
      setNavigationMode,
      navigationMode,
    },
    ref
  ) => {
    const {rows, totalCols} = data;
    const {ref: listViewportRef, height, width} = useElementSize();
    const mergedRef = useMergedRef(ref, listViewportRef);
    const rowColumnCounts = useMemo(() => getRowColumnCounts(rows), [rows]);
    const handleMouseMove = useCallback(() => setNavigationMode(NavigationModeTypes.MOUSE), [setNavigationMode]);
    const navigationModeRef = useRef(navigationMode);

    useEffect(() => {
      navigationModeRef.current = navigationMode;
    }, [navigationMode]);

    const headerRows = useMemo(() => {
      return rows
        .map((row, index) => ({isHeader: !Array.isArray(row), index}))
        .filter((row) => row.isHeader)
        .map((row) => row.index);
    }, [rows]);

    useEffect(() => {
      const currentRef = listViewportRef.current;
      if (currentRef == null) {
        return;
      }

      const clientWidth = currentRef.clientWidth;
      emoteMenuViewStore.updateTotalColumns(clientWidth);
    }, [listViewportRef, width]);

    const updateScrollPositionByCoords = useCallback(
      (newCoords) => {
        const currentRef = ref.current;
        if (navigationModeRef.current !== NavigationModeTypes.ARROW_KEYS || currentRef == null) {
          return;
        }

        const depth = newCoords.y * EMOTE_MENU_GRID_ROW_HEIGHT;
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
      },
      [height, headerRows]
    );

    const handleCoordsChangeByKeyboard = useCallback(
      (newCoords) => {
        setNavigationMode(NavigationModeTypes.ARROW_KEYS);
        setCoords(newCoords);
        updateScrollPositionByCoords(newCoords);
      },
      [updateScrollPositionByCoords, setNavigationMode]
    );

    const handleCoordsChangeByMouse = useCallback(
      (newCoords) => {
        if (navigationModeRef.current !== NavigationModeTypes.MOUSE) {
          return;
        }

        setCoords(newCoords);
      },
      [setCoords]
    );

    const {handleKeyPress} = useGridKeyboardNavigation({
      coords,
      setCoords: handleCoordsChangeByKeyboard,
      rowColumnCounts,
      maxColumnCount: totalCols,
    });

    useEffect(() => {
      setKeyPressCallback(handleKeyPress);
    }, [handleKeyPress]);

    return (
      <div className={classNames(styles.emoteListRoot, className)} onMouseMove={handleMouseMove}>
        <BrowseEmotes
          key={data.search}
          ref={mergedRef}
          section={section}
          onSection={onSection}
          onClick={onClick}
          emoteListRows={rows}
          coords={coords}
          setCoords={handleCoordsChangeByMouse}
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
    prevProps.onClick === nextProps.onClick &&
    prevProps.setKeyPressCallback === nextProps.setKeyPressCallback &&
    prevProps.data.rows === nextProps.data.rows &&
    prevProps.data.totalCols === nextProps.data.totalCols &&
    prevProps.className === nextProps.className &&
    prevProps.section === nextProps.section &&
    prevProps.onSection === nextProps.onSection &&
    prevProps.coords === nextProps.coords &&
    prevProps.setCoords === nextProps.setCoords &&
    prevProps.setNavigationMode === nextProps.setNavigationMode &&
    prevProps.navigationMode === nextProps.navigationMode
  );
});
