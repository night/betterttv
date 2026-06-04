import React, {useRef} from 'react';
import classNames from 'classnames';
import {arrow, autoUpdate, flip, FloatingArrow, offset, shift, useFloating} from '@floating-ui/react';
import styles from './Tooltip.module.css';

const VIEWPORT_PADDING = 8;
const ARROW_PADDING = 4;
const ARROW_WIDTH = 14;
const ARROW_HEIGHT = 6;

function Tooltip({state}) {
  const arrowRef = useRef(null);

  const {refs, floatingStyles, context} = useFloating({
    open: state.open,
    placement: 'top',
    strategy: 'fixed',
    elements: {reference: state.referenceElement},
    whileElementsMounted: autoUpdate,
    middleware: [
      offset({mainAxis: VIEWPORT_PADDING + ARROW_HEIGHT}),
      flip({padding: VIEWPORT_PADDING}),
      shift({padding: VIEWPORT_PADDING}),
      arrow({element: arrowRef, padding: ARROW_PADDING}),
    ],
  });

  if (!state.open) {
    return null;
  }

  return (
    <div
      ref={refs.setFloating}
      data-bttv-tooltip
      className={classNames(styles.tooltip, state.className)}
      style={floatingStyles}>
      <React.Fragment key={state.targetId}>{state.content}</React.Fragment>
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
