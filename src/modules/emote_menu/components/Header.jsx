import React, {useCallback} from 'react';
import formatMessage from '../../../i18n/index.js';
import {CloseButton, TextInput} from '@mantine/core';
import styles from './Header.module.css';
import classNames from 'classnames';
import LogoIcon from '../../../common/components/LogoIcon.jsx';
import settings from '../../settings/index.js';

function Header({value, opened, onChange, toggleWhisper, selected, className, focusRef, ...props}) {
  const handleLogoClick = useCallback(() => {
    settings.openSettings();
    toggleWhisper();
  }, [toggleWhisper]);

  return (
    <div className={classNames(styles.header, className)} {...props}>
      <button color="primary" variant="subtle" className={styles.logoButton} onClick={handleLogoClick}>
        <LogoIcon className={styles.logoIcon} />
      </button>
      <TextInput
        ref={focusRef}
        size="md"
        placeholder={selected == null ? formatMessage({defaultMessage: 'Search for Emotes'}) : selected.code}
        value={value}
        onChange={({target: {value}}) => onChange(value)}
        radius="md"
        classNames={{input: styles.input, root: styles.root}}
      />
      <CloseButton className={styles.closeButton} size="lg" onClick={toggleWhisper} />
    </div>
  );
}

export default React.memo(
  Header,
  (oldProps, newProps) =>
    oldProps.value === newProps.value &&
    oldProps.selected === newProps.selected &&
    newProps.toggleWhisper === oldProps.toggleWhisper &&
    newProps.opened === oldProps.opened
);
