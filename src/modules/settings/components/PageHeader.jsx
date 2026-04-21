import React, {useContext} from 'react';
import styles from './PageHeader.module.css';
import {ActionIcon, Avatar, CloseButton, Title} from '@mantine/core';
import {PageContext} from '../contexts/PageContext.jsx';
import classNames from 'classnames';
import useAuthStore from '../../../stores/auth.js';
import {useShallow} from 'zustand/react/shallow';
import Icon from '../../../common/components/Icon.jsx';
import {faBars} from '@fortawesome/free-solid-svg-icons';

const PageHeader = React.forwardRef(({className, leftContent, onClose}, ref) => {
  const {setSidenavOpen} = useContext(PageContext);
  const currentUser = useAuthStore(useShallow((state) => state.user));
  return (
    <div ref={ref} className={classNames(styles.header, className)}>
      <ActionIcon
        className={styles.sidenavToggleButton}
        radius="lg"
        variant="subtle"
        size="lg"
        onClick={() => setSidenavOpen(true)}>
        {currentUser != null ? (
          <Avatar src={currentUser.avatar} size="lg" />
        ) : (
          <Icon className={styles.sidenavToggleButtonIcon} icon={faBars} />
        )}
      </ActionIcon>
      {typeof leftContent === 'string' ? <Title order={1}>{leftContent}</Title> : leftContent}
      <CloseButton className={styles.closeButton} radius="lg" variant="subtle" size="lg" onClick={onClose} />
    </div>
  );
});

export default PageHeader;
