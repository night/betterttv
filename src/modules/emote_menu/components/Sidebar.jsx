import React from 'react';
import Nav from 'rsuite/lib/Nav/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import {faSmile} from '@fortawesome/free-solid-svg-icons/faSmile';

export default function Sidebar({...restProps}) {
  return (
    <div {...restProps}>
      <Nav vertical appearance="subtle">
        <Nav.Item
          key="emojis"
          eventKey="emojis"
          icon={
            <Icon>
              <FontAwesomeIcon icon={faStar} />
            </Icon>
          }
        />
        <Nav.Item
          key="emojis"
          eventKey="emojis"
          icon={
            <Icon>
              <FontAwesomeIcon icon={faSmile} />
            </Icon>
          }
        />
      </Nav>
    </div>
  );
}
