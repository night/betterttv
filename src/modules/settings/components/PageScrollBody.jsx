import classNames from 'classnames';
import React, {use} from 'react';
import Scrollbar from '@/common/components/Scrollbar';
import styles from './SettingsModal.module.css';

export const PageScrollContext = React.createContext(null);

export function PageScrollBody({header, children, className, ...props}) {
  const ref = use(PageScrollContext);
  return (
    <div className={classNames(styles.pageScrollBody, className)}>
      {header}
      <Scrollbar ref={ref} mirrorPadding className={styles.pageScrollContent} {...props}>
        {children}
      </Scrollbar>
    </div>
  );
}

export default PageScrollBody;
