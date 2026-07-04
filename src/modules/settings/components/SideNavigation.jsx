import {faArrowLeft, faCog, faScroll, faUser, faUserGear} from '@fortawesome/free-solid-svg-icons';
import {ActionIcon, Avatar, Button, Overlay, Tooltip, useMantineTheme} from '@mantine/core';
import classNames from 'classnames';
import React, {useCallback, use} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import usePortalRef from '@/common/hooks/PortalRef';
import {PageDecendants, PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import useAuthStore from '@/stores/auth';
import AnimatedLogo from './AnimatedLogo';
import styles from './SideNavigation.module.css';

function CloseMenuButton({onClick, className}) {
  return (
    <ActionIcon radius="lg" variant="subtle" size="xl" onClick={onClick} aria-label="Back" className={className}>
      <Icon icon={faArrowLeft} />
    </ActionIcon>
  );
}

function NavigationButton({children, value, setPage, active, label, className, buttonProps, iconButtonProps}) {
  const portalRef = usePortalRef();
  const {primaryColor} = useMantineTheme();
  const activeColor = active ? primaryColor : undefined;

  const onClick = useCallback(() => {
    setPage(value);
  }, [setPage, value]);

  return (
    <React.Fragment>
      <Tooltip
        arrowSize={8}
        radius="md"
        openDelay={200}
        withArrow
        portalProps={{target: portalRef.current}}
        shadow="md"
        label={label}
        classNames={{tooltip: styles.tooltip}}
        position="right"
        hidden={active}
        data-active={active}>
        <ActionIcon
          radius={0}
          size="xl"
          variant="light"
          color={activeColor}
          onClick={onClick}
          className={classNames(styles.navigationIconButton, className)}
          data-active={active}
          {...iconButtonProps}>
          {children}
        </ActionIcon>
      </Tooltip>
      <Button
        variant="light"
        size="lg"
        radius="lg"
        onClick={onClick}
        color={activeColor}
        className={classNames(styles.navigationButton, className)}
        classNames={{section: styles.navigationSection}}
        leftSection={children}
        data-active={active}
        {...buttonProps}>
        {label}
      </Button>
    </React.Fragment>
  );
}

function UserSettingsNavigationButton({active, ...props}) {
  const currentUser = useAuthStore(useShallow((state) => state.user));
  const {primaryColor} = useMantineTheme();
  const activeColor = active ? primaryColor : undefined;
  return (
    <NavigationButton
      active={active}
      value={PageTypes.USER_SETTINGS}
      className={classNames(styles.userSettingsButton)}
      label={currentUser?.displayName ?? formatMessage({defaultMessage: 'User Settings'})}
      {...props}>
      {currentUser != null ? (
        <Avatar
          color={activeColor}
          src={currentUser?.avatar}
          size="md"
          className={styles.avatar}
          classNames={{image: styles.avatarImage}}
        />
      ) : (
        <Icon icon={faUserGear} className={styles.navigationIcon} />
      )}
    </NavigationButton>
  );
}

function SideNavigation({open, setOpen}) {
  const {page, setPage} = use(PageContext);
  const close = useCallback(() => setOpen(false), [setOpen]);

  return (
    <React.Fragment>
      <div className={classNames(styles.sidenavContainer, {[styles.open]: open})}>
        <div className={styles.logoContainer}>
          <AnimatedLogo className={styles.logo} />
          <CloseMenuButton onClick={close} className={styles.closeButton} />
        </div>
        <NavigationButton
          className={styles.topNavigationButton}
          active={page === PageTypes.SETTINGS || PageDecendants[PageTypes.SETTINGS].includes(page)}
          value={PageTypes.SETTINGS}
          setPage={setPage}
          label={formatMessage({defaultMessage: 'Settings'})}>
          <Icon icon={faCog} className={styles.navigationIcon} />
        </NavigationButton>
        <NavigationButton
          className={styles.topNavigationButton}
          active={page === PageTypes.CHANGELOG}
          value={PageTypes.CHANGELOG}
          setPage={setPage}
          label={formatMessage({defaultMessage: 'Changelog'})}>
          <Icon icon={faScroll} className={styles.navigationIcon} />
        </NavigationButton>
        <UserSettingsNavigationButton setPage={setPage} active={page === PageTypes.USER_SETTINGS} />
      </div>
      <Overlay onClick={close} className={classNames(styles.overlay, {[styles.overlayOpen]: open})} />
    </React.Fragment>
  );
}

export default SideNavigation;
