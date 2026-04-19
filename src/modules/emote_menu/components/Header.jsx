import React from 'react';
import formatMessage from '../../../i18n/index.js';
import {CloseButton, TextInput} from '@mantine/core';
import styles from './Header.module.css';
import classNames from 'classnames';
import {useFocusTrap} from '@mantine/hooks';

function Header({value, opened, onChange, toggleWhisper, selected, className, ...props}) {
  const focusRef = useFocusTrap(opened);
  return (
    <div className={classNames(styles.header, className)} {...props}>
      <TextInput
        ref={focusRef}
        size="lg"
        placeholder={selected == null ? formatMessage({defaultMessage: 'Search for Emotes'}) : selected.code}
        value={value}
        onChange={({target: {value}}) => onChange(value)}
        radius="md"
        classNames={{input: styles.input, root: styles.root}}
      />
      <CloseButton variant="subtle" className={styles.closeButton} size="lg" onClick={toggleWhisper} />
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
