import React, {useCallback, use} from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import SettingKeywords from '@/modules/settings/components/SettingKeywords';
import {PageContext} from '@/modules/settings/contexts/PageContext';

function BlacklistKeywords() {
  const {setPage} = use(PageContext);
  const [value, setValue] = useStorageState(SettingIds.BLACKLIST_KEYWORDS);
  const handleBack = useCallback(() => setPage(PageTypes.SETTINGS), [setPage]);

  return (
    <PageScrollBody
      header={
        <PageHeader
          breadcrumbs={[
            {label: formatMessage({defaultMessage: 'Settings'}), onClick: handleBack},
            {label: formatMessage({defaultMessage: 'Blacklist Keywords'})},
          ]}
        />
      }>
      <SettingKeywords value={value} setValue={setValue} />
    </PageScrollBody>
  );
}

export default BlacklistKeywords;
