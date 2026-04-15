import React, {useCallback, useContext} from 'react';
import {useShallow} from 'zustand/react/shallow';
import styles from './SideNavigation.module.css';
import AnimatedLogo from './AnimatedLogo.jsx';
import {ActionIcon, Avatar, Button, Overlay, Tooltip, useMantineTheme} from '@mantine/core';
import {faArrowLeft, faCog, faScroll, faUser} from '@fortawesome/free-solid-svg-icons';
import {PageTypes} from '../../../constants.js';
import classNames from 'classnames';
import formatMessage from '../../../i18n/index.js';
import {PageContext} from '../contexts/PageContext.jsx';
import usePortalRef from '../../../common/hooks/PortalRef.jsx';
import useAuthStore from '../../../stores/auth.js';
import Icon from '../../../common/components/Icon.jsx';

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
      <Avatar color={activeColor} src={currentUser?.avatar} size="lg" className={styles.avatar}>
        <Icon icon={faUser} className={styles.avatarFallbackIcon} />
      </Avatar>
    </NavigationButton>
  );
}

function SideNavigation({open, setOpen}) {
  const {page, setPage} = useContext(PageContext);
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
          active={
            page === PageTypes.SETTINGS ||
            page === PageTypes.HIGHLIGHT_KEYWORDS ||
            page === PageTypes.BLACKLIST_KEYWORDS
          }
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
