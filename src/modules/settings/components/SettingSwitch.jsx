import React from 'react';
import {Switch} from '@mantine/core';
import styles from './SettingSwitch.module.css';
import SettingWrapper from './SettingWrapper.jsx';

function SettingSwitch({name, description, value, onChange, disabled, ...props}) {
  return (
    <SettingWrapper name={name} description={description} reverse {...props}>
      <Switch
        classNames={{body: styles.switchBody}}
        size="xl"
        checked={value}
        onChange={({target}) => onChange(target.checked)}
        disabled={disabled}
      />
    </SettingWrapper>
  );
}

export default SettingSwitch;
