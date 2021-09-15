import React, {useEffect, useState} from 'react';
import Modal from 'rsuite/lib/Modal/index.js';
import Sidenav from './Sidenav.jsx';
import About from '../pages/About.jsx';
import ChatSettings from '../pages/ChatSettings.jsx';
import DirectorySettings from '../pages/DirectorySettings.jsx';
import ChannelSettings from '../pages/ChannelSettings.jsx';
import Changelog from '../pages/Changelog.jsx';
import ChatWindow from './ChatWindow.jsx';
import {PageTypes} from '../../../constants.js';

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
  return window.innerWidth < 600 && window.location.pathname.endsWith('/chat');
}

function Window({setHandleOpen}) {
  const [page, setPage] = useState(PageTypes.CHAT_SETTINGS);
  const [open, setOpen] = useState(false);
  const [isSmallStandaloneChat, setStandaloneChat] = useState(isWindowSmallStandaloneChat());

  useEffect(() => {
    setHandleOpen(setOpen);

    function checkStandaloneChat() {
      setStandaloneChat(isWindowSmallStandaloneChat());
    }

    window.addEventListener('resize', checkStandaloneChat);

    return () => {
      window.removeEventListener('resize', checkStandaloneChat);
    };
  }, []);

  if (isSmallStandaloneChat) {
    return <ChatWindow show={open} onHide={() => setOpen(false)} />;
  }

  return (
    <Modal show={open} onHide={() => setOpen(false)}>
      <Sidenav
        value={page}
        onChange={(value) => {
          if (value == null) {
            return;
          }
          setPage(value);
        }}
      />
      <Page page={page} onHide={() => setOpen(false)} />
    </Modal>
  );
}

export default Window;
