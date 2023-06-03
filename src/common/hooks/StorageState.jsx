import {useEffect, useState} from 'react';
import settings from '../../settings.js';

export default function useStorageState(settingId) {
  const [value, setValue] = useState(settings.get(settingId));

  useEffect(() => {
    function callback(newValue) {
      setValue(newValue);
    }

    setValue(settings.get(settingId));

    const cleanup = settings.on(`changed.${settingId}`, callback);
    return () => cleanup();
  }, [settingId]);

  function setSetting(newValue) {
    if (newValue === value) return;
    setValue(newValue);
    settings.set(settingId, newValue);
  }

  return [value, setSetting];
}
