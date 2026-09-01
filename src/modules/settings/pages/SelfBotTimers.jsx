import React, {useCallback, useEffect, use} from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {PageTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import {repairSelfBotTimerEntry} from '@/modules/self_bot/timers';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import SettingSelfBotTimers from '@/modules/settings/components/SettingSelfBotTimers';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import settings from '@/settings';

function SelfBotTimers() {
  const {setPage} = use(PageContext);
  const [value, setValue] = useStorageState(SettingIds.SELF_BOT_TIMERS_LIST);
  const handleBack = useCallback(() => setPage(PageTypes.SETTINGS), [setPage]);

  // stored entries are untrusted (cloud backup restores arbitrary JSON); repair
  // them on open so the rows shown are the rows the scheduler actually runs
  useEffect(() => {
    const storedTimers = settings.get(SettingIds.SELF_BOT_TIMERS_LIST);
    if (storedTimers == null) {
      return;
    }

    let changed = false;
    const repairedTimers = {};

    for (const [id, timer] of Object.entries(storedTimers)) {
      const repairedTimer = repairSelfBotTimerEntry(id, timer);
      repairedTimers[id] = repairedTimer;

      if (repairedTimer !== timer) {
        changed = true;
      }
    }

    if (changed) {
      setValue(repairedTimers);
    }
  }, [setValue]);

  return (
    <PageScrollBody
      header={
        <PageHeader
          breadcrumbs={[
            {label: formatMessage({defaultMessage: 'Settings'}), onClick: handleBack},
            {label: formatMessage({defaultMessage: 'Self Bot Timers'})},
          ]}
        />
      }>
      <SettingSelfBotTimers value={value} setValue={setValue} />
    </PageScrollBody>
  );
}

export default SelfBotTimers;
