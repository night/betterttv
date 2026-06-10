import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PageDecendants, PageTypes} from '../../../constants.js';
import UserSettings from '../pages/UserSettings.jsx';
import Changelog from '../pages/Changelog.jsx';
import Settings from '../pages/Settings.jsx';
import styles from './SettingsModal.module.css';
import {CloseButton, Modal} from '@mantine/core';
import {useDisclosure, useFocusTrap, useViewportSize} from '@mantine/hooks';
import {PageScrollContext} from './PageScrollBody.jsx';
import {ScrollbarSizeTargetContext} from '../../../common/components/Scrollbar.jsx';
import HighlightKeywords from '../pages/HighlightKeywords.jsx';
import SideNavigation from './SideNavigation.jsx';
import {PageContext} from '../contexts/PageContext.jsx';
import BlacklistKeywords from '../pages/BlacklistKeywords.jsx';
import {AnimatePresence, motion, usePresenceData} from 'framer-motion';
import formatMessage from '../../../i18n/index.js';

function Page({page, search, onSearchChange, inputRef, handleSettingRefCallback}) {
  switch (page) {
    case PageTypes.CHANGELOG:
      return <Changelog />;
    case PageTypes.HIGHLIGHT_KEYWORDS:
      return <HighlightKeywords />;
    case PageTypes.BLACKLIST_KEYWORDS:
      return <BlacklistKeywords />;
    case PageTypes.SETTINGS:
      return (
        <Settings
          search={search}
          onSearchChange={onSearchChange}
          inputRef={inputRef}
          handleSettingRefCallback={handleSettingRefCallback}
        />
      );
    case PageTypes.USER_SETTINGS:
    default:
      return <UserSettings />;
  }
}

const PageTransitionDirection = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
};

const pageMotionVariants = {
  [PageTransitionDirection.UP]: {
    initial: {opacity: 0, y: -8, filter: 'blur(2px)', transition: {duration: 0.15, ease: [0.75, 0, 1, 1]}},
    exit: {opacity: 0, y: 8, filter: 'blur(2px)', transition: {duration: 0.15, ease: [0, 0, 0.25, 1]}},
  },
  [PageTransitionDirection.DOWN]: {
    initial: {opacity: 0, y: 8, filter: 'blur(2px)', transition: {duration: 0.15, ease: [0.75, 0, 1, 1]}},
    exit: {opacity: 0, y: -8, filter: 'blur(2px)', transition: {duration: 0.15, ease: [0, 0, 0.25, 1]}},
  },
  [PageTransitionDirection.LEFT]: {
    initial: {opacity: 0, x: 8, filter: 'blur(2px)', transition: {duration: 0.15, ease: [0.75, 0, 1, 1]}},
    exit: {opacity: 0, x: -8, filter: 'blur(2px)', transition: {duration: 0.15, ease: [0, 0, 0.25, 1]}},
  },
  [PageTransitionDirection.RIGHT]: {
    initial: {opacity: 0, x: -8, filter: 'blur(2px)', transition: {duration: 0.15, ease: [0.75, 0, 1, 1]}},
    exit: {opacity: 0, x: 8, filter: 'blur(2px)', transition: {duration: 0.15, ease: [0, 0, 0.25, 1]}},
  },
};

function PageTransition({children, className, computeDefaultScrollTop, scrollRef, pendingScrollToSettingPanelId}) {
  const direction = usePresenceData();
  const {initial, exit} = pageMotionVariants[direction];

  useEffect(() => {
    if (scrollRef.current == null) {
      return;
    }

    scrollRef.current.scrollTop = computeDefaultScrollTop();
    pendingScrollToSettingPanelId.current = null;
  }, []);

  return (
    <PageScrollContext.Provider value={scrollRef}>
      <motion.div
        variants={pageMotionVariants}
        initial={initial}
        exit={exit}
        animate={{opacity: 1, filter: 'blur(0px)', x: 0, y: 0}}
        className={className}>
        {children}
      </motion.div>
    </PageScrollContext.Provider>
  );
}

