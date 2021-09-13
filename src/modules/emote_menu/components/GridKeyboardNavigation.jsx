import {useCallback, useEffect, useState} from 'react';
import {NavigationModeTypes} from '../../../constants.js';
import keycodes from '../../../utils/keycodes.js';

function travelUp(rowColumnCounts, {x, y}, maxColumnCount, numBlocks = 1) {
  let newY = Math.max(0, y - numBlocks);
  let newYColumnCount = rowColumnCounts[newY];

  // if we've reached a row without columns, we want to travel upwards again
  if (newYColumnCount === 0) {
    if (newY > 0) {
      return travelUp(rowColumnCounts, {x, y}, maxColumnCount, numBlocks + 1);
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

function travelDown(rowColumnCounts, {x, y}, maxColumnCount, numBlocks = 1) {
  const maxY = rowColumnCounts.length - 1;
  let newY = Math.min(y + numBlocks, maxY);
  let newYColumnCount = rowColumnCounts[newY];

  // if we've reached a row without columns, we want to travel downwards again
  if (newYColumnCount === 0) {
    if (newY < maxY) {
      return travelDown(rowColumnCounts, {x, y}, maxColumnCount, numBlocks + 1);
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

function travelLeft(rowColumnCounts, {x, y}, maxColumnCount) {
  // if it's the first in the row, we want to wrap around
  if (x === 0) {
    const {x: newX, y: newY} = travelUp(rowColumnCounts, {x: maxColumnCount, y});
    // if y did not decrease, we must be at the start and this is the left-most
    if (newY >= y) {
      return {x, y};
    }
    return {x: newX, y: newY};
  }

  return {x: x - 1, y};
}

function travelRight(rowColumnCounts, {x, y}, maxColumnCount) {
  // if it's the last in the row, we want to wrap around
  if (x === rowColumnCounts[y] - 1) {
    const {x: newX, y: newY} = travelDown(rowColumnCounts, {x: 0, y}, maxColumnCount);
    // if y did not increase, we must be at the end and this is the right-most
    if (newY <= y) {
      return {x, y};
    }
    return {x: newX, y: newY};
  }

  return {x: x + 1, y};
}

function travelBottom(rowColumnCounts, {x}) {
  const newY = rowColumnCounts.length - 1;
  const newYColumnCount = rowColumnCounts[newY];

  return {
    x: Math.min(newYColumnCount - 1, x),
    y: newY,
  };
}

function travelTop(rowColumnCounts, {x}, maxColumnCount) {
  let newY = 0;
  let newYColumnCount = rowColumnCounts[0];

  if (newYColumnCount === 0) {
    const {y} = travelDown(rowColumnCounts, {x, y: 0}, maxColumnCount);
    newYColumnCount = rowColumnCounts[y];
    newY = y;
  }

  return {
    x: Math.min(newYColumnCount - 1, x),
    y: newY,
  };
}

export default function useGridKeyboardNavigation(
  setKeyPressCallback,
  rowColumnCounts,
  setNavigationMode,
  maxColumnCount
) {
  const [cords, setCords] = useState({x: 0, y: 0});

  const handleKeyPress = useCallback(
    (event) => {
      setNavigationMode(NavigationModeTypes.ARROW_KEYS);

      let newCords = null;

      switch (event.keyCode) {
        case keycodes['8numpad']:
        case keycodes.UpArrow:
          newCords = travelUp(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes['2numpad']:
        case keycodes.DownArrow:
          newCords = travelDown(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes['6numpad']:
        case keycodes.RightArrow:
          newCords = travelRight(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes['4numpad']:
        case keycodes.LeftArrow:
          newCords = travelLeft(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes.End:
          newCords = travelBottom(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes.Home:
          newCords = travelTop(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        default:
          return;
      }

      setCords(newCords);
    },
    [cords, rowColumnCounts]
  );

  useEffect(() => setKeyPressCallback(handleKeyPress), [handleKeyPress]);

  return [cords, setCords];
}
