import React from 'react';
import ColorPicker from './ColorPicker';
import styles from './SettingColorPicker.module.css';
import SettingWrapper from './SettingWrapper';

function SettingColorPicker({name, description, value, defaultValue, onChange, ...props}) {
  return (
    <SettingWrapper name={name} description={description} {...props}>
      <ColorPicker value={value} defaultValue={defaultValue} onChange={onChange} className={styles.colorPicker} />
    </SettingWrapper>
  );
}

export default SettingColorPicker;
