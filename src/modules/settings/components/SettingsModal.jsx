import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {PageDecendants, PageTypes} from '../../../constants.js';
import UserSettings from '../pages/UserSettings.jsx';
import Changelog from '../pages/Changelog.jsx';
import Settings from '../pages/Settings.jsx';
import styles from './SettingsModal.module.css';
import {Modal} from '@mantine/core';
import {useDisclosure, useMergedRef} from '@mantine/hooks';
import HighlightKeywords from '../pages/HighlightKeywords.jsx';
import SideNavigation from './SideNavigation.jsx';
import {PageContext} from '../contexts/PageContext.jsx';
import BlacklistKeywords from '../pages/BlacklistKeywords.jsx';
import classNames from 'classnames';
import scrollbarStyles from '../../../common/styles/Scrollbar.module.css';
import {AnimatePresence, motion, usePresenceData} from 'framer-motion';

function Page({page, ...restProps}) {
  switch (page) {
    case PageTypes.CHANGELOG:
      return <Changelog {...restProps} />;
    case PageTypes.HIGHLIGHT_KEYWORDS:
      return <HighlightKeywords {...restProps} />;
    case PageTypes.BLACKLIST_KEYWORDS:
      return <BlacklistKeywords {...restProps} />;
    case PageTypes.SETTINGS:
      return <Settings {...restProps} />;
    case PageTypes.USER_SETTINGS:
    default:
      return <UserSettings {...restProps} />;
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

const PageTransition = React.forwardRef(({children, className, defaultScrollTop = 0}, ref) => {
  const currentRef = useRef(null);
  const mergedRef = useMergedRef(ref, currentRef);
  const direction = usePresenceData();
  const {initial, exit} = pageMotionVariants[direction];

  useEffect(() => {
    if (currentRef.current == null) {
      return;
    }
    currentRef.current.scrollTop = defaultScrollTop;
  }, []);

  return (
    <motion.div
      ref={mergedRef}
      variants={pageMotionVariants}
      initial={initial}
      exit={exit}
      animate={{opacity: 1, filter: 'blur(0px)', x: 0, y: 0}}
      className={className}>
      {children}
    </motion.div>
  );
});

function SettingsModal({setHandleOpen}) {
  const [page, setPage] = useState(PageTypes.SETTINGS);
  const [isInteractive, setIsInteractive] = useState(false);
  const [open, modalHandlers] = useDisclosure(false);
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const settingRefs = useRef({});
  const pendingScrollToSettingPanelId = useRef(null);
  const [pageTransitionDirection, setPageTransitionDirection] = useState(PageTransitionDirection.RIGHT);
  const pageData = useRef({});
  const pageContentRef = useRef(null);

  const parentLastScrollTopPosition = useRef(0);
  const parentLastPageType = useRef(null);

  function createUpdatePageDataCallback(pageType) {
    return function updatePageData(value) {
      pageData.current[pageType] = {...(pageData.current[pageType] ?? {}), ...value};
    };
  }

  function handlePageChange(newPage) {
    let newDirection = PageTransitionDirection.UP;

    if (page < newPage) {
      newDirection = PageTransitionDirection.DOWN;
    }

    const currentPageDecendants = PageDecendants[page];
    const newPageDecendants = PageDecendants[newPage];

    if (currentPageDecendants != null && currentPageDecendants.includes(newPage)) {
      newDirection = PageTransitionDirection.LEFT;
      parentLastScrollTopPosition.current = pageContentRef.current.scrollTop;
      parentLastPageType.current = page;
    }

    if (newPageDecendants != null && newPageDecendants.includes(page)) {
      newDirection = PageTransitionDirection.RIGHT;
    }

    setPageTransitionDirection(newDirection);
    setPage(newPage);
  }

  function scrollToPendingSettingPanel() {
    if (page !== PageTypes.SETTINGS) {
      return;
    }

    const setting = settingRefs.current[pendingScrollToSettingPanelId.current];

    if (setting == null) {
      return;
    }

    setting.scrollIntoView();
    pendingScrollToSettingPanelId.current = null;
  }

  function handleSettingRefCallback(settingPanelId, ref) {
    settingRefs.current[settingPanelId] = ref;
  }

  function handleGotoSettingPanel(settingPanelId) {
    handlePageChange(PageTypes.SETTINGS);
    pendingScrollToSettingPanelId.current = settingPanelId;
    scrollToPendingSettingPanel();
  }

  useEffect(() => {
    setHandleOpen((isOpen, {scrollToSettingPanelId} = {scrollToSettingPanelId: null}) => {
      pendingScrollToSettingPanelId.current = scrollToSettingPanelId;
      isOpen ? modalHandlers.open() : modalHandlers.close();
    });
  }, [modalHandlers.open, modalHandlers.close]);

  const stopPropagation = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const handleInteractive = useCallback(() => {
    setIsInteractive(true);
    scrollToPendingSettingPanel();
  }, [setIsInteractive]);

  const handleNonInteractive = useCallback(() => {
    setIsInteractive(false);
  }, [setIsInteractive]);

  const defaultScrollTop = useMemo(() => {
    return parentLastPageType.current === page ? parentLastScrollTopPosition.current : 0;
  }, [parentLastPageType.current, page]);

  return (
    <Modal
      keepMounted
      size="xl"
      radius="lg"
      centered
      withinPortal={false}
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
        <AnimatePresence custom={pageTransitionDirection} mode="wait">
          <PageTransition
            ref={pageContentRef}
            key={page}
            className={classNames(styles.pageContent, scrollbarStyles.scroll)}
            defaultScrollTop={defaultScrollTop}>
            <Page
              page={page}
              onClose={modalHandlers.close}
              isInteractive={isInteractive}
              handleSettingRefCallback={handleSettingRefCallback}
              pageData={pageData.current[page]}
              setPageData={createUpdatePageDataCallback(page)}
            />
          </PageTransition>
        </AnimatePresence>
      </PageContext.Provider>
    </Modal>
  );
}

export default SettingsModal;
