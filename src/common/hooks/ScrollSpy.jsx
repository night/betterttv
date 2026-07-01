import {useCallback, useEffect, useRef, useState} from 'react';

const DEFAULT_SELECTOR = 'h1, h2, h3, h4, h5, h6';

// Accept either a raw element or a React ref object, so callers can pass a ref whose `.current`
// isn't populated until after the first render (e.g. a scroll container from context).
function resolveElement(target) {
  if (target == null) {
    return null;
  }
  return typeof target === 'object' && 'current' in target ? target.current : target;
}

function defaultGetDepth(element) {
  return Number(element.tagName[1]) || 0;
}

function defaultGetValue(element) {
  return element.textContent ?? '';
}

/**
 * Scroll spy that works inside a shadow root.
 *
 * Inspired by Mantine's `useScrollSpy`, but discovers elements with
 * `scrollHost.querySelectorAll(selector)` instead of the global `document.querySelectorAll` that
 * Mantine hard-codes. A document-level query can't reach into a (closed) shadow tree — which is
 * where BetterTTV renders its entire UI — so Mantine's hook finds nothing here. Scoping the query
 * to the scroll container fixes that. `scrollHost` also receives the scroll listener.
 *
 * Returns the same shape as Mantine's hook.
 *
 * @param {object} [options]
 * @param {HTMLElement | {current: HTMLElement | null} | null} [options.scrollHost] Scroll container,
 *   as an element or a ref. Element discovery is scoped to it and it receives the scroll listener.
 *   Falls back to `document`/`window` when omitted (parity with Mantine outside a shadow root).
 * @param {string} [options.selector] Selector for the spied elements. Defaults to `h1`–`h6`.
 * @param {(element: HTMLElement) => number} [options.getDepth] Depth of an element (default: heading level).
 * @param {(element: HTMLElement) => string} [options.getValue] Value of an element (default: `textContent`).
 * @param {number | (() => number)} [options.offset] Distance below the scroll host's top edge that still
 *   counts as "in view" — e.g. a sticky header's height. Pass a function for values that change at runtime.
 * @returns {{
 *   active: number,
 *   data: Array<{depth: number, value: string, getNode: () => HTMLElement}>,
 *   initialized: boolean,
 *   reinitialize: () => void,
 * }}
 */
export default function useScrollSpy({
  scrollHost = null,
  selector = DEFAULT_SELECTOR,
  getDepth = defaultGetDepth,
  getValue = defaultGetValue,
  offset = 0,
} = {}) {
  const [data, setData] = useState([]);
  const [active, setActive] = useState(-1);
  const [initialized, setInitialized] = useState(false);

  // Keep the latest options without re-subscribing the scroll listener on every render.
  const optionsRef = useRef({scrollHost, selector, getDepth, getValue, offset});
  useEffect(() => {
    optionsRef.current = {scrollHost, selector, getDepth, getValue, offset};
  });

  const entriesRef = useRef([]);

  const computeActive = useCallback(() => {
    const {scrollHost: host, offset: rawOffset} = optionsRef.current;
    const hostElement = resolveElement(host);
    const hostTop = hostElement != null ? hostElement.getBoundingClientRect().top : 0;
    const line = hostTop + (typeof rawOffset === 'function' ? rawOffset() : rawOffset);

    const entries = entriesRef.current;
    let next = -1;
    for (let index = 0; index < entries.length; index += 1) {
      const node = entries[index].getNode();
      // Elements are in document (top-to-bottom) order, so the active one is the last whose top
      // edge has scrolled to or past the detection line. The +1 absorbs sub-pixel rounding.
      if (node != null && node.getBoundingClientRect().top <= line + 1) {
        next = index;
      }
    }
    // Nothing has crossed the line yet (scrolled to the very top): highlight the first entry.
    if (next === -1 && entries.length > 0) {
      next = 0;
    }

    setActive(next);
  }, []);

  const reinitialize = useCallback(() => {
    const {scrollHost: host, selector: sel, getDepth: depth, getValue: value} = optionsRef.current;
    const root = resolveElement(host) ?? document;
    const entries = Array.from(root.querySelectorAll(sel)).map((node) => ({
      depth: depth(node),
      value: value(node),
      getNode: () => node,
    }));
    entriesRef.current = entries;
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- syncing DOM scan into state
    setData(entries);
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- syncing DOM scan into state
    setInitialized(true);
    computeActive();
  }, [computeActive]);

  useEffect(() => {
    reinitialize();

    const scrollTarget = resolveElement(optionsRef.current.scrollHost) ?? window;

    let frame = 0;
    const handleScroll = () => {
      // Coalesce bursts of scroll events into one measurement per frame.
      if (frame !== 0) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        computeActive();
      });
    };

    scrollTarget.addEventListener('scroll', handleScroll, {passive: true});
    window.addEventListener('resize', handleScroll, {passive: true});
    return () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- listeners are set up once; call reinitialize() to rescan
  }, []);

  return {active, data, initialized, reinitialize};
}
