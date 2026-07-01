import {faBars} from '@fortawesome/free-solid-svg-icons';
import {ActionIcon, Anchor, Avatar, Breadcrumbs, CloseButton, Title} from '@mantine/core';
import classNames from 'classnames';
import React, {use} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import useAuthStore from '@/stores/auth';
import styles from './PageHeader.module.css';

// The current (last) crumb is the page title; earlier crumbs are dimmed, clickable links.
function Breadcrumb({label, onClick, isCurrent}) {
  if (isCurrent) {
    return <Title order={1}>{label}</Title>;
  }

  return (
    <Anchor component="button" type="button" inherit underline="never" c="dimmed" onClick={onClick}>
      {label}
    </Anchor>
  );
}

// breadcrumbs: array of {label, onClick?}. Falls back to leftContent when not provided.
function HeaderContent({breadcrumbs, leftContent}) {
  if (breadcrumbs != null) {
    return (
      <Breadcrumbs separator="/" classNames={{root: styles.breadcrumbs, separator: styles.breadcrumbSeparator}}>
        {breadcrumbs.map(({label, onClick}, index) => (
          <Breadcrumb key={label} label={label} onClick={onClick} isCurrent={index === breadcrumbs.length - 1} />
        ))}
      </Breadcrumbs>
    );
  }

  if (typeof leftContent === 'string') {
    return <Title order={1}>{leftContent}</Title>;
  }

  return leftContent;
}

const PageHeader = ({className, leftContent, breadcrumbs, style, ref}) => {
  const {setSidenavOpen, closeModal} = use(PageContext);
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
      <HeaderContent breadcrumbs={breadcrumbs} leftContent={leftContent} />
      <CloseButton
        className={styles.closeButton}
        radius="lg"
        variant="subtle"
        size="md"
        onClick={closeModal}
        aria-label={formatMessage({defaultMessage: 'Close'})}
      />
    </div>
  );
};

export default PageHeader;
