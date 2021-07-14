import React from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';

export default function CloseButton(props) {
  const {onHide, ...restProps} = props;

  return (
    <div {...restProps}>
      <IconButton
        icon={
          <Icon>
            <FontAwesomeIcon icon={faTimes} />
          </Icon>
        }
        onClick={onHide}
        appearance="subtle"
      />
    </div>
  );
}
