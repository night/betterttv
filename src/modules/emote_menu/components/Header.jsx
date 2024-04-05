import * as faSearch from '@fortawesome/free-solid-svg-icons/faSearch';
import * as faTimes from '@fortawesome/free-solid-svg-icons/faTimes';
import {Icon} from '@rsuite/icons';
import React, {useEffect, useRef} from 'react';
import IconButton from 'rsuite/IconButton';
import Input from 'rsuite/Input';
import InputGroup from 'rsuite/InputGroup';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';
import formatMessage from '../../../i18n/index.js';
import styles from './Header.module.css';

function Header({value, onChange, toggleWhisper, selected, ...props}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    const currentSearchInputRef = searchInputRef.current;
    if (currentSearchInputRef == null) {
      return;
    }
    document.activeElement.blur();
    setTimeout(() => currentSearchInputRef.focus(), 1);
  }, []);

  return (
    <div {...props}>
      <InputGroup>
        <InputGroup.Addon className={styles.searchPrefix}>
          <Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faSearch} />
        </InputGroup.Addon>
        <Input
          placeholder={selected == null ? formatMessage({defaultMessage: 'Search for Emotes'}) : selected.code}
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
