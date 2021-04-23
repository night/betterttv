import React from 'react';
import Sidenav from 'rsuite/lib/Sidenav/index.js';
import Nav from 'rsuite/lib/Nav/index.js';
import Icon from 'rsuite/lib/Icon/index.js';

import home from '../../../assets/icons/home-solid.svg';
import box from '../../../assets/icons/box-solid.svg';
import cog from '../../../assets/icons/cog-solid.svg';
import dashboard from '../../../assets/icons/columns-solid.svg';

function BTTVSidenav({page, setPage, setOpen}) {
  return (
    <div className="bttv-sidenav">
      <Sidenav
        activeKey={page}
        onSelect={(newPage) => {
          if (newPage === '3') return;
          setPage(newPage || page);
        }}
        expanded={false}>
        <Sidenav.Body>
          <Nav>
            <Nav.Item eventKey="0" icon={<Icon icon={home} />}>
              <p>BetterTTV</p>
            </Nav.Item>
            <Nav.Item eventKey="1" icon={<Icon icon={cog} />}>
              <p>Settings</p>
            </Nav.Item>
            <Nav.Item eventKey="2" icon={<Icon icon={box} />}>
              <p>Changelog</p>
            </Nav.Item>
            <Nav.Item
              eventKey="3"
              icon={<Icon icon={dashboard} />}
              onSelect={() => window.open('https://betterttv.com/dashboard/emotes')}>
              <p>Dashboard</p>
            </Nav.Item>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
}

export default BTTVSidenav;
