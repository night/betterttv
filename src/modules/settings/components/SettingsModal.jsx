import {Modal} from '@mantine/core';
import {useDisclosure, useViewportSize, useWindowEvent} from '@mantine/hooks';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ScrollbarSizeTargetContext} from '@/common/components/Scrollbar';
import {PageDecendants, PageTypes} from '@/constants';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import BlacklistKeywords from '@/modules/settings/pages/BlacklistKeywords';
import Changelog from '@/modules/settings/pages/Changelog';
import HighlightKeywords from '@/modules/settings/pages/HighlightKeywords';
import ProHome from '@/modules/settings/pages/ProHome';
import SelfBotCommands from '@/modules/settings/pages/SelfBotCommands';
import SelfBotTimers from '@/modules/settings/pages/SelfBotTimers';
import Settings from '@/modules/settings/pages/Settings';
import UserSettings from '@/modules/settings/pages/UserSettings';
import {groupSettingsByCategory} from '@/modules/settings/setting-categories';
import SettingStore, {PageSettingPanelIds} from '@/modules/settings/stores/setting-store';
import {PageScrollContext} from './PageScrollBody';
import styles from './SettingsModal.module.css';
import SideNavigation from './SideNavigation';

function Page({page, category, handleSettingRefCallback}) {
  switch (page) {
    case PageTypes.CHANGELOG:
      return <Changelog />;
    case PageTypes.HIGHLIGHT_KEYWORDS:
      return <HighlightKeywords />;
    case PageTypes.BLACKLIST_KEYWORDS:
      return <BlacklistKeywords />;
    case PageTypes.SELF_BOT_COMMANDS:
      return <SelfBotCommands />;
    case PageTypes.SELF_BOT_TIMERS:
      return <SelfBotTimers />;
    case PageTypes.PRO_HOME:
      return <ProHome />;
    case PageTypes.SETTINGS:
      return <Settings category={category} handleSettingRefCallback={handleSettingRefCallback} />;
    case PageTypes.USER_SETTINGS:
    default:
      return <UserSettings />;
  }
}

function PageContainer({children, className, scrollRef, onMount}) {
  useEffect(() => {
    onMount();
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- runs once on mount to set initial scroll
  }, []);

  return (
    <PageScrollContext value={scrollRef}>
      <div className={className}>{children}</div>
    </PageScrollContext>
  );
}

function flashRow(row) {
  row.addEventListener('animationend', () => row.removeAttribute('data-flash'), {once: true});
  row.setAttribute('data-flash', '');
}

