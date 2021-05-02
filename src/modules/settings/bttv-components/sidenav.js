import React from 'react';
import Sidenav from 'rsuite/lib/Sidenav/index.js';
import Nav from 'rsuite/lib/Nav/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import cdn from '../../../utils/cdn.js';

import box from '../../../assets/icons/box-solid.svg';
import house from '../../../assets/icons/house-solid.svg';
import comment from '../../../assets/icons/comment-solid.svg';
import compass from '../../../assets/icons/compass-solid.svg';
import dashboard from '../../../assets/icons/columns-solid.svg';
import info from '../../../assets/icons/info-solid.svg';

function BTTVSidenav({page, setPage}) {
  return (
    <div className="bttv-sidenav">
      <Sidenav
        activeKey={page}
        onSelect={(newPage) => {
          if (page === 4) return;
          setPage(newPage || page);
        }}
        expanded={false}>
        <Sidenav.Body>
          <Nav>
            <img
              alt="BetterTTV Mascot"
              src={cdn.url('/assets/logos/mascot.png')}
              style={{width: 56, padding: 10, marginTop: 5, marginBottom: 5}}
            />
            <Nav.Item eventKey={1} icon={<Icon icon={comment} />}>
              <p>Chat Settings</p>
            </Nav.Item>
            <Nav.Item eventKey={2} icon={<Icon icon={compass} />}>
              <p>Directory Settings</p>
            </Nav.Item>
            <Nav.Item eventKey={3} icon={<Icon icon={house} />}>
              <p>Channel Settings</p>
            </Nav.Item>
            <Nav.Item
              eventKey="4"
              icon={<Icon icon={dashboard} />}
              onSelect={() => window.open('https://betterttv.com/dashboard/emotes')}>
              <p>Emote Dashboard</p>
            </Nav.Item>
            <Nav.Item eventKey={5} icon={<Icon icon={box} />}>
              <p>Changelog</p>
            </Nav.Item>
          </Nav>
          <Nav pullRight>
            <Nav.Item eventKey={6} icon={<Icon icon={info} />}>
              <p>About</p>
            </Nav.Item>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
}

export default BTTVSidenav;
