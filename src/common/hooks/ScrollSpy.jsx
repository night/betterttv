import {useEffect} from 'react';

// Scroll spy scoped to a scroll container, so it works inside a shadow root where a document-level
// query (e.g. Mantine's useScrollSpy) can't see any elements. Spied elements are discovered on
// mount with `scrollHost.querySelectorAll(selector)`, and `onActive` is called with
// `getValue(element)` for the last element whose top edge has crossed the detection line (the
// host's top edge plus `getOffset()`).
export default function useScrollSpy({scrollHost, selector, getValue, getOffset, onActive}) {
  useEffect(() => {
    const host = scrollHost.current;
    if (host == null) {
      return undefined;
    }

    const elements = Array.from(host.querySelectorAll(selector));

    function computeActive() {
      // The +1 absorbs sub-pixel rounding.
      const line = host.getBoundingClientRect().top + getOffset() + 1;

      // Elements are in document (top-to-bottom) order, so the active one is the last whose top
      // edge has scrolled to or past the detection line; before any cross, the first element.
      let activeElement = elements[0] ?? null;
      for (const element of elements) {
        if (element.getBoundingClientRect().top > line) {
          break;
        }
        activeElement = element;
      }

      onActive(activeElement != null ? getValue(activeElement) : null);
    }

    computeActive();
    host.addEventListener('scroll', computeActive, {passive: true});
    window.addEventListener('resize', computeActive, {passive: true});
    return () => {
      host.removeEventListener('scroll', computeActive);
      window.removeEventListener('resize', computeActive);
    };
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- options are captured once on mount
  }, []);
}
