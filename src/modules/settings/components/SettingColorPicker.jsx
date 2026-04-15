import React from 'react';
import SettingWrapper from './SettingWrapper.jsx';
import ColorPicker from './ColorPicker.jsx';
import styles from './SettingColorPicker.module.css';

function SettingColorPicker({name, description, value, defaultValue, onChange, ...props}) {
  return (
    <SettingWrapper name={name} description={description} {...props}>
      <ColorPicker value={value} defaultValue={defaultValue} onChange={onChange} className={styles.colorPicker} />
    </SettingWrapper>
  );
}

export default SettingColorPicker;
