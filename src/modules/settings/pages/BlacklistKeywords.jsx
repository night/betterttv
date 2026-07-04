import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import SettingKeywords from '@/modules/settings/components/SettingKeywords';

function BlacklistKeywords() {
  const [value, setValue] = useStorageState(SettingIds.BLACKLIST_KEYWORDS);

  return (
    <PageScrollBody>
      <SettingKeywords value={value} setValue={setValue} />
    </PageScrollBody>
  );
}

export default BlacklistKeywords;
