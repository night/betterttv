import React, {useCallback, useContext} from 'react';
import useStorageState from '../../../common/hooks/StorageState.jsx';
import {PageTypes, SettingIds} from '../../../constants.js';
import formatMessage from '../../../i18n/index.js';
import SettingKeywords from '../components/SettingKeywords.jsx';
import PageScrollBody from '../components/PageScrollBody.jsx';
import PageHeader from '../components/PageHeader.jsx';
import {PageContext} from '../contexts/PageContext.jsx';

function BlacklistKeywords() {
  const {setPage} = useContext(PageContext);
  const [value, setValue] = useStorageState(SettingIds.BLACKLIST_KEYWORDS);
  const handleBack = useCallback(() => setPage(PageTypes.SETTINGS), [setPage]);

  return (
    <PageScrollBody
      header={<PageHeader onBack={handleBack} leftContent={formatMessage({defaultMessage: 'Blacklist Keywords'})} />}>
      <SettingKeywords value={value} setValue={setValue} />
    </PageScrollBody>
  );
}

export default BlacklistKeywords;
