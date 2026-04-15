import {useEffect} from 'react';
import {EMOTE_MENU_SIDEBAR_ROW_HEIGHT} from '../../../constants.js';

export default function useAutoSidebarScroll(section, containerRef, categories, windowHeight) {
  useEffect(() => {
    if (windowHeight === 0) {
      return;
    }

    const currentRef = containerRef.current;
    if (section == null || currentRef == null) {
      return;
    }

    const top = currentRef.scrollTop;
    const index = categories.findIndex((category) => category.id === section);
    const depth = index * EMOTE_MENU_SIDEBAR_ROW_HEIGHT;

    let newTop;
    if (depth < top) {
      newTop = depth;
    }
    if (depth + EMOTE_MENU_SIDEBAR_ROW_HEIGHT > top + windowHeight) {
      newTop = depth - windowHeight + EMOTE_MENU_SIDEBAR_ROW_HEIGHT;
    }
    if (newTop == null) {
      return;
    }

    currentRef.scrollTo({top: newTop, left: 0, behavior: 'smooth'});
  }, [section]);
}
