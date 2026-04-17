import {useCallback, useLayoutEffect, useRef, useState} from 'react';

/**
 * Tracks element.clientWidth, including when it changes because a vertical scrollbar
 * appears or disappears (border-box size often stays the same, so useElementSize misses it).
 */
export default function useClientWidth() {
  const elementRef = useRef(null);
  const [element, setElement] = useState(null);
  const [width, setWidth] = useState(0);

  const setElementRef = useCallback((el) => {
    elementRef.current = el;
    setElement(el);
  }, []);

  useLayoutEffect(() => {
    if (element == null) {
      setWidth(0);
      return;
    }

    const el = element;

    function measure() {
      setWidth((prev) => {
        const next = el.clientWidth;
        return next === prev ? prev : next;
      });
    }

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el, {box: 'content-box'});

    window.addEventListener('resize', measure);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      vv?.removeEventListener('resize', measure);
    };
  }, [element]);

  return {setElementRef, elementRef, width};
}
