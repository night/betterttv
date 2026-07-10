import {Checkbox} from '@mantine/core';
import React from 'react';
import styles from './SettingCheckbox.module.css';
import SettingWrapper from './SettingWrapper';

function SettingCheckbox({name, description, value, onChange, showProBadge = false, showNewBadge = false, ...props}) {
  return (
    <SettingWrapper name={name} description={description} showProBadge={showProBadge} showNewBadge={showNewBadge}>
      <Checkbox
        {...props}
        value={String(value)}
        onChange={({target}) => onChange?.(target.checked)}
        classNames={{body: styles.checkboxBody}}
        size="xl"
        radius="md"
      />
    </SettingWrapper>
  );
}

export default SettingCheckbox;
