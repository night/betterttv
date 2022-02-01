import {useEffect, useState} from 'react';
import keyCodes from '../../../utils/keycodes.js';

const DEFAULT_SELECT = 0;

function travelUp(currentSelection, rowCount) {
  const newSelection = currentSelection - 1;

  if (newSelection <= -1) {
    return rowCount - 1;
  }

  return newSelection;
}

function travelDown(currentSelection, rowCount) {
  const newSelection = currentSelection + 1;

  if (newSelection > rowCount - 1) {
    return 0;
  }

  return newSelection;
}

export default function useRowNavigation(setKeyDownCallback, rowCount = 0) {
  const [selected, setSelected] = useState(DEFAULT_SELECT);

  function keydownCallback(event) {
    switch (event.key) {
      case keyCodes.ArrowUp:
        setSelected(travelUp(selected, rowCount));
        break;
      case keyCodes.ArrowDown:
        setSelected(travelDown(selected, rowCount));
        break;
      default:
        break;
    }
  }

  setKeyDownCallback(keydownCallback);
  useEffect(() => setSelected(DEFAULT_SELECT), [rowCount]);

  return [selected, setSelected];
}
