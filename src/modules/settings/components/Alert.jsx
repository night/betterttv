import {Text} from '@mantine/core';
import {TriangleAlert} from 'lucide-react';
import React from 'react';
import styles from './Alert.module.css';
import Panel from './Panel';

function Alert({message, description, rightContent}) {
  return (
    <Panel className={styles.alert}>
      <TriangleAlert className={styles.warningIcon} />
      <div className={styles.text}>
        <Text className={styles.message}>{message}</Text>
        {description != null ? <Text className={styles.description}>{description}</Text> : null}
      </div>
      {rightContent != null ? <div className={styles.rightContent}>{rightContent}</div> : null}
    </Panel>
  );
}

export default Alert;
