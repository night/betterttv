import React, {useEffect, useState} from 'react';
import Modal from 'rsuite/Modal';
import ThemeProvider from '../../../common/components/ThemeProvider.jsx';
import {PageTypes} from '../../../constants.js';
import {isStandaloneWindow} from '../../../utils/window.js';
import About from '../pages/About.jsx';
import Changelog from '../pages/Changelog.jsx';
import ChannelSettings from '../pages/ChannelSettings.jsx';
import ChatSettings from '../pages/ChatSettings.jsx';
import DirectorySettings from '../pages/DirectorySettings.jsx';
import ChatWindow from './ChatWindow.jsx';
import Sidenav from './Sidenav.jsx';
import styles from './Window.module.css';

function Page(props) {
  const {page, ...restProps} = props;

  switch (page) {
    case PageTypes.CHAT_SETTINGS:
      return <ChatSettings {...restProps} />;
    case PageTypes.DIRECTORY_SETTINGS:
      return <DirectorySettings {...restProps} />;
    case PageTypes.CHANNEL_SETTINGS:
      return <ChannelSettings {...restProps} />;
    case PageTypes.CHANGELOG:
      return <Changelog {...restProps} />;
    case PageTypes.ABOUT:
    default:
      return <About {...restProps} />;
  }
}

function isWindowSmallStandaloneChat() {
  return window.innerWidth < 600 && isStandaloneWindow();
}

function Window({setHandleOpen}) {
  const [page, setPage] = useState(PageTypes.CHAT_SETTINGS);
  const [open, setOpen] = useState(false);
  const [defaultSearchInput, setDefaultSearchInput] = useState('');
  const [isSmallStandaloneChat, setStandaloneChat] = useState(isWindowSmallStandaloneChat());

  useEffect(() => {
    setHandleOpen((isOpen, searchInput) => {
      setOpen(isOpen);
      setDefaultSearchInput(searchInput);
    });

    function checkStandaloneChat() {
      setStandaloneChat(isWindowSmallStandaloneChat());
    }

    window.addEventListener('resize', checkStandaloneChat);

    return () => {
      window.removeEventListener('resize', checkStandaloneChat);
    };
  }, []);

  if (isSmallStandaloneChat) {
    return (
      <ThemeProvider>
        <ChatWindow open={open} onClose={() => setOpen(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Modal open={open} onClose={() => setOpen(false)} className={styles.modal} dialogClassName={styles.modalContent}>
        <Sidenav
          value={page}
          onChange={(value) => {
            if (value == null) {
              return;
            }
            setPage(value);
          }}
        />
        <Page page={page} defaultSearchInput={defaultSearchInput} onClose={() => setOpen(false)} />
      </Modal>
    </ThemeProvider>
  );
}

export default Window;
