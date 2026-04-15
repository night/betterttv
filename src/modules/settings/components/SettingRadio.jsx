import React from 'react';
import {Radio} from '@mantine/core';
import styles from './SettingRadio.module.css';
import SettingWrapper from './SettingWrapper.jsx';

function SettingRadio({name, description, optionValue, disabled, ...props}) {
  return (
    <SettingWrapper name={name} description={description}>
      <Radio
        {...props}
        value={String(optionValue)}
        classNames={{body: styles.radioBody}}
        size="xl"
        disabled={disabled}
      />
    </SettingWrapper>
  );
}

export default SettingRadio;
