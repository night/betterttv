import React from 'react';
import {RadioGroup} from '@mantine/core';
import SettingGroup from './SettingGroup.jsx';

function SettingRadioGroup({name, value, onChange, disabled, children}, ref) {
  const groupValue = value != null ? String(value) : null;

  function handleChange(stringVal) {
    const num = Number(stringVal);
    onChange(isNaN(num) ? stringVal : num);
  }

  return (
    <RadioGroup value={groupValue} onChange={handleChange} disabled={disabled}>
      <SettingGroup ref={ref} name={name}>
        {children}
      </SettingGroup>
    </RadioGroup>
  );
}

export default React.forwardRef(SettingRadioGroup);
