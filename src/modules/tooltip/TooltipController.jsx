import {arrow, autoUpdate, flip, FloatingArrow, offset, shift, useFloating} from '@floating-ui/react';
import classNames from 'classnames';
import React, {useLayoutEffect, useRef} from 'react';
import useTooltipStore, {closeTooltip, resetTooltip} from './store';
import styles from './Tooltip.module.css';

const VIEWPORT_PADDING = 8;
const ARROW_PADDING = 4;
const ARROW_WIDTH = 12;
const ARROW_HEIGHT = 6;

function whileElementsMounted(reference, floating, update) {
  return autoUpdate(reference, floating, () => {
    if (!reference.isConnected) {
      closeTooltip(reference);
      return;
    }
    update();
  });
}

export default function TooltipController() {
  const arrowRef = useRef(null);
  const {open, content, className, alignment, referenceElement, tooltipKey} = useTooltipStore();

  useLayoutEffect(() => {
    resetTooltip();
  }, []);

  const {refs, floatingStyles, context} = useFloating({
    open,
    placement: alignment == null || alignment === 'center' ? 'top' : `top-${alignment}`,
    strategy: 'fixed',
    elements: {reference: referenceElement},
    whileElementsMounted,
    middleware: [
      offset({mainAxis: ARROW_HEIGHT + ARROW_PADDING}),
      flip({padding: VIEWPORT_PADDING}),
      shift({padding: VIEWPORT_PADDING}),
      arrow({element: arrowRef, padding: ARROW_PADDING}),
    ],
  });

  if (!open) {
    return null;
  }

  return (
    <div ref={refs.setFloating} className={classNames(styles.tooltip, className)} style={floatingStyles}>
      <React.Fragment key={tooltipKey}>{content}</React.Fragment>
      <FloatingArrow
        ref={arrowRef}
        context={context}
        className={styles.arrow}
        width={ARROW_WIDTH}
        height={ARROW_HEIGHT}
        fill="var(--tooltip-bg)"
      />
    </div>
  );
}
