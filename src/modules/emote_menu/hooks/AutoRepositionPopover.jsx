import {useEffect} from 'react';
import useResize from '../../../common/hooks/Resize.jsx';
import repositionPopover from '../../../utils/popover.js';

const TOP_PADDING = 2;

export default function useAutoPositionPopover(localRef, boundingQuerySelector, style, hasTip) {
  function reposition() {
    repositionPopover(localRef, boundingQuerySelector, TOP_PADDING);
  }

  useEffect(() => {
    reposition();
  }, [localRef, style, hasTip]);
  useResize(reposition);
}
