import {Loader} from '@mantine/core';
import React from 'react';
import styles from './PageLoader.module.css';

function PageLoader() {
  return (
    <div className={styles.pageLoader}>
      <Loader color="gray" size="lg" />
    </div>
  );
}

export default PageLoader;
