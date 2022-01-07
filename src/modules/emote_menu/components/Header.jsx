import React, {useEffect, useRef} from 'react';
import {Icon} from '@rsuite/icons';
import InputGroup from 'rsuite/InputGroup';
import Input from 'rsuite/Input';
import IconButton from 'rsuite/IconButton';
import * as faSearch from '@fortawesome/free-solid-svg-icons/faSearch';
import * as faTimes from '@fortawesome/free-solid-svg-icons/faTimes';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';

function Header({value, onChange, toggleWhisper, selected, ...props}) {
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
          <Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faSearch} />
        </InputGroup.Addon>
        <Input
          placeholder={selected == null ? 'Search for Emotes' : selected.code}
          value={value}
          onChange={onChange}
          inputRef={searchInputRef}
        />
      </InputGroup>
      <IconButton
        icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faTimes} />}
        appearance="subtle"
        onClick={toggleWhisper}
      />
    </div>
  );
}

export default React.memo(
  Header,
  (oldProps, newProps) =>
    oldProps.selected === newProps.selected &&
    newProps.value === oldProps.value &&
    newProps.toggleWhisper === oldProps.toggleWhisper
);
