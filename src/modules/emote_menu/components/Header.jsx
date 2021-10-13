import React, {useEffect, useRef} from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import InputGroup from 'rsuite/lib/InputGroup/index.js';
import Input from 'rsuite/lib/Input/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons/faSearch';
import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';

function Header({value, onChange, onHide, selected, ...props}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    const currentSearchInputRef = searchInputRef.current;
    if (currentSearchInputRef == null) {
      return;
    }
    currentSearchInputRef.focus();
  }, []);

  return (
    <div {...props}>
      <InputGroup inside>
        <InputGroup.Addon>
          <Icon>
            <FontAwesomeIcon icon={faSearch} />
          </Icon>
        </InputGroup.Addon>
        <Input
          placeholder={selected == null ? 'Search for Emotes' : selected.code}
          value={value}
          onChange={onChange}
          inputRef={searchInputRef}
        />
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

export default React.memo(
  Header,
  (oldProps, newProps) => oldProps.selected === newProps.selected && newProps.value === oldProps.value
);
