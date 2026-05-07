import React, {forwardRef, useContext, useEffect, useRef} from 'react';
import classNames from 'classnames';
import {useMergedRef} from '@mantine/hooks';
import styles from '../styles/Scrollbar.module.css';

export const ScrollbarSizeTargetContext = React.createContext(null);

export function useScrollbarSize(scrollRef, {mirrorPadding = false, className} = {}) {
  const sizeTargetRef = useContext(ScrollbarSizeTargetContext);

  useEffect(() => {
    const el = scrollRef.current;
    if (el == null) {
      return undefined;
    }

    const update = () => {
      const scrollbarWidth = el.offsetWidth - el.clientWidth;
      const scrollbarHeight = el.offsetHeight - el.clientHeight;
      const widthVar = `${scrollbarWidth}px`;
      const heightVar = `${scrollbarHeight}px`;
      el.style.setProperty('--scrollbar-width', widthVar);
      el.style.setProperty('--scrollbar-height', heightVar);
      const target = sizeTargetRef?.current;
      if (target != null) {
        target.style.setProperty('--scrollbar-width', widthVar);
        target.style.setProperty('--scrollbar-height', heightVar);
      }

      if (mirrorPadding) {
        // Clear our overrides first so getComputedStyle reflects the value coming from CSS classes.
        el.style.paddingRight = '';
        el.style.paddingBottom = '';
        const computed = getComputedStyle(el);
        const paddingLeft = parseFloat(computed.paddingLeft) || 0;
        const paddingTop = parseFloat(computed.paddingTop) || 0;
        el.style.paddingRight = `${Math.max(0, paddingLeft - scrollbarWidth)}px`;
        el.style.paddingBottom = `${Math.max(0, paddingTop - scrollbarHeight)}px`;
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (mirrorPadding) {
        el.style.paddingRight = '';
        el.style.paddingBottom = '';
      }
    };
  }, [scrollRef, sizeTargetRef, mirrorPadding, className]);
}

export const Scrollbar = forwardRef(({children, className, mirrorPadding = false, ...props}, ref) => {
  const innerRef = useRef(null);
  const mergedRef = useMergedRef(ref, innerRef);
  useScrollbarSize(innerRef, {mirrorPadding, className});

  return (
    <div ref={mergedRef} className={classNames(styles.scroll, className)} {...props}>
      {children}
    </div>
  );
});

export default Scrollbar;
