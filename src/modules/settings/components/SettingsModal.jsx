import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PageTypes} from '../../../constants.js';
import UserSettings from '../pages/UserSettings.jsx';
import Changelog from '../pages/Changelog.jsx';
import Settings from '../pages/Settings.jsx';
import styles from './SettingsModal.module.css';
import {Modal} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import HighlightKeywords from '../pages/HighlightKeywords.jsx';
import SideNavigation from './SideNavigation.jsx';
import {PageContext} from '../contexts/PageContext.jsx';
import BlacklistKeywords from '../pages/BlacklistKeywords.jsx';
import {AnimatePresence, motion} from 'framer-motion';

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

function SettingsModal({setHandleOpen}) {
  const [page, setPage] = useState(PageTypes.SETTINGS);
  const [isInteractive, setIsInteractive] = useState(false);
  const [open, modalHandlers] = useDisclosure(false);
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const settingRefs = useRef({});
  const pendingScrollToSettingPanelId = useRef(null);

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
    setPage(PageTypes.SETTINGS);
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
      <PageContext.Provider value={{page, setPage, sidenavOpen, setSidenavOpen, handleGotoSettingPanel}}>
        <SideNavigation open={sidenavOpen} setOpen={setSidenavOpen} />
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className={styles.pageContent}
            onAnimationComplete={scrollToPendingSettingPanel}
            initial={{
              opacity: 0,
              translateY: '4px',
              filter: 'blur(2px)',
              transition: {duration: 0.15, ease: [0.75, 0, 1, 1]},
            }}
            exit={{
              opacity: 0,
              translateY: '-4px',
              filter: 'blur(2px)',
              transition: {duration: 0.15, ease: [0, 0, 0.25, 1]},
            }}
            animate={{opacity: 1, filter: 'blur(0px)', translateY: '0px'}}>
            <Page
              page={page}
              onClose={modalHandlers.close}
              isInteractive={isInteractive}
              handleSettingRefCallback={handleSettingRefCallback}
            />
          </motion.div>
        </AnimatePresence>
      </PageContext.Provider>
    </Modal>
  );
}

export default SettingsModal;
