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
    referenceElement: null,
  });

  const show = useCallback(({targetId, targetElement, content, className}) => {
    if (targetElement == null || content == null) {
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
      content,
      className: className ?? null,
      referenceElement: targetElement,
    };

    tooltipStateRef.current = newTooltipState;
    setTooltipState(newTooltipState);
  }, []);

  const hide = useCallback(() => {
    if (tooltipStateRef.current == null || !tooltipStateRef.current.open) {
      return;
    }

    const newTooltipState = {...tooltipStateRef.current, open: false};

    tooltipStateRef.current = newTooltipState;
    setTooltipState(newTooltipState);
  }, []);

  const handleMouseEnter = useCallback(
    (event) => {
      const element = getTooltipElement(event.target);
      if (element == null) {
        return;
      }

      if (element.contains(event.relatedTarget)) {
        return;
      }

      const id = element.getAttribute(TOOLTIP_TARGET_ATTRIBUTE);
      if (id == null) {
        return;
      }

      const config = getTooltipById(id);
      if (config == null) {
        return;
      }

      show({targetId: id, targetElement: element, content: config.content, className: config.className});
    },
    [getTooltipById, show]
  );

  const handleMouseLeave = useCallback(
    (event) => (getTooltipElement(event.target) != null ? hide() : undefined),
    [hide]
  );

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
