import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import SettingTextReplacements from '@/modules/settings/components/SettingTextReplacements';

function TextReplacements() {
  const [value, setValue] = useStorageState(SettingIds.TEXT_REPLACEMENTS);

  return (
    <PageScrollBody>
      <SettingTextReplacements
        value={value}
        setValue={setValue}
        title={formatMessage({defaultMessage: 'Text Replacements'})}
      />
    </PageScrollBody>
  );
}

export default TextReplacements;
