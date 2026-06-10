import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {useShallow} from 'zustand/react/shallow';
import styles from './SideNavigation.module.css';
import AnimatedLogo from './AnimatedLogo.jsx';
import {ActionIcon, Avatar, Button, Overlay, useMantineTheme} from '@mantine/core';
import {faArrowLeft, faUserGear} from '../../../common/icons/index.js';
import {PageTypes} from '../../../constants.js';
import classNames from 'classnames';
import formatMessage from '../../../i18n/index.js';
import {PageContext} from '../contexts/PageContext.jsx';
import useAuthStore from '../../../stores/auth.js';
import Icon from '../../../common/components/Icon.jsx';
import SettingStore from '../stores/SettingStore.jsx';
import useSettingsNavigationStore from '../stores/settings-navigation.js';
import SETTING_ICONS from '../setting-icons.js';

function CloseMenuButton({onClick, className}) {
  return (
    <ActionIcon radius="lg" variant="subtle" size="xl" onClick={onClick} aria-label="Back" className={className}>
      <Icon icon={faArrowLeft} />
    </ActionIcon>
  );
}

function NavigationButton({children, onClick, active, label, className, buttonProps}) {
  const {primaryColor} = useMantineTheme();
  const activeColor = active ? primaryColor : undefined;

  return (
    <Button
      variant="light"
      size="lg"
      radius="lg"
      onClick={onClick}
      color={activeColor}
      className={classNames(styles.navigationButton, className)}
      classNames={{section: styles.navigationSection, label: styles.navigationLabel}}
      leftSection={children}
      data-active={active}
      {...buttonProps}>
      {label}
    </Button>
  );
}

function SettingNavigationButton({setting, active, onClick}) {
  const handleClick = useCallback(() => onClick(setting.settingPanelId), [onClick, setting.settingPanelId]);
  const icon = SETTING_ICONS[setting.settingPanelId];

  return (
    <NavigationButton
      className={styles.settingNavigationButton}
      active={active}
      onClick={handleClick}
      label={setting.name}
      buttonProps={{'data-panel-id': setting.settingPanelId}}>
      {icon != null ? <Icon icon={icon} className={styles.navigationIcon} /> : null}
    </NavigationButton>
  );
}

function UserSettingsNavigationButton({active, onClick}) {
  const currentUser = useAuthStore(useShallow((state) => state.user));
  const {primaryColor} = useMantineTheme();
  const activeColor = active ? primaryColor : undefined;
  return (
    <NavigationButton
      active={active}
      onClick={onClick}
      className={styles.userSettingsNavigationButton}
      label={currentUser?.displayName ?? formatMessage({defaultMessage: 'User Settings'})}>
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
  const {page, setPage, handleGotoSettingPanel} = useContext(PageContext);
  const activePanelId = useSettingsNavigationStore((state) => state.activePanelId);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const userSettingsRef = useRef(null);
  const settings = useMemo(() => SettingStore.getSupportedSettings().sort((a, b) => a.name.localeCompare(b.name)), []);

  const isSettingsPage =
    page === PageTypes.SETTINGS || page === PageTypes.HIGHLIGHT_KEYWORDS || page === PageTypes.BLACKLIST_KEYWORDS;

  // Keep the active item scrolled into view within the nav, between the sticky logo and user settings.
  useEffect(() => {
    if (!isSettingsPage || activePanelId == null) {
      return;
    }

    const container = containerRef.current;
    const button = container?.querySelector(`[data-panel-id="${activePanelId}"]`);
    if (container == null || button == null) {
      return;
    }

    const topInset = logoRef.current?.offsetHeight ?? 0;
    const bottomInset = userSettingsRef.current?.offsetHeight ?? 0;
    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const visibleTop = containerRect.top + topInset;
    const visibleBottom = containerRect.bottom - bottomInset;

    if (buttonRect.top < visibleTop) {
      container.scrollTop -= visibleTop - buttonRect.top;
    } else if (buttonRect.bottom > visibleBottom) {
      container.scrollTop += buttonRect.bottom - visibleBottom;
    }
  }, [activePanelId, isSettingsPage]);

  const handleNavigate = useCallback(
    (nextPage) => {
      setPage(nextPage);
      close();
    },
    [setPage, close]
  );

  const handleGotoSetting = useCallback(
    (settingPanelId) => {
      handleGotoSettingPanel(settingPanelId);
      close();
    },
    [handleGotoSettingPanel, close]
  );

  return (
    <React.Fragment>
      <div className={classNames(styles.sidenavContainer, {[styles.open]: open})} ref={containerRef}>
        <div className={styles.logoContainer} ref={logoRef}>
          <AnimatedLogo className={styles.logo} />
          <CloseMenuButton onClick={close} className={styles.closeButton} />
        </div>
        {settings.map((setting) => (
          <SettingNavigationButton
            key={setting.settingPanelId}
            setting={setting}
            active={isSettingsPage && activePanelId === setting.settingPanelId}
            onClick={handleGotoSetting}
          />
        ))}
        <div className={styles.userSettingsContainer} ref={userSettingsRef}>
          <UserSettingsNavigationButton
            active={page === PageTypes.USER_SETTINGS}
            onClick={() => handleNavigate(PageTypes.USER_SETTINGS)}
          />
        </div>
      </div>
      <Overlay onClick={close} className={classNames(styles.overlay, {[styles.overlayOpen]: open})} />
    </React.Fragment>
  );
}

export default SideNavigation;
