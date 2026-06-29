import classNames from 'classnames';
import React from 'react';
import Panel from './Panel';
import styles from './SettingGroup.module.css';

function SettingGroup({children, name, rightContent, className, ...restProps}, ref) {
  return (
    <Panel
      ref={ref}
      title={name}
      rightContent={rightContent}
      containerClassName={styles.panelContainer}
      className={classNames(styles.settingGroup, className)}
      {...restProps}>
      {children}
    </Panel>
  );
}

export default React.forwardRef(SettingGroup);
