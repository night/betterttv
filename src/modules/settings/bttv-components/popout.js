import React, {useEffect, useRef, useState} from 'react';
import Modal from 'rsuite/lib/Modal/index.js';
import Sidenav from './sidenav.js';
import Home from '../pages/home.js';
import Settings from '../pages/settings.js';
import Changelog from '../pages/changelog.js';

function BTTVPopout(props) {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(props.open);

  useEffect(() => {
    setOpen(props.open);
  }, [props]);

  return (
    <Modal
      show={open}
      onHide={() => {
        setOpen(false);
      }}>
      <Modal.Body>
        <Sidenav page={page} setPage={setPage} />
        <div className="bttv-page">{renderPage(page)}</div>
      </Modal.Body>
    </Modal>
  );
}

function renderPage(page) {
  switch (page) {
    case '0':
      return <Home />;
    case '1':
      return <Settings header={'Directory Settings'} category={'ui'} />;
    case '2':
      return <Settings header={'Chat Settings'} category={'chat'} />;
    case '3':
      return <Settings header={'Channel Settings'} category={'misc'} />;
    case '5':
      return <Changelog />;
    default:
      return <Home />;
  }
}

export default BTTVPopout;
