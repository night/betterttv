import React, {useCallback, use} from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import SettingTextReplacements from '@/modules/settings/components/SettingTextReplacements';
import {PageContext} from '@/modules/settings/contexts/PageContext';

function TextReplacements() {
  const {setPage} = use(PageContext);
  const [value, setValue] = useStorageState(SettingIds.TEXT_REPLACEMENTS);
  const handleBack = useCallback(() => setPage(PageTypes.SETTINGS), [setPage]);

  return (
    <PageScrollBody
      header={
        <PageHeader
          breadcrumbs={[
            {label: formatMessage({defaultMessage: 'Settings'}), onClick: handleBack},
            {label: formatMessage({defaultMessage: 'Text Replacements'})},
          ]}
        />
      }>
      <SettingTextReplacements
        value={value}
        setValue={setValue}
        title={formatMessage({defaultMessage: 'Text Replacements'})}
      />
    </PageScrollBody>
  );
}

export default TextReplacements;
