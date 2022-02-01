import {useEffect} from 'react';
import {WindowHeight} from '../../../constants.js';

const ITEM_HEIGHT = 44;

export default function useAutoScroll(section, containerRef, categories) {
  useEffect(() => {
    const currentRef = containerRef.current;
    if (section.eventKey == null || currentRef == null) return;

    const top = currentRef.scrollTop;
    const index = categories.findIndex((category) => category.id === section.eventKey);
    const depth = index * ITEM_HEIGHT;

    let newTop;
    if (depth < top) {
      newTop = depth;
    }
    if (depth + ITEM_HEIGHT > top + WindowHeight) {
      newTop = depth - WindowHeight + ITEM_HEIGHT;
    }
    if (newTop == null) {
      return;
    }

    currentRef.scrollTo({top: newTop, left: 0, behavior: 'smooth'});
  }, [section]);
}
