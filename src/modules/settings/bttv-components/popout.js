import React, {useState} from 'react';
import Modal from 'rsuite/lib/Modal/index.js';
import Sidenav from './sidenav.js';
import Home from '../pages/home.js';
import Settings from '../pages/settings.js';
import Changelog from '../pages/changelog.js';

function BTTVPopout({open, setOpen}) {
  const [page, setPage] = useState(1); // current page

  if (page === '-1') {
    setOpen(false);
    setPage(0);
  }

  return (
    <div>
      <Modal show={open} onHide={() => setOpen(false)}>
        <Modal.Body>
          <Sidenav page={page} setPage={setPage} setOpen={setOpen} />
          <div className="bttv-page">{renderPage(page)}</div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

function renderPage(page) {
  switch (page) {
    case '0':
      return <Home />;
    case '1':
      return <Settings header={'UI'} category={'ui'} />;
    case '2':
      return <Settings header={'Chat'} category={'chat'} />;
    case '3':
      return <Settings header={'Miscellaneous'} category={'misc'} />;
    case '5':
      return <Changelog />;
    default:
      return <Home />;
  }
}

export default BTTVPopout;
