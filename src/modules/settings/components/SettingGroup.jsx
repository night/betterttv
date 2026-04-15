import React from 'react';
import styles from './SettingGroup.module.css';
import classNames from 'classnames';
import Panel from './Panel.jsx';

function SettingGroup({children, name, rightContent, className, ...restProps}, ref) {
  return (
    <Panel
      ref={ref}
      title={name}
      rightContent={rightContent}
      className={classNames(styles.settingGroup, className)}
      {...restProps}>
      {children}
    </Panel>
  );
}

export default React.forwardRef(SettingGroup);
