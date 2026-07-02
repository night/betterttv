import {useEffect, useState} from 'react';

// Scroll spy scoped to a scroll container, so it works inside a shadow root where a document-level
// query (e.g. Mantine's useScrollSpy) can't see any elements. Options are captured once on mount:
// spied elements are discovered with `scrollHost.querySelectorAll(selector)`, and the hook returns
// `getValue(element)` for the last element whose top edge has crossed the detection line (the
// host's top edge plus `offset`, which may be a function for values that change at runtime, e.g.
// a sticky header's height).
export default function useScrollSpy({scrollHost, selector, getValue, offset = 0}) {
  const [activeValue, setActiveValue] = useState(null);

  useEffect(() => {
    const host = scrollHost.current;
    if (host == null) {
      return undefined;
    }

    const entries = Array.from(host.querySelectorAll(selector)).map((node) => ({node, value: getValue(node)}));

    let frame = 0;
    function computeActive() {
      // The +1 absorbs sub-pixel rounding.
      const line = host.getBoundingClientRect().top + (typeof offset === 'function' ? offset() : offset) + 1;

      // Entries are in document (top-to-bottom) order, so the active one is the last whose top
      // edge has scrolled to or past the detection line; before any cross, the first entry.
      let active = entries[0] ?? null;
      for (const entry of entries) {
        if (entry.node.getBoundingClientRect().top <= line) {
          active = entry;
        }
      }

      // eslint-disable-next-line @eslint-react/set-state-in-effect -- initial measurement runs once on mount
      setActiveValue(active?.value ?? null);
    }

    // Coalesce bursts of scroll events into one measurement per frame.
    function handleScroll() {
      if (frame !== 0) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        computeActive();
      });
    }

    computeActive();
    host.addEventListener('scroll', handleScroll, {passive: true});
    window.addEventListener('resize', handleScroll, {passive: true});
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- options are captured once on mount
  }, []);

  return activeValue;
}
