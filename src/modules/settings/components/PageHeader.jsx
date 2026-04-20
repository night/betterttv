import React, {useContext} from 'react';
import styles from './PageHeader.module.css';
import {Burger, CloseButton, Title} from '@mantine/core';
import {PageContext} from '../contexts/PageContext.jsx';
import classNames from 'classnames';

const PageHeader = React.forwardRef(({className, leftContent, onClose}, ref) => {
  const {setSidenavOpen} = useContext(PageContext);
  return (
    <div ref={ref} className={classNames(styles.header, className)}>
      <Burger
        className={styles.sidenavToggleButton}
        radius="lg"
        variant="subtle"
        size="lg"
        onClick={() => setSidenavOpen(true)}
      />
      {typeof leftContent === 'string' ? <Title order={1}>{leftContent}</Title> : leftContent}
      <CloseButton className={styles.closeButton} radius="lg" variant="subtle" size="lg" onClick={onClose} />
    </div>
  );
});

export default PageHeader;
