import React, {useCallback, use} from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {DEFAULT_HIGHLIGHT_COLOR, PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import SettingKeywords from '@/modules/settings/components/SettingKeywords';
import {PageContext} from '@/modules/settings/contexts/PageContext';

function HighlightKeywords() {
  const {setPage} = use(PageContext);
  const [value, setValue] = useStorageState(SettingIds.HIGHLIGHT_KEYWORDS);
  const handleBack = useCallback(() => setPage(PageTypes.SETTINGS), [setPage]);

  return (
    <PageScrollBody
      header={
        <PageHeader
          breadcrumbs={[
            {label: formatMessage({defaultMessage: 'Settings'}), onClick: handleBack},
            {label: formatMessage({defaultMessage: 'Highlight Keywords'})},
          ]}
        />
      }>
      <SettingKeywords value={value} setValue={setValue} colorColumn={{defaultValue: DEFAULT_HIGHLIGHT_COLOR}} />
    </PageScrollBody>
  );
}

export default HighlightKeywords;
