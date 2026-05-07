import React, {useContext} from 'react';
import classNames from 'classnames';
import styles from './SettingsModal.module.css';
import Scrollbar from '../../../common/components/Scrollbar.jsx';

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
