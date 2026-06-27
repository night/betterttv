import React, {useCallback, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import formatMessage from '@/i18n';
import {updateSubscriptionBadge} from '@/actions/account';
import useAuthStore from '@/stores/auth';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import SettingSwitch from './SettingSwitch';
import styles from './SubscriptionBadgeSetting.module.css';

function SubscriptionBadgeSetting() {
  const user = useAuthStore(useShallow((state) => state.user));
  const updateUser = useAuthStore((state) => state.updateUser);
  const [loading, setLoading] = useState(false);

  const handleSubscriptionBadgeChange = useCallback(
    async (badge) => {
      try {
        setLoading(true);
        await updateSubscriptionBadge(badge);
        updateUser({...user, subscriptionBadge: badge});
      } finally {
        setLoading(false);
      }
    },
    [user, updateUser]
  );

  const [badgeEnabled, setBadgeEnabled] = useProRequiredState({
    value: user?.subscriptionBadge === true,
    defaultValue: false,
    setValue: handleSubscriptionBadgeChange,
  });

  return (
    <SettingSwitch
      showProBadge
      name={
        <React.Fragment>
          {user?.subscriptionBadgeUrl != null ? (
            <img src={user.subscriptionBadgeUrl} className={styles.badge} alt="" />
          ) : null}
          {formatMessage({defaultMessage: 'Subscriber Badge'})}
        </React.Fragment>
      }
      description={formatMessage({
        defaultMessage: 'Show a BetterTTV Pro badge next to your name when you type in chat.',
      })}
      value={badgeEnabled}
      onChange={setBadgeEnabled}
      disabled={loading}
    />
  );
}

export default SubscriptionBadgeSetting;
