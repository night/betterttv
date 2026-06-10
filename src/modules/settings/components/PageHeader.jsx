import React, {useContext} from 'react';
import styles from './PageHeader.module.css';
import {ActionIcon, Avatar, Title} from '@mantine/core';
import {PageContext} from '../contexts/PageContext.jsx';
import classNames from 'classnames';
import useAuthStore from '../../../stores/auth.js';
import {useShallow} from 'zustand/react/shallow';
import Icon from '../../../common/components/Icon.jsx';
import {faArrowLeft, faBars} from '../../../common/icons/index.js';
import formatMessage from '../../../i18n/index.js';

const PageHeader = React.forwardRef(({className, leftContent, onBack, style}, ref) => {
  const {setSidenavOpen} = useContext(PageContext);
  const currentUser = useAuthStore(useShallow((state) => state.user));
  return (
    <div ref={ref} data-page-header className={classNames(styles.header, className)} style={style}>
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
      {onBack != null ? (
        <ActionIcon
          radius="lg"
          size="lg"
          variant="subtle"
          color="gray"
          className={styles.backIcon}
          onClick={onBack}
          aria-label={formatMessage({defaultMessage: 'Back to Settings'})}>
          <Icon className={styles.backButtonIcon} icon={faArrowLeft} />
        </ActionIcon>
      ) : null}
      {typeof leftContent === 'string' ? <Title order={1}>{leftContent}</Title> : leftContent}
    </div>
  );
});

export default PageHeader;
