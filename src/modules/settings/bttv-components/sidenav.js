import React from 'react';
import Sidenav from 'rsuite/lib/Sidenav/index.js';
import Nav from 'rsuite/lib/Nav/index.js';
import Icon from 'rsuite/lib/Icon/index.js';

import home from '../../../assets/icons/home-solid.svg';
import box from '../../../assets/icons/box-solid.svg';
import cog from '../../../assets/icons/cog-solid.svg';
import comment from '../../../assets/icons/comment-solid.svg';
import flask from '../../../assets/icons/flask-solid.svg';
import dashboard from '../../../assets/icons/columns-solid.svg';
import discord from '../../../assets/icons/social/discord.svg';
import twitter from '../../../assets/icons/social/twitter.svg';

function BTTVSidenav({page, setPage}) {
  return (
    <div className="bttv-sidenav">
      <Sidenav
        activeKey={page}
        onSelect={(newPage) => {
          if (['4', '6', '7'].includes(newPage)) return;
          setPage(newPage || page);
        }}
        expanded={false}>
        <Sidenav.Body>
          <Nav>
            <Nav.Item eventKey="0" icon={<Icon icon={home} />}>
              <p>BetterTTV</p>
            </Nav.Item>
            <Nav.Item eventKey="1" icon={<Icon icon={cog} />}>
              <p>Interface Settings</p>
            </Nav.Item>
            <Nav.Item eventKey="2" icon={<Icon icon={comment} />}>
              <p>Chat Settings</p>
            </Nav.Item>
            <Nav.Item eventKey="3" icon={<Icon icon={flask} />}>
              <p>Miscellaneous Settings</p>
            </Nav.Item>
            <Nav.Item
              eventKey="4"
              icon={<Icon icon={dashboard} />}
              onSelect={() => window.open('https://betterttv.com/dashboard/emotes')}>
              <p>Emote Dashboard</p>
            </Nav.Item>
            <Nav.Item eventKey="5" icon={<Icon icon={box} />}>
              <p>Changelog</p>
            </Nav.Item>
            <Nav.Item
              eventKey="6"
              icon={<Icon icon={discord} />}
              onSelect={() => window.open('https://discord.gg/nightdev')}>
              <p>Discord</p>
            </Nav.Item>
            <Nav.Item
              eventKey="7"
              icon={<Icon icon={twitter} />}
              onSelect={() => window.open('https://twitter.com/betterttv')}>
              <p>Twitter</p>
            </Nav.Item>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
}

export default BTTVSidenav;
