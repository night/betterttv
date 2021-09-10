import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import classNames from 'classnames';
import VirtualizedList from './VirtualizedList.jsx';
import emoteStore from '../stores/index.js';
import styles from '../styles/emotes.module.css';
import Emote from './Emote.jsx';
import Icons from './Icons.jsx';
import {NavigationModeTypes, RowHeight, WindowHeight} from '../../../constants.js';

const MAX_COLUMN_COUNT = 6;

let navigationMode = NavigationModeTypes.MOUSE;

function travelUp(rowColumnCounts, {x, y}, numBlocks = 1) {
  let newY = Math.max(0, y - numBlocks);
  let newYColumnCount = rowColumnCounts[newY];

  // if we've reached a row without columns, we want to travel upwards again
  if (newYColumnCount === 0) {
    if (newY > 0) {
      return travelUp(rowColumnCounts, {x, y}, numBlocks + 1);
    }

    // if we've reached the top, we have nowhere else to go.. the existing Y must be the first
    newY = y;
    newYColumnCount = rowColumnCounts[y];
  }

  return {
    x: Math.min(newYColumnCount - 1, x),
    y: newY,
  };
}

function travelDown(rowColumnCounts, {x, y}, numBlocks = 1) {
  const maxY = rowColumnCounts.length - 1;
  let newY = Math.min(y + numBlocks, maxY);
  let newYColumnCount = rowColumnCounts[newY];

  // if we've reached a row without columns, we want to travel downwards again
  if (newYColumnCount === 0) {
    if (newY < maxY) {
      return travelDown(rowColumnCounts, {x, y}, numBlocks + 1);
    }

    // if we've reached the bottom, we have nowhere else to go.. the existing Y must be the last
    newY = y;
    newYColumnCount = rowColumnCounts[y];
  }

  return {
    x: Math.min(newYColumnCount - 1, x),
    y: newY,
  };
}

function travelLeft(rowColumnCounts, {x, y}) {
  // if it's the first in the row, we want to wrap around
  if (x === 0) {
    const {x: newX, y: newY} = travelUp(rowColumnCounts, {x: MAX_COLUMN_COUNT, y});
    // if y did not decrease, we must be at the start and this is the left-most
    if (newY >= y) {
      return {x, y};
    }
    return {x: newX, y: newY};
  }

  return {x: x - 1, y};
}

function travelRight(rowColumnCounts, {x, y}) {
  // if it's the last in the row, we want to wrap around
  if (x === rowColumnCounts[y] - 1) {
    const {x: newX, y: newY} = travelDown(rowColumnCounts, {x: 0, y});
    // if y did not increase, we must be at the end and this is the right-most
    if (newY <= y) {
      return {x, y};
    }
    return {x: newX, y: newY};
  }

  return {x: x + 1, y};
}

const Emotes = React.forwardRef(
  ({onClick, section, onSection, setCords, cords, setRowColumnCounts, rows, setSelected}, ref) => {
    const handleMouseOver = useCallback((newCords) => {
      if (navigationMode === NavigationModeTypes.MOUSE) {
        setCords(newCords);
      }
    }, []);

    useEffect(() => {
      const rowColumnCounts = [];

      for (const row of rows) {
        rowColumnCounts.push(!Array.isArray(row) ? 0 : row.length);
      }
      setRowColumnCounts(rowColumnCounts);
    }, [rows]);

    useEffect(() => setSelected(rows[cords.y][cords.x]), [cords]);

    useEffect(() => {
      for (const row of rows) {
        if (Array.isArray(row)) {
          setSelected(row[0]);
          break;
        }
      }
    }, []);

    const renderRow = useCallback(
      ({key, style, index: y, className}) => {
        const row = emoteStore.getRow(y);
        return emoteStore.headers.includes(y) ? (
          <div key={key} style={style} className={classNames(className, styles.header)}>
            <Icon className={styles.headerIcon}>{row.icon}</Icon>
            <div className={styles.headerText}>{row.displayName.toUpperCase()}</div>
          </div>
        ) : (
          <div key={key} style={style} className={classNames(className, styles.row)}>
            {row.map((emote, x) => (
              <Emote
                active={y === cords.y && x === cords.x}
                emote={emote}
                onClick={onClick}
                onMouseOver={() => handleMouseOver({x, y})}
              />
            ))}
          </div>
        );
      },
      [cords, onClick]
    );

    const handleHeaderChange = useCallback((rowIndex) => {
      const header = emoteStore.getRow(rowIndex);
      if (header != null) {
        onSection(header.id);
      }
    });

    useEffect(() => {
      if (!section.scrollTo) return;
      const index = emoteStore.getProviderIndexById(section.eventKey);
      if (index != null) {
        ref.current.scrollTo(0, index * RowHeight);
      }
    }, [section]);

    return (
      <VirtualizedList
        stickyRows={emoteStore.headers}
        rowHeight={RowHeight}
        windowHeight={WindowHeight}
        totalRows={emoteStore.rows.length}
        renderRow={renderRow}
        className={styles.emotesContainer}
        onHeaderChange={handleHeaderChange}
        ref={ref}
      />
    );
  }
);

