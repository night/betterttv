import React from 'react';
import {CustomProvider} from 'rsuite';
import {SettingIds} from '../../constants.js';
import useStorageState from '../hooks/StorageState.jsx';

export default function ThemeProvider({children}) {
  const [dark] = useStorageState(SettingIds.DARKENED_MODE);
  return <CustomProvider theme={dark ? 'dark' : 'light'}>{children}</CustomProvider>;
}
