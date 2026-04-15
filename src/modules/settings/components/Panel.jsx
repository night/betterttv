import React from 'react';
import styles from './Panel.module.css';
import classNames from 'classnames';
import {Title} from '@mantine/core';

function Panel({title, rightContent, children, className, containerClassName, style, ...restProps}, ref) {
  const hasHeader = title != null || rightContent != null;

  return (
    <div ref={ref} className={classNames(styles.panelContainer, containerClassName)} style={style}>
      {hasHeader ? (
        <div className={styles.panelHeader}>
          {typeof title === 'string' ? <Title order={2}>{title}</Title> : title}
          {rightContent}
        </div>
      ) : null}
      <div className={classNames(styles.panel, className)} {...restProps}>
        {children}
      </div>
    </div>
  );
}

export default React.forwardRef(Panel);
