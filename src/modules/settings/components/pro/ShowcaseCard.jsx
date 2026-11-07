import {Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import styles from './ShowcaseCard.module.css';

// a perk's art in its pane, with the perk named underneath
function ShowcaseCard({label, className, children}) {
  return (
    <div className={styles.showcaseItem}>
      <div className={classNames(styles.showcaseCard, className)}>{children}</div>
      <Title order={3} className={styles.showcaseLabel}>
        {label}
      </Title>
    </div>
  );
}

export default ShowcaseCard;
