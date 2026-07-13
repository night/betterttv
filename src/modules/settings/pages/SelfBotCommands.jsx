import React, {useCallback, use} from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import SettingSelfBotCommands from '@/modules/settings/components/SettingSelfBotCommands';
import {PageContext} from '@/modules/settings/contexts/PageContext';

function SelfBotCommands() {
  const {setPage} = use(PageContext);
  const [value, setValue] = useStorageState(SettingIds.SELF_BOT_COMMANDS_LIST);
  const handleBack = useCallback(() => setPage(PageTypes.SETTINGS), [setPage]);

  return (
    <PageScrollBody
      header={
        <PageHeader
          breadcrumbs={[
            {label: formatMessage({defaultMessage: 'Settings'}), onClick: handleBack},
            {label: formatMessage({defaultMessage: 'Self Bot Commands'})},
          ]}
        />
      }>
      <SettingSelfBotCommands value={value} setValue={setValue} />
    </PageScrollBody>
  );
}

export default SelfBotCommands;
