import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PageDecendants, PageTypes} from '../../../constants.js';
import UserSettings from '../pages/UserSettings.jsx';
import Changelog from '../pages/Changelog.jsx';
import Settings from '../pages/Settings.jsx';
import styles from './SettingsModal.module.css';
import {Modal} from '@mantine/core';
import {useDisclosure, useViewportSize} from '@mantine/hooks';
import {PageScrollContext} from './PageScrollBody.jsx';
import {ScrollbarSizeTargetContext} from '../../../common/components/Scrollbar.jsx';
import HighlightKeywords from '../pages/HighlightKeywords.jsx';
import SideNavigation from './SideNavigation.jsx';
import {PageContext} from '../contexts/PageContext.jsx';
import BlacklistKeywords from '../pages/BlacklistKeywords.jsx';

function Page({page, handleSettingRefCallback}) {
  switch (page) {
    case PageTypes.CHANGELOG:
      return <Changelog />;
    case PageTypes.HIGHLIGHT_KEYWORDS:
      return <HighlightKeywords />;
    case PageTypes.BLACKLIST_KEYWORDS:
      return <BlacklistKeywords />;
    case PageTypes.SETTINGS:
      return <Settings handleSettingRefCallback={handleSettingRefCallback} />;
    case PageTypes.USER_SETTINGS:
    default:
      return <UserSettings />;
  }
}

function PageContainer({children, className, scrollRef, onMount}) {
  useEffect(() => {
    onMount();
  }, []);

  return (
    <PageScrollContext.Provider value={scrollRef}>
      <div className={className}>{children}</div>
    </PageScrollContext.Provider>
  );
}

function SettingsModal({setHandleOpen}) {
  const {width} = useViewportSize();
  const [page, setPage] = useState(PageTypes.SETTINGS);
  const [open, modalHandlers] = useDisclosure(false);
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const settingRefs = useRef({});
  const pendingScrollToSettingPanelId = useRef(null);
  const pageContentRef = useRef(null);
  const pageColumnRef = useRef(null);
  const lastParentData = useRef({scrollTop: 0, page: null});

  // Panel scroll targets use scroll-margin on the panels; scrolling is just scrollIntoView.
  const scrollToPanel = useCallback((settingPanelId) => {
    settingRefs.current[settingPanelId]?.scrollIntoView({block: 'start'});
  }, []);

  function handlePageChange(newPage) {
    if (lastParentData.current.page !== newPage) {
      lastParentData.current.scrollTop = 0;
      lastParentData.current.page = null;
    }

    const currentPageDecendants = PageDecendants[page];

    // When navigating into a descendant page, remember the parent's scroll position
    // so it can be restored when returning.
    if (currentPageDecendants != null && currentPageDecendants.includes(newPage)) {
      lastParentData.current.page = page;
      lastParentData.current.scrollTop = pageContentRef.current.scrollTop;
    }

    setPage(newPage);
  }

  function handleSettingRefCallback(settingPanelId, ref) {
    settingRefs.current[settingPanelId] = ref;
  }

  function handleGotoSettingPanel(settingPanelId) {
    if (settingPanelId == null) {
      return;
    }

    if (settingRefs.current[settingPanelId] != null) {
      scrollToPanel(settingPanelId);
      return;
    }

    handlePageChange(PageTypes.SETTINGS);
    pendingScrollToSettingPanelId.current = settingPanelId;
  }

  useEffect(() => {
    setHandleOpen((isOpen, {scrollToSettingPanelId} = {scrollToSettingPanelId: null}) => {
      isOpen ? modalHandlers.open() : modalHandlers.close();
      handleGotoSettingPanel(scrollToSettingPanelId);
    });
  }, [modalHandlers.open, modalHandlers.close, handleGotoSettingPanel]);

  const stopPropagation = useCallback((event) => {
    event.stopPropagation();
  }, []);

  // Runs when a page mounts: scroll to a pending setting panel, otherwise restore the
  // parent page's scroll position (or start at the top).
  const handlePageMount = useCallback(() => {
    const scroller = pageContentRef.current;
    if (scroller == null) {
      return;
    }

    const pendingPanelId = pendingScrollToSettingPanelId.current;
    pendingScrollToSettingPanelId.current = null;

    if (page === PageTypes.SETTINGS && pendingPanelId != null && settingRefs.current[pendingPanelId] != null) {
      scrollToPanel(pendingPanelId);
      return;
    }

    scroller.scrollTop = lastParentData.current.page === page ? lastParentData.current.scrollTop : 0;
  }, [page, scrollToPanel]);

  return (
    <Modal
      size="xl"
      radius="lg"
      centered
      withinPortal={false}
      fullScreen={width < 800}
      opened={open}
      /* Events like keydown are sometimes prevented by twitch,
      likely because it can't locate the focused element inside the shadow dom.
      To prevent this we stop it from bubbling upstream */
      onKeyDown={stopPropagation}
      /* Same with youtube which will drop scroll events inside standalone window
      that don't originate from the chat container */
      onWheel={stopPropagation}
      onTouchMove={stopPropagation}
      withCloseButton={false}
      classNames={{content: styles.modal, body: styles.modalBody}}
      transitionProps={{transition: 'pop', duration: 100}}
      onClose={modalHandlers.close}>
      <PageContext.Provider
        value={{
          page,
          setPage: handlePageChange,
          sidenavOpen,
          setSidenavOpen,
          handleGotoSettingPanel,
          closeModal: modalHandlers.close,
        }}>
        <SideNavigation open={sidenavOpen} setOpen={setSidenavOpen} />
        <ScrollbarSizeTargetContext.Provider value={pageColumnRef}>
          <div className={styles.pageColumn} ref={pageColumnRef}>
            <PageContainer
              scrollRef={pageContentRef}
              key={page}
              className={styles.pageContent}
              onMount={handlePageMount}>
              <Page page={page} handleSettingRefCallback={handleSettingRefCallback} />
            </PageContainer>
            <div className={styles.bottomFade} aria-hidden="true" />
          </div>
        </ScrollbarSizeTargetContext.Provider>
      </PageContext.Provider>
    </Modal>
  );
}

export default SettingsModal;
