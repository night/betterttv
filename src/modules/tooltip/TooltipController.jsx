import React, {useState, useCallback, useEffect, useRef} from 'react';
import Tooltip from './Tooltip.jsx';

export const TOOLTIP_MARKER_ATTRIBUTE = 'data-bttv-tooltip';

function getTooltipElement(target) {
  if (target == null || !(target instanceof Element)) {
    return null;
  }

  return target.hasAttribute(TOOLTIP_MARKER_ATTRIBUTE) ? target : null;
}

export default function TooltipController() {
  const tooltipStateRef = useRef();

  const [tooltipState, setTooltipState] = useState({
    open: false,
    tooltipKey: null,
    content: null,
    className: null,
    alignment: 'center',
    referenceElement: null,
  });

  const handleMouseEnter = useCallback((event) => {
    const element = getTooltipElement(event.target);
    if (element == null) {
      return;
    }

    if (element.contains(event.relatedTarget)) {
      return;
    }

    const config = element.__bttvTooltip;
    if (config == null || config.content == null) {
      return;
    }

    const tooltipKey = element.getAttribute(TOOLTIP_MARKER_ATTRIBUTE);
    if (tooltipKey == null || tooltipKey === '') {
      return;
    }

    const currentTooltipKey = tooltipStateRef.current?.tooltipKey;
    const currentTooltipOpen = tooltipStateRef.current?.open;
    if (currentTooltipKey != null && currentTooltipKey === tooltipKey && currentTooltipOpen) {
      return;
    }

    const newTooltipState = {
      open: true,
      tooltipKey,
      content: config.content,
      className: config.className ?? null,
      alignment: config.alignment ?? 'center',
      referenceElement: element,
    };

    tooltipStateRef.current = newTooltipState;
    setTooltipState(newTooltipState);
  }, []);

  const handleMouseLeave = useCallback((event) => {
    if (getTooltipElement(event.target) == null) {
      return;
    }

    if (tooltipStateRef.current == null || !tooltipStateRef.current.open) {
      return;
    }

    const newTooltipState = {...tooltipStateRef.current, open: false};

    tooltipStateRef.current = newTooltipState;
    setTooltipState(newTooltipState);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return <Tooltip state={tooltipState} />;
}
