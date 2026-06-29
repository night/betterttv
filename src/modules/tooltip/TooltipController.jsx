import React, {useState, useEffect} from 'react';
import Tooltip from './Tooltip';

const CLOSED = {
  open: false,
  content: null,
  className: null,
  alignment: 'center',
  referenceElement: null,
};

// The mounted controller registers its setState here so the per-element listeners in
// index.jsx can drive the single shared tooltip without document-level delegation.
let setActive = null;

export function openTooltip(element, config) {
  setActive?.({
    open: true,
    content: config.content,
    className: config.className ?? null,
    alignment: config.alignment ?? 'center',
    referenceElement: element,
  });
}

export function closeTooltip(element) {
  // Only close if this element owns the visible tooltip — guards against a stale leave from a
  // previously-hovered element closing a newer tooltip.
  setActive?.((current) => (current.referenceElement === element ? {...current, open: false} : current));
}

export default function TooltipController() {
  const [state, setState] = useState(CLOSED);

  useEffect(() => {
    setActive = setState;
    return () => {
      setActive = null;
    };
  }, []);

  return <Tooltip state={state} onAutoClose={() => setState((current) => ({...current, open: false}))} />;
}
