import {arrow, autoUpdate, flip, FloatingArrow, offset, shift, useFloating} from '@floating-ui/react';
import classNames from 'classnames';
import React, {useRef} from 'react';
import styles from './Tooltip.module.css';

const VIEWPORT_PADDING = 8;
const ARROW_PADDING = 4;
const ARROW_WIDTH = 12;
const ARROW_HEIGHT = 6;

function Tooltip({state, onAutoClose}) {
  const arrowRef = useRef(null);

  const {refs, floatingStyles, context} = useFloating({
    open: state.open,
    placement: `top-${state.alignment ?? 'center'}`,
    strategy: 'fixed',
    elements: {reference: state.referenceElement},
    // mouseleave never fires for a node removed while hovered (common in chat). The scroll that
    // removes a chat line also drives this autoUpdate loop, so detect the detached reference and
    // close instead of leaving the tooltip stuck open.
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, () => {
        if (!reference.isConnected) {
          onAutoClose();
          return;
        }
        update();
      }),
    middleware: [
      offset({mainAxis: ARROW_HEIGHT + ARROW_PADDING}),
      flip({padding: VIEWPORT_PADDING}),
      shift({padding: VIEWPORT_PADDING}),
      arrow({element: arrowRef, padding: ARROW_PADDING}),
    ],
  });

  if (!state.open) {
    return null;
  }

  return (
    <div ref={refs.setFloating} className={classNames(styles.tooltip, state.className)} style={floatingStyles}>
      <React.Fragment key={state.tooltipKey}>{state.content}</React.Fragment>
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

export default Tooltip;
