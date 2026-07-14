import {faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';
import {Text} from '@mantine/core';
import React from 'react';
import Icon from '@/common/components/Icon';
import styles from './Alert.module.css';
import Panel from './Panel';

function Alert({message, description, rightContent}) {
  return (
    <Panel className={styles.alert}>
      <Icon icon={faTriangleExclamation} className={styles.warningIcon} />
      <div className={styles.text}>
        <Text className={styles.message}>{message}</Text>
        {description != null ? <Text className={styles.description}>{description}</Text> : null}
      </div>
      {rightContent != null ? <div className={styles.rightContent}>{rightContent}</div> : null}
    </Panel>
  );
}

export default Alert;
