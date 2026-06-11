import React, {useCallback, useContext} from 'react';
import useStorageState from '../../../common/hooks/StorageState.jsx';
import {DEFAULT_HIGHLIGHT_COLOR, PageTypes, SettingIds} from '../../../constants.js';
import formatMessage from '../../../i18n/index.js';
import SettingKeywords from '../components/SettingKeywords.jsx';
import PageScrollBody from '../components/PageScrollBody.jsx';
import PageHeader from '../components/PageHeader.jsx';
import {PageContext} from '../contexts/PageContext.jsx';

function HighlightKeywords() {
  const {setPage} = useContext(PageContext);
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
