import {useEffect} from 'react';
import useResize from '../../../common/hooks/Resize.jsx';
import repositionPopover from '../../../utils/popover.js';

const TOP_PADDING = 2;

export default function useAutoPositionPopover(localRef, boundingQuerySelector, dependencies) {
  const reposition = () => repositionPopover(localRef, boundingQuerySelector, TOP_PADDING);

  useEffect(reposition, dependencies);
  useResize(reposition);
}
