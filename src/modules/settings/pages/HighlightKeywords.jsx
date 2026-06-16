import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {DEFAULT_HIGHLIGHT_COLOR, SettingIds} from '@/constants';
import SettingKeywords from '@/modules/settings/components/SettingKeywords';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';

function HighlightKeywords() {
  const [value, setValue] = useStorageState(SettingIds.HIGHLIGHT_KEYWORDS);

  return (
    <PageScrollBody>
      <SettingKeywords value={value} setValue={setValue} colorColumn={{defaultValue: DEFAULT_HIGHLIGHT_COLOR}} />
    </PageScrollBody>
  );
}

export default HighlightKeywords;
