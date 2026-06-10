import React, {useContext} from 'react';
import classNames from 'classnames';
import styles from './SettingsModal.module.css';
import Scrollbar from '../../../common/components/Scrollbar.jsx';

export const PageScrollContext = React.createContext(null);

export function PageScrollBody({header, children, className, ...props}) {
  const ref = useContext(PageScrollContext);
  return (
    <Scrollbar ref={ref} className={classNames(styles.pageScrollBody, className)} {...props}>
      {header}
      <div className={styles.pageScrollContent}>{children}</div>
    </Scrollbar>
  );
}

export default PageScrollBody;
