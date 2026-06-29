import classNames from 'classnames';
import React, {useContext} from 'react';
import Scrollbar from '@/common/components/Scrollbar';
import styles from './SettingsModal.module.css';

export const PageScrollContext = React.createContext(null);

export function PageScrollBody({children, className, ...props}) {
  const ref = useContext(PageScrollContext);
  return (
    <Scrollbar ref={ref} mirrorPadding className={classNames(styles.pageScrollBody, className)} {...props}>
      {children}
    </Scrollbar>
  );
}

export default PageScrollBody;
