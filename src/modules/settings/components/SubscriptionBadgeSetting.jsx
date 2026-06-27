import React, {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import formatMessage from '@/i18n';
import {updateSubscriptionBadge} from '@/actions/account';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';
import SettingSwitch from './SettingSwitch';
import styles from './SubscriptionBadgeSetting.module.css';

function SubscriptionBadgeSetting() {
  const user = useAuthStore(useShallow((state) => state.user));
  const updateUser = useAuthStore((state) => state.updateUser);
  const [loading, setLoading] = useState(false);

  if (!isUserPro(user)) {
    return null;
  }

  async function toggleBadge(badge) {
    try {
      setLoading(true);
      await updateSubscriptionBadge(badge);
      updateUser({...user, subscriptionBadge: badge});
    } finally {
      setLoading(false);
    }
  }

  return (
    <SettingSwitch
      name={
        <React.Fragment>
          <img src={user.subscriptionBadgeUrl} className={styles.badge} alt="" />
          {formatMessage({defaultMessage: 'Subscriber Badge'})}
        </React.Fragment>
      }
      description={formatMessage({
        defaultMessage:
          'Show a BetterTTV Pro badge next to your name when you type in chat. The badge changes over time based on how many months you have been subscribed.',
      })}
      value={user.subscriptionBadge === true}
      onChange={toggleBadge}
      disabled={loading}
    />
  );
}

export default SubscriptionBadgeSetting;
