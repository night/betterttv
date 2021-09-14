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

function travelEnd(rowColumnCounts, {x, y}, maxColumnCount) {
  const newY = rowColumnCounts.length - 1;
  const newYColumnCount = rowColumnCounts[newY];

  // if the end has no columns, travel up from the end instead
  if (newYColumnCount === 0) {
    const {x: proposedX, y: proposedY} = travelUp(rowColumnCounts, {x: maxColumnCount, y: newY}, maxColumnCount);
    // if y didn't actually changed, original coords get returned
    if (proposedY >= newY) {
      return {x, y};
    }

    return {
      x: proposedX,
      y: proposedY,
    };
  }

  return {
    x: newYColumnCount - 1,
    y: newY,
  };
}

function travelHome(rowColumnCounts, {x, y}, maxColumnCount) {
  const newY = 0;
  const newYColumnCount = rowColumnCounts[0];

  // if the home has no columns, travel down from the home instead
  if (newYColumnCount === 0) {
    const {x: proposedX, y: proposedY} = travelDown(rowColumnCounts, {x: 0, y: newY}, maxColumnCount);
    // if y didn't actually change, original coords get returned
    if (proposedY <= newY) {
      return {x, y};
    }

    return {
      x: proposedX,
      y: proposedY,
    };
  }

  return {
    x: 0,
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
    (event, shift) => {
      let newCords = null;

      switch (event.keyCode) {
        case keycodes.UpArrow:
          newCords = travelUp(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes.DownArrow:
          newCords = travelDown(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes.RightArrow:
          newCords = travelRight(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes.LeftArrow:
          newCords = travelLeft(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes.End:
          newCords = travelEnd(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes.Home:
          newCords = travelHome(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        case keycodes.Tab:
          newCords = shift
            ? travelLeft(rowColumnCounts, cords, maxColumnCount)
            : travelRight(rowColumnCounts, cords, maxColumnCount);
          event.preventDefault();
          break;
        default:
          return;
      }

      setNavigationMode(NavigationModeTypes.ARROW_KEYS);

      setCords(newCords);
    },
    [cords, rowColumnCounts]
  );

  useEffect(() => setKeyPressCallback(handleKeyPress), [handleKeyPress]);

  return [cords, setCords];
}
