import {faArrowRight as faPanelLeftClose, faChevronDown, faScroll, faUserGear} from '@fortawesome/free-solid-svg-icons';
import {ActionIcon, Avatar, Badge, Button, Collapse, Overlay, useMantineTheme} from '@mantine/core';
import classNames from 'classnames';
import React, {use, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import {PageDecendants, PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import {groupSettingsByCategory} from '@/modules/settings/setting-categories';
import {PROMOTION_SETTING_PANEL_IDS} from '@/modules/settings/stores/promotion-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import useSettingsNavigationStore from '@/modules/settings/stores/settings-navigation';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';
import AnimatedLogo from './AnimatedLogo';
import SettingsSearch from './SettingsSearch';
import styles from './SideNavigation.module.css';

// The category collapse animation scales linearly with the number of items, so every category
// reveals at the same speed and a longer list just takes proportionally longer.
const COLLAPSE_MS_PER_ITEM = 30;

function CloseMenuButton({onClick, className}) {
  return (
    <ActionIcon
      radius="lg"
      variant="subtle"
      size="xl"
      onClick={onClick}
      aria-label={formatMessage({defaultMessage: 'Close'})}
      className={className}>
      <Icon icon={faPanelLeftClose} className={styles.closeButtonIcon} />
    </ActionIcon>
  );
}

function NavigationButton({children, onClick, active, label, className, rightSection, buttonProps}) {
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
      rightSection={rightSection}
      data-active={active}
      {...buttonProps}>
      {label}
    </Button>
  );
}

// Memoized so a scroll-spy active-panel change only re-renders the buttons whose active
// state actually flips, not the entire settings list. setting/onClick are stable references.
const SettingNavigationButton = React.memo(function SettingNavigationButton({setting, active, onClick}) {
  const handleClick = useCallback(() => onClick(setting.settingPanelId), [onClick, setting.settingPanelId]);
  const hasPromotion = PROMOTION_SETTING_PANEL_IDS.has(setting.settingPanelId);

  return (
    <NavigationButton
      className={styles.settingNavigationButton}
      active={active}
      onClick={handleClick}
      label={setting.name}
      rightSection={hasPromotion ? <span className={styles.promotionDot} /> : undefined}
      buttonProps={{'data-panel-id': setting.settingPanelId}}
    />
  );
});

function UserSettingsNavigationButton({active, onClick}) {
  const currentUser = useAuthStore(useShallow((state) => state.user));
  const {primaryColor} = useMantineTheme();
  const activeColor = active ? primaryColor : undefined;
  return (
    <NavigationButton
      active={active}
      onClick={onClick}
      className={styles.userSettingsNavigationButton}
      label={currentUser?.displayName ?? formatMessage({defaultMessage: 'User Settings'})}
      rightSection={
        isUserPro(currentUser) ? (
          <Badge color="indigo" variant="elevated" size="lg">
            {formatMessage({defaultMessage: 'Pro'})}
          </Badge>
        ) : null
      }>
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
  const {page, setPage, handleGotoSettingPanel} = use(PageContext);
  const activePanelId = useSettingsNavigationStore((state) => state.activePanelId);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const containerRef = useRef(null);
  const settings = useMemo(() => SettingStore.getSupportedSettings(), []);
  const isSettingsPage = page === PageTypes.SETTINGS || PageDecendants[PageTypes.SETTINGS]?.includes(page);

  const categorizedGroups = useMemo(() => groupSettingsByCategory(settings), [settings]);

  const resolvedActivePanelId = useMemo(() => {
    if (page === PageTypes.HIGHLIGHT_KEYWORDS) {
      return SettingPanelIds.HIGHLIGHTS;
    }
    if (page === PageTypes.BLACKLIST_KEYWORDS) {
      return SettingPanelIds.BLACKLIST_KEYWORDS;
    }
    return activePanelId;
  }, [page, activePanelId]);

  // Keep the active item scrolled into view within the scrollable settings list. This fires on
  // every scroll-spy update, so the scroll must be instant: a 'smooth' scroll would start a fresh
  // animation each step and the overlapping animations stutter/lag behind the user's scrolling.
  // 'nearest' makes it a no-op while the item is already visible; scroll-margin (CSS) keeps a gap.
  useEffect(() => {
    if (!isSettingsPage || resolvedActivePanelId == null) {
      return;
    }

    const button = containerRef.current?.querySelector(`[data-panel-id="${resolvedActivePanelId}"]`);
    button?.scrollIntoView({block: 'nearest'});
  }, [resolvedActivePanelId, isSettingsPage]);

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

  // Accordion: only one category is open at a time; all start closed. Clicking the open one closes
  // it (leaving none open).
  const [openCategory, setOpenCategory] = useState(null);
  const toggleCategory = useCallback((categoryId) => {
    setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  return (
    <React.Fragment>
      <div className={classNames(styles.sidenavContainer, {[styles.open]: open})}>
        <div className={styles.logoContainer}>
          <AnimatedLogo className={styles.logo} />
          <CloseMenuButton onClick={close} className={styles.closeButton} />
        </div>
        <div className={styles.settingsScrollArea} ref={containerRef}>
          <SettingsSearch onNavigate={close} />
          {categorizedGroups.map((group) => {
            const isCollapsed = openCategory !== group.id;
            const hasActiveChild =
              isSettingsPage && group.settings.some((setting) => setting.settingPanelId === resolvedActivePanelId);
            return (
              <React.Fragment key={group.id}>
                <NavigationButton
                  className={classNames(styles.categoryButton, {[styles.categoryActive]: hasActiveChild})}
                  active={false}
                  onClick={() => toggleCategory(group.id)}
                  label={group.label}
                  rightSection={
                    <Icon
                      icon={faChevronDown}
                      className={classNames(styles.categoryChevron, {
                        [styles.categoryChevronCollapsed]: isCollapsed,
                      })}
                    />
                  }>
                  <Icon icon={group.icon} className={styles.navigationIcon} />
                </NavigationButton>
                <Collapse
                  expanded={!isCollapsed}
                  keepMounted={false}
                  transitionDuration={group.settings.length * COLLAPSE_MS_PER_ITEM}
                  transitionTimingFunction="linear">
                  <div className={styles.categorySettings}>
                    {group.settings.map((setting) => (
                      <SettingNavigationButton
                        key={setting.settingPanelId}
                        setting={setting}
                        active={isSettingsPage && resolvedActivePanelId === setting.settingPanelId}
                        onClick={handleGotoSetting}
                      />
                    ))}
                  </div>
                </Collapse>
              </React.Fragment>
            );
          })}
        </div>
        <div className={styles.userSettingsContainer}>
          <NavigationButton
            className={styles.settingNavigationButton}
            active={page === PageTypes.CHANGELOG}
            onClick={() => handleNavigate(PageTypes.CHANGELOG)}
            label={formatMessage({defaultMessage: 'Changelog'})}>
            <Icon icon={faScroll} className={styles.navigationIcon} />
          </NavigationButton>
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
