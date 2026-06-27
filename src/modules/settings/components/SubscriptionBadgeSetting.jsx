import React from 'react';
import {useShallow} from 'zustand/react/shallow';
import formatMessage from '@/i18n';
import {updateSubscriptionBadge} from '@/actions/account';
import useAuthStore from '@/stores/auth';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import useDebouncedRemoteState from '@/common/hooks/DebouncedRemoteState';
import SettingSwitch from './SettingSwitch';
import styles from './SubscriptionBadgeSetting.module.css';

function SubscriptionBadgeSetting() {
  const {user, updateUser} = useAuthStore(useShallow((state) => ({user: state.user, updateUser: state.updateUser})));

  const [badge, setBadge] = useDebouncedRemoteState({
    value: user?.subscriptionBadge === true,
    onSave: async (value, {signal}) => {
      await updateSubscriptionBadge(value, {signal});
      updateUser({...useAuthStore.getState().user, subscriptionBadge: value});
    },
  });

  const [badgeEnabled, setBadgeEnabled] = useProRequiredState({
    value: badge,
    defaultValue: false,
    setValue: setBadge,
  });

  return (
    <SettingSwitch
      showProBadge
      name={
        <React.Fragment>
          {user?.subscriptionBadgeUrl != null ? (
            <img
              src={user.subscriptionBadgeUrl}
              className={styles.badge}
              alt={formatMessage({defaultMessage: 'BetterTTV Pro Badge'})}
            />
          ) : null}
          {formatMessage({defaultMessage: 'Subscriber Badge'})}
        </React.Fragment>
      }
      description={formatMessage({
        defaultMessage: 'Show a BetterTTV Pro badge next to your name when you type in chat.',
      })}
      value={badgeEnabled}
      onChange={setBadgeEnabled}
    />
  );
}

export default SubscriptionBadgeSetting;
