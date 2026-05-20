import React from 'react';
import useStorageState from '../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../constants.js';
import formatMessage from '../../../i18n/index.js';
import SettingTextReplacements from '../components/SettingTextReplacements.jsx';
import PageScrollBody from '../components/PageScrollBody.jsx';

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
