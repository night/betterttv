import React from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import InputGroup from 'rsuite/lib/InputGroup/index.js';
import Input from 'rsuite/lib/Input/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons/faSearch';
import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';

function Header({value, onChange, onHide, ...restProps}) {
  return (
    <div {...restProps}>
      <InputGroup inside>
        <InputGroup.Addon>
          <Icon>
            <FontAwesomeIcon icon={faSearch} />
          </Icon>
        </InputGroup.Addon>
        <Input placeholder="Search for Emotes" value={value} onChange={onChange} maxLength="20" />
      </InputGroup>
      <IconButton
        icon={
          <Icon>
            <FontAwesomeIcon icon={faTimes} />
          </Icon>
        }
        appearance="subtle"
        onClick={onHide}
      />
    </div>
  );
}

export default React.memo(Header, ({value: a}, {value: b}) => a === b);
