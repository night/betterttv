import React, {useContext} from 'react';
import classNames from 'classnames';
import styles from './SettingsModal.module.css';
import Scrollbar from '../../../common/components/Scrollbar.jsx';

export const PageScrollContext = React.createContext(null);

export function PageScrollBody({header, children, className, ...props}) {
  const ref = useContext(PageScrollContext);
  return (
    <div className={classNames(styles.pageScrollBody, className)}>
      {header}
      <Scrollbar ref={ref} className={styles.pageScrollContent} {...props}>
        {children}
      </Scrollbar>
    </div>
  );
}

export default PageScrollBody;
