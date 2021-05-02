import React, {useEffect, useState} from 'react';
import Modal from 'rsuite/lib/Modal/index.js';
import Sidenav from './sidenav.js';
import About from '../pages/about.js';
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
    case 1:
      return <Settings header={'Chat Settings'} category={'chat'} />;
    case 2:
      return <Settings header={'Directory Settings'} category={'directory'} />;
    case 3:
      return <Settings header={'Channel Settings'} category={'channel'} />;
    case 5:
      return <Changelog />;
    default:
      return <About />;
  }
}

export default BTTVPopout;