const SearchedEmotes = React.forwardRef(({search, onClick, cords, setCords, setRowColumnCounts, setSelected}, ref) => {
  const emotes = useMemo(() => emoteStore.search(search), [search]);

  const handleMouseOver = useCallback((newCords) => {
    if (navigationMode === NavigationModeTypes.MOUSE) {
      setCords(newCords);
    }
  }, []);

  useEffect(() => {
    const rowColumnCounts = [];
    let foundFirstEmote = false;

    for (const row of emotes) {
      rowColumnCounts.push(!Array.isArray(row) ? 0 : row.length);

      if (Array.isArray(row) && !foundFirstEmote) {
        setSelected(row[0].item);
        foundFirstEmote = true;
      }
    }
    setRowColumnCounts(rowColumnCounts);
  }, [emotes]);

  const renderRow = useCallback(
    ({key, style, index: y, className}) => {
      const row = emotes[y];
      if (row == null) return null;
      return (
        <div key={key} style={style} className={classNames(className, styles.row)}>
          {row.map(({item}, x) => (
            <Emote
              emote={item}
              onClick={onClick}
              onMouseOver={() => handleMouseOver({x, y})}
              active={x === cords.x && y === cords.y}
            />
          ))}
        </div>
      );
    },
    [emotes, cords, onClick]
  );

  if (emotes.length === 0) {
    return (
      <div className={styles.empty}>
        {Icons.HEART_BROKEN}
        <p>No results...</p>
      </div>
    );
  }

  return (
    <VirtualizedList
      ref={ref}
      rowHeight={RowHeight}
      windowHeight={WindowHeight}
      totalRows={emotes.length}
      renderRow={renderRow}
      className={classNames(styles.emotesContainer, styles.searched)}
      stickyRows={[]}
    />
  );
});

export default function renderEmotes(props) {
  const {search, arrowKeys} = props;

  const [cords, setCords] = useState({x: 0, y: 0});
  const [rowColumnCounts, setRowColumnCounts] = useState([]);

  const wrapperRef = useRef(null);

  const isSearch = search.length > 0;

  useEffect(() => {
    function callback() {
      navigationMode = NavigationModeTypes.MOUSE;
    }

    window.addEventListener('mousemove', callback);

    return () => {
      window.removeEventListener('mousemove', callback);
    };
  }, []);

  useEffect(() => {
    navigationMode = NavigationModeTypes.ARROW_KEYS;

    let newCords = null;

    switch (true) {
      case arrowKeys.top:
        newCords = travelUp(rowColumnCounts, cords);
        break;
      case arrowKeys.down:
        newCords = travelDown(rowColumnCounts, cords);
        break;
      case arrowKeys.right:
        newCords = travelRight(rowColumnCounts, cords);
        break;
      case arrowKeys.left:
        newCords = travelLeft(rowColumnCounts, cords);
        break;
      default:
        return;
    }

    const depth = newCords.y * RowHeight;
    const {scrollTop} = wrapperRef.current;

    if (depth < scrollTop + RowHeight) {
      wrapperRef.current.scrollTo(0, isSearch ? depth : depth - RowHeight);
    }

    if (depth + RowHeight >= scrollTop + WindowHeight) {
      wrapperRef.current.scrollTo(0, depth + RowHeight - WindowHeight);
    }

    setCords(newCords);
  }, [arrowKeys]);

  return isSearch ? (
    <SearchedEmotes
      ref={wrapperRef}
      setRowColumnCounts={setRowColumnCounts}
      cords={cords}
      setCords={setCords}
      {...props}
    />
  ) : (
    <Emotes ref={wrapperRef} setRowColumnCounts={setRowColumnCounts} cords={cords} setCords={setCords} {...props} />
  );
}
