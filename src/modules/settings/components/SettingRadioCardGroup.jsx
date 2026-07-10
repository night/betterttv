import {RadioGroup} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import styles from './SettingRadioCardGroup.module.css';

function SettingRadioCardGroup({value, onChange, capAtFourPerRow = false, children}) {
  return (
    <RadioGroup className={styles.radioGroup} value={value} onChange={onChange}>
      <div className={classNames(styles.radioCards, {[styles.radioCardsCapped]: capAtFourPerRow})}>{children}</div>
    </RadioGroup>
  );
}

export default SettingRadioCardGroup;
