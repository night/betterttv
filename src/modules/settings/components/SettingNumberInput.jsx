import React from 'react';
import {NumberInput} from '@mantine/core';
import SettingWrapper from './SettingWrapper.jsx';
import styles from './SettingNumberInput.module.css';

function SettingNumberInput({
  name,
  description,
  value,
  onChange,
  min,
  max,
  disabled,
  rightSection,
  placeholder,
  ...props
}) {
  return (
    <SettingWrapper wrap name={name} description={description} reverse {...props}>
      <NumberInput
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={1}
        clampBehavior="blur"
        hideControls
        disabled={disabled}
        radius="lg"
        size="lg"
        inputMode="numeric"
        rightSection={rightSection}
        classNames={{input: styles.input}}
      />
    </SettingWrapper>
  );
}

export default SettingNumberInput;