function SettingsModal({setHandleOpen}) {
  const {width} = useViewportSize();
  const [page, setPage] = useState(PageTypes.SETTINGS);
  const [isInteractive, setIsInteractive] = useState(false);
  const [open, modalHandlers] = useDisclosure(false);
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const [search, setSearch] = useState('');
  const settingRefs = useRef({});
  const pendingScrollToSettingPanelId = useRef(null);
  const [pageTransitionDirection, setPageTransitionDirection] = useState(PageTransitionDirection.RIGHT);
  const pageContentRef = useRef(null);
  const pageColumnRef = useRef(null);
  const lastParentData = useRef({scrollTop: 0, page: null});
  const inputRef = useFocusTrap(isInteractive && page === PageTypes.SETTINGS);

  // The page header is sticky inside the scroll container, so scrolling to a setting must
  // offset by the header height to keep the target visible beneath it.
  const getPageHeaderHeight = useCallback(
    () => pageContentRef.current?.querySelector('[data-page-header]')?.offsetHeight ?? 0,
    []
  );

  function handlePageChange(newPage) {
    if (lastParentData.current.page !== newPage) {
      lastParentData.current.scrollTop = 0;
      lastParentData.current.page = null;
    }

    let newDirection = PageTransitionDirection.UP;

    if (page < newPage) {
      newDirection = PageTransitionDirection.DOWN;
    }

    const currentPageDecendants = PageDecendants[page];
    const newPageDecendants = PageDecendants[newPage];

    if (currentPageDecendants != null && currentPageDecendants.includes(newPage)) {
      newDirection = PageTransitionDirection.LEFT;

      lastParentData.current.page = page;
      lastParentData.current.scrollTop = pageContentRef.current.scrollTop;
    }

    if (newPageDecendants != null && newPageDecendants.includes(page)) {
      newDirection = PageTransitionDirection.RIGHT;
    }

    setPageTransitionDirection(newDirection);
    setPage(newPage);
  }

  function handleSettingRefCallback(settingPanelId, ref) {
    settingRefs.current[settingPanelId] = ref;
  }

  function handleGotoSettingPanel(settingPanelId) {
    if (settingPanelId == null) {
      return;
    }

    if (settingPanelId != null && settingRefs.current[settingPanelId] != null) {
      const setting = settingRefs.current[settingPanelId];
      if (pageContentRef.current != null) {
        pageContentRef.current.scrollTop = Math.max(0, setting.offsetTop - getPageHeaderHeight());
      }
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

  const handleInteractive = useCallback(() => {
    setIsInteractive(true);
  }, [setIsInteractive]);

  const handleNonInteractive = useCallback(() => {
    setIsInteractive(false);
  }, [setIsInteractive]);

  const handleSearchChange = useCallback(({target: {value}}) => {
    setSearch(value);
  }, []);

  const computeDefaultScrollTop = useCallback(() => {
    if (
      page === PageTypes.SETTINGS &&
      pendingScrollToSettingPanelId.current != null &&
      settingRefs.current[pendingScrollToSettingPanelId.current] != null
    ) {
      const setting = settingRefs.current[pendingScrollToSettingPanelId.current];
      return Math.max(0, setting.offsetTop - getPageHeaderHeight());
    }

    if (lastParentData.current.page !== page) {
      return 0;
    }

    return lastParentData.current.scrollTop;
  }, [page, getPageHeaderHeight]);

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
      onExitTransitionEnd={handleNonInteractive}
      onEnterTransitionEnd={handleInteractive}
      classNames={{content: styles.modal, body: styles.modalBody}}
      transitionProps={{transition: 'pop', duration: 100}}
      onClose={modalHandlers.close}>
      <PageContext.Provider
        value={{page, setPage: handlePageChange, sidenavOpen, setSidenavOpen, handleGotoSettingPanel}}>
        <SideNavigation open={sidenavOpen} setOpen={setSidenavOpen} />
        <CloseButton
          className={styles.modalCloseButton}
          radius="lg"
          variant="subtle"
          size="md"
          onClick={modalHandlers.close}
          aria-label={formatMessage({defaultMessage: 'Close'})}
        />
        <ScrollbarSizeTargetContext.Provider value={pageColumnRef}>
          <div className={styles.pageColumn} ref={pageColumnRef}>
            <AnimatePresence initial={false} custom={pageTransitionDirection} mode="wait">
              <PageTransition
                scrollRef={pageContentRef}
                key={page}
                pendingScrollToSettingPanelId={pendingScrollToSettingPanelId}
                className={styles.pageContent}
                computeDefaultScrollTop={computeDefaultScrollTop}>
                <Page
                  page={page}
                  search={search}
                  onSearchChange={handleSearchChange}
                  inputRef={inputRef}
                  handleSettingRefCallback={handleSettingRefCallback}
                />
              </PageTransition>
            </AnimatePresence>
            <div className={styles.bottomFade} aria-hidden="true" />
          </div>
        </ScrollbarSizeTargetContext.Provider>
      </PageContext.Provider>
    </Modal>
  );
}

export default SettingsModal;
