import {faBars} from '@fortawesome/free-solid-svg-icons';
import {ActionIcon, Avatar, CloseButton, Title} from '@mantine/core';
import classNames from 'classnames';
import React, {use} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import useAuthStore from '@/stores/auth';
import styles from './PageHeader.module.css';

const PageHeader = React.forwardRef(({className, leftContent, onClose}, ref) => {
  const {setSidenavOpen} = use(PageContext);
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
      <CloseButton className={styles.closeButton} radius="lg" variant="subtle" size="md" onClick={onClose} />
    </div>
  );
});

export default PageHeader;
