import {CheckboxGroup} from '@mantine/core';
import React from 'react';
import {hasFlag, setFlag} from '@/utils/flags';
import SettingGroup from './SettingGroup';

function SettingCheckboxGroup({name, value, onChange, flags, disabled, children, ref}) {
  const groupValue = flags.filter((flag) => hasFlag(value, flag)).map(String);

  function handleChange(stringArray) {
    // a setting's flags can be split across groups, so leave the ones outside this group alone
    onChange(flags.reduce((bits, flag) => setFlag(bits, flag, stringArray.includes(String(flag))), value));
  }

  return (
    <CheckboxGroup value={groupValue} onChange={handleChange} disabled={disabled}>
      <SettingGroup ref={ref} name={name}>
        {children}
      </SettingGroup>
    </CheckboxGroup>
  );
}

export default SettingCheckboxGroup;
