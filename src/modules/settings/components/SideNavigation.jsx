import {ActionIcon, Avatar, Button, Overlay, useMantineTheme} from '@mantine/core';
import classNames from 'classnames';
import {Flame, PanelLeftClose, TriangleAlert, UserCog} from 'lucide-react';
import React, {use, useCallback} from 'react';
import {useShallow} from 'zustand/react/shallow';
import ProBadge from '@/common/components/ProBadge';
import Scrollbar from '@/common/components/Scrollbar';
import UsernameEffectText from '@/common/components/UsernameEffectText';
import useCurrentUser from '@/common/hooks/CurrentUser';
import {PageDecendants, PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import {useUnseenSettingPanelIds} from '@/modules/settings/stores/promotion-store';
import useAuthStore from '@/stores/auth';
import {useUsernameLook} from '@/stores/username-looks';
import {isUserPro} from '@/utils/pro';
import {getCurrentUserProfilePicture} from '@/utils/user';
import AnimatedLogo from './AnimatedLogo';
import clickableStyles from './ClickableContainer.module.css';
import SettingsSearch from './SettingsSearch';
import styles from './SideNavigation.module.css';

function CloseMenuButton({onClick, className}) {
  return (
    <ActionIcon
      radius="lg"
      variant="subtle"
      size="xl"
      onClick={onClick}
      aria-label={formatMessage({defaultMessage: 'Close'})}
      className={className}>
      <PanelLeftClose className={styles.closeButtonIcon} />
    </ActionIcon>
  );
}

function NavigationButton({children, onClick, active, label, className, rightSection}) {
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
      data-active={active}>
      {label}
    </Button>
  );
}

function CategoryButton({category, active, hasPromotion, onClick}) {
  const handleClick = useCallback(() => onClick(category.id), [onClick, category.id]);

  return (
    <NavigationButton
      className={classNames(clickableStyles.clickableContainer, styles.categoryButton)}
      active={active}
      onClick={handleClick}
      label={category.label}
      rightSection={hasPromotion && !active ? <span className={styles.promotionDot} /> : undefined}>
      <category.icon className={styles.navigationIcon} />
    </NavigationButton>
  );
}

function UserSettingsNavigationButton({active, onClick}) {
  const currentUser = useCurrentUser();
  const bttvUser = useAuthStore(useShallow((state) => state.user));
  const usernameEffect = useUsernameLook('usernameEffect');
  const usernameFont = useUsernameLook('usernameFont');
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
          <UsernameEffectText effect={usernameEffect} font={usernameFont} className={styles.displayName}>
            {bttvUser.displayName}
          </UsernameEffectText>
        ) : (
          <span className={styles.displayName}>
            {currentUser?.displayName ?? formatMessage({defaultMessage: 'User Settings'})}
          </span>
        )
      }
      rightSection={
        bttvUser == null ? <TriangleAlert className={styles.warningIcon} /> : isUserPro(bttvUser) ? <ProBadge /> : null
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
        <UserCog className={styles.navigationIcon} />
      )}
    </NavigationButton>
  );
}

function SideNavigation({open, setOpen}) {
  const {page, setPage, categories, activeCategory, handleGotoCategory} = use(PageContext);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const isSettingsPage = page === PageTypes.SETTINGS || PageDecendants[PageTypes.SETTINGS]?.includes(page);

  const unseenPanelIds = useUnseenSettingPanelIds();

  const handleNavigate = useCallback(
    (nextPage) => {
      setPage(nextPage);
      close();
    },
    [setPage, close]
  );

  const handleCategoryClick = useCallback(
    (categoryId) => {
      handleGotoCategory(categoryId);
      close();
    },
    [handleGotoCategory, close]
  );

  return (
    <React.Fragment>
      <div className={classNames(styles.sidenavContainer, {[styles.open]: open})}>
        <div className={styles.logoContainer}>
          <AnimatedLogo className={styles.logo} />
          <CloseMenuButton onClick={close} className={styles.closeButton} />
        </div>
        <SettingsSearch onAccept={close} />
        <Scrollbar mirrorPadding className={styles.settingsScrollArea}>
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              active={isSettingsPage && category.id === activeCategory.id}
              hasPromotion={category.settings.some((setting) => unseenPanelIds.has(setting.settingPanelId))}
              onClick={handleCategoryClick}
            />
          ))}
        </Scrollbar>
        <div className={styles.userSettingsContainer}>
          <NavigationButton
            className={classNames(clickableStyles.clickableContainer, styles.categoryButton)}
            active={page === PageTypes.PRO_HOME}
            onClick={() => handleNavigate(PageTypes.PRO_HOME)}
            label={formatMessage({defaultMessage: 'BetterTTV Pro'})}>
            <Flame className={styles.navigationIcon} />
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
