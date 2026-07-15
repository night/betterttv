import {
  faArrowRight as faPanelLeftClose,
  faScroll,
  faTriangleExclamation,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons';
import {ActionIcon, Avatar, Button, Overlay, useMantineTheme} from '@mantine/core';
import classNames from 'classnames';
import React, {use, useCallback, useEffect, useMemo, useRef} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import ProBadge from '@/common/components/ProBadge';
import Scrollbar from '@/common/components/Scrollbar';
import UsernameEffectText from '@/common/components/UsernameEffectText';
import useCurrentUser from '@/common/hooks/CurrentUser';
import {PageDecendants, PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import {groupSettingsByCategory} from '@/modules/settings/setting-categories';
import {useUnseenSettingPanelIds} from '@/modules/settings/stores/promotion-store';
import SettingStore, {PageSettingPanelIds} from '@/modules/settings/stores/setting-store';
import useSettingsNavigationStore from '@/modules/settings/stores/settings-navigation';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';
import {getCurrentUserProfilePicture} from '@/utils/user';
import AnimatedLogo from './AnimatedLogo';
import clickableStyles from './ClickableContainer.module.css';
import styles from './SideNavigation.module.css';

// Tag the nav buttons so the active one can be found and scrolled into view.
const PANEL_ID_ATTRIBUTE = 'data-panel-id';
const CATEGORY_ID_ATTRIBUTE = 'data-category-id';

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

function NavigationButton({children, onClick, active, label, className, rightSection, buttonProps, variant = 'light'}) {
  const {primaryColor} = useMantineTheme();
  const activeColor = active ? primaryColor : undefined;

  return (
    <Button
      variant={variant}
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
const SettingNavigationButton = React.memo(function SettingNavigationButton({setting, active, hasPromotion, onClick}) {
  const handleClick = useCallback(() => onClick(setting.settingPanelId), [onClick, setting.settingPanelId]);

  return (
    <NavigationButton
      variant="transparent"
      className={styles.settingNavigationButton}
      active={active}
      onClick={handleClick}
      label={setting.name}
      rightSection={hasPromotion ? <span className={styles.promotionDot} /> : undefined}
      buttonProps={{[PANEL_ID_ATTRIBUTE]: setting.settingPanelId}}
    />
  );
});

function UserSettingsNavigationButton({active, onClick}) {
  const currentUser = useCurrentUser();
  const bttvUser = useAuthStore(useShallow((state) => state.user));
  const avatarSrc = bttvUser?.avatar ?? getCurrentUserProfilePicture();
  const {primaryColor} = useMantineTheme();
  const activeColor = active ? primaryColor : undefined;
  return (
    <NavigationButton
      active={active}
      onClick={onClick}
      className={classNames(clickableStyles.clickableContainer, styles.userSettingsNavigationButton)}
      label={
        bttvUser?.displayName != null ? (
          <UsernameEffectText effect={bttvUser.usernameEffect} className={styles.displayName}>
            {bttvUser.displayName}
          </UsernameEffectText>
        ) : (
          <span className={styles.displayName}>
            {currentUser?.displayName ?? formatMessage({defaultMessage: 'User Settings'})}
          </span>
        )
      }
      rightSection={
        bttvUser == null ? (
          <Icon icon={faTriangleExclamation} className={styles.warningIcon} />
        ) : isUserPro(bttvUser) ? (
          <ProBadge />
        ) : null
      }>
      {avatarSrc != null ? (
        <Avatar
          color={activeColor}
          src={avatarSrc}
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
  const isSettingsPage = page === PageTypes.SETTINGS || PageDecendants[PageTypes.SETTINGS]?.includes(page);

  const categorizedGroups = useMemo(() => groupSettingsByCategory(SettingStore.getSupportedSettings()), []);

  const unseenPanelIds = useUnseenSettingPanelIds();

  const resolvedActivePanelId = PageSettingPanelIds[page] ?? activePanelId;

  // Accordion: the open category follows the scroll — whichever category holds the active (in
  // view) panel is expanded and the rest stay collapsed. Clicking a category navigates to its
  // first panel, which in turn makes it the open one, so a re-click never collapses it.
  const openCategoryId = useMemo(() => {
    if (!isSettingsPage || resolvedActivePanelId == null) {
      return null;
    }

    const activeGroup = categorizedGroups.find((group) =>
      group.settings.some((setting) => setting.settingPanelId === resolvedActivePanelId)
    );
    return activeGroup?.id ?? null;
  }, [isSettingsPage, resolvedActivePanelId, categorizedGroups]);

  // Keep the active item scrolled into view within the scrollable settings list. 'nearest' makes it
  // a no-op while the item is already visible, so smooth scrolling only kicks in when the active
  // entry actually moves out of view; scroll-margin (CSS) keeps a gap. A collapsed category's
  // setting buttons aren't mounted, so fall back to its category row.
  useEffect(() => {
    if (!isSettingsPage || resolvedActivePanelId == null) {
      return;
    }

    const button =
      containerRef.current?.querySelector(`[${PANEL_ID_ATTRIBUTE}="${resolvedActivePanelId}"]`) ??
      containerRef.current?.querySelector(`[${CATEGORY_ID_ATTRIBUTE}="${openCategoryId}"]`);
    button?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }, [resolvedActivePanelId, isSettingsPage, openCategoryId]);

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
      <div className={classNames(styles.sidenavContainer, {[styles.open]: open})}>
        <div className={styles.logoContainer}>
          <AnimatedLogo className={styles.logo} />
          <CloseMenuButton onClick={close} className={styles.closeButton} />
        </div>
        <Scrollbar mirrorPadding className={styles.settingsScrollArea} ref={containerRef}>
          {categorizedGroups.map((group) => {
            const isOpen = group.id === openCategoryId;
            // While a category is collapsed its settings' dots are hidden with them, so the category
            // row carries a dot of its own.
            const hasPromotion =
              !isOpen && group.settings.some((setting) => unseenPanelIds.has(setting.settingPanelId));
            return (
              <React.Fragment key={group.id}>
                <NavigationButton
                  className={classNames(clickableStyles.clickableContainer, styles.categoryButton)}
                  active={isOpen}
                  onClick={() => handleGotoSettingPanel(group.settings[0].settingPanelId)}
                  label={group.label}
                  rightSection={hasPromotion ? <span className={styles.promotionDot} /> : undefined}
                  buttonProps={{[CATEGORY_ID_ATTRIBUTE]: group.id}}>
                  <Icon icon={group.icon} className={styles.navigationIcon} />
                </NavigationButton>
                {isOpen ? (
                  <div className={styles.categorySettings}>
                    {group.settings.map((setting) => (
                      <SettingNavigationButton
                        key={setting.settingPanelId}
                        setting={setting}
                        active={isSettingsPage && resolvedActivePanelId === setting.settingPanelId}
                        hasPromotion={unseenPanelIds.has(setting.settingPanelId)}
                        onClick={handleGotoSetting}
                      />
                    ))}
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </Scrollbar>
        <div className={styles.userSettingsContainer}>
          <NavigationButton
            variant="transparent"
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
