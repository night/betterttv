import React from 'react';
import {CheckboxGroup} from '@mantine/core';
import {hasFlag} from '../../../utils/flags.js';
import SettingGroup from './SettingGroup.jsx';

function SettingCheckboxGroup({name, value, onChange, flags, disabled, children}, ref) {
  const groupValue = flags.filter((flag) => hasFlag(value, flag)).map(String);

  function handleChange(stringArray) {
    const newBitmask = stringArray.map(Number).reduce((a, b) => a | b, 0);
    onChange(newBitmask);
  }

  return (
    <CheckboxGroup value={groupValue} onChange={handleChange} disabled={disabled}>
      <SettingGroup ref={ref} name={name}>
        {children}
      </SettingGroup>
    </CheckboxGroup>
  );
}

export default React.forwardRef(SettingCheckboxGroup);
