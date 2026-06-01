import React from 'react';
import {Checkbox} from '@mantine/core';
import styles from './SettingCheckbox.module.css';
import SettingWrapper from './SettingWrapper.jsx';

function SettingCheckbox({name, description, value, onChange, showProBadge = false, showBetaBadge = false, ...props}) {
  return (
    <SettingWrapper name={name} description={description} showProBadge={showProBadge} showBetaBadge={showBetaBadge}>
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
