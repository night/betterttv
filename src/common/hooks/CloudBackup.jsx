import {useEffect, useState} from 'react';
import cloudBackup from '../../modules/cloud_backup';

function useCloudBackupSettings() {
  const [settings, setSettings] = useState(() => cloudBackup.settings);

  useEffect(() => {
    const unlisten = cloudBackup.on('changed', setSettings);
    return () => unlisten();
  }, []);

  function updateBackupSettings(newSettings) {
    cloudBackup.updateBackupSettings(newSettings);
    setSettings(cloudBackup.settings);
  }

  return [settings, updateBackupSettings];
}

export default useCloudBackupSettings;
