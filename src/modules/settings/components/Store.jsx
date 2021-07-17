import React, {useEffect, useState} from 'react';
import settings from '../../../settings.js';

export const Components = [];

export function registerComponent(Component, metadata) {
  Components[metadata.settingId] = {
    ...metadata,
    render: (...props) => <Component {...props} key={metadata.settingId} />,
  };
}

export function useStorageState(settingId) {
  const [value, setValue] = useState(settings.get(settingId));

  useEffect(() => {
    function callback(newValue) {
      setValue(newValue);
    }

    settings.on(`changed.${settingId}`, callback);

    return () => {
      settings.off(`changed.${settingId}`, callback);
    };
  }, []);

  function setSetting(newValue) {
    if (newValue === value) return;
    setValue(newValue);
    settings.set(settingId, newValue);
  }

  return [value, setSetting];
}
