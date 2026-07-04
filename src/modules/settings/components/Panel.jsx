import {Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import styles from './Panel.module.css';

function Panel({title, rightContent, children, className, containerClassName, style, ref, ...restProps}) {
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

export default Panel;
