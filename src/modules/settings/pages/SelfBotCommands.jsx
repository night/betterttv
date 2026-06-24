import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import SettingSelfBotCommands from '@/modules/settings/components/SettingSelfBotCommands';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';

function SelfBotCommands() {
  const [value, setValue] = useStorageState(SettingIds.SELF_BOT_COMMANDS_LIST);

  return (
    <PageScrollBody>
      <SettingSelfBotCommands value={value} setValue={setValue} />
    </PageScrollBody>
  );
}

export default SelfBotCommands;
