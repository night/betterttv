import React, {useEffect, useRef} from 'react';
import InputGroup from 'rsuite/InputGroup';
import Input from 'rsuite/Input';
import IconButton from 'rsuite/IconButton';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons/faSearch';
import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';

function Header({value, onChange, onHide, selected, ...restProps}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    searchInputRef.current.focus();
  }, []);

  return (
    <div {...restProps}>
      <InputGroup inside>
        <InputGroup.Addon>
          <FontAwesomeIcon icon={faSearch} />
        </InputGroup.Addon>
        <Input
          placeholder={selected == null ? 'Search for Emotes' : selected.code}
          value={value}
          onChange={onChange}
          inputRef={searchInputRef}
        />
      </InputGroup>
      <IconButton icon={<FontAwesomeIcon icon={faTimes} />} appearance="subtle" onClick={onHide} />
    </div>
  );
}

export default React.memo(
  Header,
  (oldProps, newProps) => oldProps.selected === newProps.selected && newProps.value === oldProps.value
);