function SettingsModal({setHandleOpen}) {
  const {width} = useViewportSize();
  const [page, setPage] = useState(PageTypes.SETTINGS);
  const [categoryId, setCategoryId] = useState(null);
  const [open, modalHandlers] = useDisclosure(false);
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const settingRefsRef = useRef({});
  const pendingScrollTargetRef = useRef(null);
  const pageContentRef = useRef(null);
  const pageColumnRef = useRef(null);
  const lastParentDataRef = useRef({scrollTop: 0, page: null});

  const categories = useMemo(() => groupSettingsByCategory(SettingStore.getSupportedSettings()), []);
  const activeCategory = categories.find((category) => category.id === categoryId) ?? categories[0];

  // Panel scroll targets use scroll-margin on the panels; scrolling is just scrollIntoView. A named
  // row can sit far down a long panel, so it's centred instead, and flashed to mark it out.
  const scrollToPanel = useCallback((settingPanelId, settingName) => {
    const panel = settingRefsRef.current[settingPanelId];
    const row = settingName != null ? panel?.querySelector(`[data-setting-name="${CSS.escape(settingName)}"]`) : null;

    if (row == null) {
      panel?.scrollIntoView({block: 'start'});
      return;
    }

    row.scrollIntoView({block: 'center'});
    flashRow(row);
  }, []);

  function handlePageChange(newPage) {
    if (lastParentDataRef.current.page !== newPage) {
      lastParentDataRef.current.scrollTop = 0;
      lastParentDataRef.current.page = null;
    }

    const currentPageDecendants = PageDecendants[page];
    const parentPanelId = PageSettingPanelIds[newPage];
    const parentCategoryId = SettingStore.settings[parentPanelId]?.settingCategoryId;

    // When navigating into a descendant page, remember the parent's scroll position
    // so it can be restored when returning.
    if (currentPageDecendants != null && currentPageDecendants.includes(newPage)) {
      lastParentDataRef.current.page = page;
      // search can come in from another category, whose scroll position means nothing on the way back
      lastParentDataRef.current.scrollTop =
        parentCategoryId === activeCategory.id ? pageContentRef.current.scrollTop : 0;
    }

    // a descendant page belongs to a setting, so its category stays active and back returns there
    if (parentPanelId != null) {
      setCategoryId(parentCategoryId ?? null);
    }

    setPage(newPage);
  }

  function handleGotoCategory(newCategoryId) {
    lastParentDataRef.current = {scrollTop: 0, page: null};
    setCategoryId(newCategoryId);
    setPage(PageTypes.SETTINGS);
  }

  const handleSettingRefCallback = useCallback((settingPanelId, ref) => {
    settingRefsRef.current[settingPanelId] = ref;
  }, []);

  function handleGotoSettingPanel(settingPanelId, settingName) {
    if (settingPanelId == null) {
      return;
    }

    if (settingRefsRef.current[settingPanelId] != null) {
      scrollToPanel(settingPanelId, settingName);
      return;
    }

    handleGotoCategory(SettingStore.settings[settingPanelId]?.settingCategoryId ?? null);
    pendingScrollTargetRef.current = {settingPanelId, settingName};
  }

  useEffect(() => {
    setHandleOpen((isOpen, {scrollToSettingPanelId = null, page: openToPage = null} = {}) => {
      if (isOpen) {
        modalHandlers.open();
      } else {
        modalHandlers.close();
      }
      if (openToPage != null) {
        handlePageChange(openToPage);
        return;
      }
      handleGotoSettingPanel(scrollToSettingPanelId);
    });
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- modalHandlers/setHandleOpen are stable
  }, [modalHandlers.open, modalHandlers.close, handleGotoSettingPanel]);

  const stopPropagation = useCallback((event) => {
    event.stopPropagation();
  }, []);

  // Mantine's own Escape listener runs on window, before a menu open in the modal can claim the key
  const closeModal = modalHandlers.close;
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    },
    [closeModal]
  );
  // keys pressed inside stop at the shadow root, so this only sees focus that's left the modal
  useWindowEvent('keydown', handleKeyDown);

  // Runs when a page mounts: scroll to a pending setting panel, otherwise restore the
  // parent page's scroll position (or start at the top).
  const handlePageMount = useCallback(() => {
    const scroller = pageContentRef.current;
    if (scroller == null) {
      return;
    }

    const pendingTarget = pendingScrollTargetRef.current;
    pendingScrollTargetRef.current = null;

    if (
      page === PageTypes.SETTINGS &&
      pendingTarget != null &&
      settingRefsRef.current[pendingTarget.settingPanelId] != null
    ) {
      scrollToPanel(pendingTarget.settingPanelId, pendingTarget.settingName);
      return;
    }

    scroller.scrollTop = lastParentDataRef.current.page === page ? lastParentDataRef.current.scrollTop : 0;
  }, [page, scrollToPanel]);

  return (
    <Modal
      size="xl"
      // 18px on twitch's 10px root (Mantine reads px against 16px), parallel to the 10px corners 8px inside
      radius="1.8rem"
      centered
      withinPortal={false}
      fullScreen={width < 800}
      opened={open}
      closeOnEscape={false}
      onKeyDown={handleKeyDown}
      /* youtube will drop scroll events inside standalone window
      that don't originate from the chat container */
      onWheel={stopPropagation}
      onTouchMove={stopPropagation}
      withCloseButton={false}
      classNames={{content: styles.modal, body: styles.modalBody}}
      transitionProps={{transition: 'pop', duration: 100}}
      onClose={modalHandlers.close}>
      <PageContext
        value={{
          page,
          setPage: handlePageChange,
          sidenavOpen,
          setSidenavOpen,
          categories,
          activeCategory,
          handleGotoCategory,
          handleGotoSettingPanel,
          closeModal: modalHandlers.close,
        }}>
        <SideNavigation open={sidenavOpen} setOpen={setSidenavOpen} />
        <ScrollbarSizeTargetContext value={pageColumnRef}>
          <div className={styles.pageColumn} ref={pageColumnRef}>
            <PageContainer
              scrollRef={pageContentRef}
              key={`${page}-${activeCategory.id}`}
              className={styles.pageContent}
              onMount={handlePageMount}>
              <Page page={page} category={activeCategory} handleSettingRefCallback={handleSettingRefCallback} />
            </PageContainer>
          </div>
        </ScrollbarSizeTargetContext>
      </PageContext>
    </Modal>
  );
}

export default SettingsModal;
