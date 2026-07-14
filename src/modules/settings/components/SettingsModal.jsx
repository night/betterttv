import {Modal} from '@mantine/core';
import {useDisclosure, useViewportSize} from '@mantine/hooks';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ScrollbarSizeTargetContext} from '@/common/components/Scrollbar';
import {openSignInModal} from '@/common/utils/modal';
import {PageDecendants, PageTypes, SettingsPrompts} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import BlacklistKeywords from '@/modules/settings/pages/BlacklistKeywords';
import Changelog from '@/modules/settings/pages/Changelog';
import HighlightKeywords from '@/modules/settings/pages/HighlightKeywords';
import SelfBotCommands from '@/modules/settings/pages/SelfBotCommands';
import Settings from '@/modules/settings/pages/Settings';
import UserSettings from '@/modules/settings/pages/UserSettings';
import useSettingsNavigationStore from '@/modules/settings/stores/settings-navigation';
import storage from '@/storage';
import {getCredentials} from '@/stores/auth';
import {PageScrollContext} from './PageScrollBody';
import styles from './SettingsModal.module.css';
import SideNavigation from './SideNavigation';

// The first time a signed-out user opens settings we nudge them to sign in, but only once ever.
function maybePromptSignIn() {
  // Gate on the persisted access token rather than the async-populated user so we don't burn the
  // one-time flag on a signed-in user whose profile hasn't finished syncing yet.
  if (getCredentials().accessToken != null) {
    return;
  }

  if (storage.get(SettingsPrompts.SIGN_IN) === true) {
    return;
  }

  storage.set(SettingsPrompts.SIGN_IN, true);

  openSignInModal({
    title: formatMessage({defaultMessage: 'Sign in to BetterTTV'}),
    description: formatMessage({defaultMessage: 'Authenticate to unlock more features.'}),
  });
}

function Page({page, handleSettingRefCallback}) {
  switch (page) {
    case PageTypes.CHANGELOG:
      return <Changelog />;
    case PageTypes.HIGHLIGHT_KEYWORDS:
      return <HighlightKeywords />;
    case PageTypes.BLACKLIST_KEYWORDS:
      return <BlacklistKeywords />;
    case PageTypes.SELF_BOT_COMMANDS:
      return <SelfBotCommands />;
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
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- runs once on mount to set initial scroll
  }, []);

  return (
    <PageScrollContext value={scrollRef}>
      <div className={className}>{children}</div>
    </PageScrollContext>
  );
}

function SettingsModal({setHandleOpen}) {
  const {width} = useViewportSize();
  const [page, setPage] = useState(PageTypes.SETTINGS);
  const [open, modalHandlers] = useDisclosure(false);
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const settingRefsRef = useRef({});
  const pendingScrollToSettingPanelIdRef = useRef(null);
  const pageContentRef = useRef(null);
  const pageColumnRef = useRef(null);
  const lastParentDataRef = useRef({scrollTop: 0, page: null});

  const setActivePanelId = useSettingsNavigationStore((state) => state.setActivePanelId);

  // Panel scroll targets use scroll-margin on the panels; scrolling is just scrollIntoView.
  const scrollToPanel = useCallback(
    (settingPanelId) => {
      settingRefsRef.current[settingPanelId]?.scrollIntoView({block: 'start'});
      setActivePanelId(settingPanelId);
    },
    [setActivePanelId]
  );

  function handlePageChange(newPage) {
    if (lastParentDataRef.current.page !== newPage) {
      lastParentDataRef.current.scrollTop = 0;
      lastParentDataRef.current.page = null;
    }

    const currentPageDecendants = PageDecendants[page];

    // When navigating into a descendant page, remember the parent's scroll position
    // so it can be restored when returning.
    if (currentPageDecendants != null && currentPageDecendants.includes(newPage)) {
      lastParentDataRef.current.page = page;
      lastParentDataRef.current.scrollTop = pageContentRef.current.scrollTop;
    }

    setPage(newPage);
  }

  function handleSettingRefCallback(settingPanelId, ref) {
    settingRefsRef.current[settingPanelId] = ref;
  }

  function handleGotoSettingPanel(settingPanelId) {
    if (settingPanelId == null) {
      return;
    }

    if (settingRefsRef.current[settingPanelId] != null) {
      scrollToPanel(settingPanelId);
      return;
    }

    handlePageChange(PageTypes.SETTINGS);
    pendingScrollToSettingPanelIdRef.current = settingPanelId;
  }

  useEffect(() => {
    setHandleOpen((isOpen, {scrollToSettingPanelId} = {scrollToSettingPanelId: null}) => {
      if (isOpen) {
        modalHandlers.open();
        // Nudge signed-out users to sign in the first time they open settings.
        maybePromptSignIn();
      } else {
        modalHandlers.close();
      }
      handleGotoSettingPanel(scrollToSettingPanelId);
    });
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- modalHandlers/setHandleOpen are stable
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

    const pendingPanelId = pendingScrollToSettingPanelIdRef.current;
    pendingScrollToSettingPanelIdRef.current = null;

    if (page === PageTypes.SETTINGS && pendingPanelId != null && settingRefsRef.current[pendingPanelId] != null) {
      scrollToPanel(pendingPanelId);
      return;
    }

    scroller.scrollTop = lastParentDataRef.current.page === page ? lastParentDataRef.current.scrollTop : 0;
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
      <PageContext
        value={{
          page,
          setPage: handlePageChange,
          sidenavOpen,
          setSidenavOpen,
          handleGotoSettingPanel,
          closeModal: modalHandlers.close,
        }}>
        <SideNavigation open={sidenavOpen} setOpen={setSidenavOpen} />
        <ScrollbarSizeTargetContext value={pageColumnRef}>
          <div className={styles.pageColumn} ref={pageColumnRef}>
            <PageContainer
              scrollRef={pageContentRef}
              key={page}
              className={styles.pageContent}
              onMount={handlePageMount}>
              <Page page={page} handleSettingRefCallback={handleSettingRefCallback} />
            </PageContainer>
          </div>
        </ScrollbarSizeTargetContext>
      </PageContext>
    </Modal>
  );
}

export default SettingsModal;
