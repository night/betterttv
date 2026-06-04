import React, {useState, useCallback, useEffect, useRef} from 'react';
import Tooltip from './Tooltip.jsx';

export const TOOLTIP_TARGET_ATTRIBUTE = 'data-bttv-tooltip-id';

function getTooltipElement(target) {
  if (target == null || !(target instanceof Element)) {
    return null;
  }

  return target.hasAttribute(TOOLTIP_TARGET_ATTRIBUTE) ? target : null;
}

export default function TooltipController({getTooltipById}) {
  const tooltipStateRef = useRef();

  const [tooltipState, setTooltipState] = useState({
    open: false,
    targetId: null,
    content: null,
    className: null,
    alignment: 'center',
    referenceElement: null,
  });

  const handleMouseEnter = useCallback(
    (event) => {
      const element = getTooltipElement(event.target);
      if (element == null) {
        return;
      }

      if (element.contains(event.relatedTarget)) {
        return;
      }

      const targetId = element.getAttribute(TOOLTIP_TARGET_ATTRIBUTE);
      if (targetId == null) {
        return;
      }

      const config = getTooltipById(targetId);
      if (config == null || config.content == null) {
        return;
      }

      const currentTooltipId = tooltipStateRef.current?.targetId;
      const currentTooltipOpen = tooltipStateRef.current?.open;
      if (currentTooltipId != null && currentTooltipId === targetId && currentTooltipOpen) {
        return;
      }

      const newTooltipState = {
        open: true,
        targetId,
        content: config.content,
        className: config.className ?? null,
        alignment: config.alignment ?? 'center',
        referenceElement: element,
      };

      tooltipStateRef.current = newTooltipState;
      setTooltipState(newTooltipState);
    },
    [getTooltipById]
  );

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
