import {useCallback, useEffect} from 'react';
import {useShallow} from 'zustand/react/shallow';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import useFeatureEligibilityStore, {fetchEligibility} from '@/stores/feature-eligibility';
import {getCurrentChannel} from '@/utils/channel';
import useDebouncedRemoteState from './DebouncedRemoteState';

export const NONE = 'none';

// The shared effect-setting flow: an optimistic debounced save plus the sign-in → eligibility → upgrade ladder.
export default function useUsernameEffectSetting({
  userField,
  saveEffect,
  isEligible,
  openSignInModal,
  openUpgradeModal,
}) {
  const {user, updateUser} = useAuthStore(useShallow((state) => ({user: state.user, updateUser: state.updateUser})));

  useEffect(() => {
    fetchEligibility();
  }, [user]);

  const [value, setValue] = useDebouncedRemoteState({
    value: user?.[userField] ?? NONE,
    onSave: async (newValue, {signal}) => {
      const effect = newValue === NONE ? null : newValue;
      await saveEffect(effect, {signal});
      updateUser({...useAuthStore.getState().user, [userField]: effect});

      const currentChannel = getCurrentChannel();
      if (currentChannel == null) {
        return;
      }

      socketClient.broadcastMe(currentChannel.provider, currentChannel.id);
    },
  });

  const handleChange = useCallback(
    async (newValue) => {
      const {user: currentAuthUser} = useAuthStore.getState();

      if (newValue === NONE && currentAuthUser == null) {
        return;
      }

      if (newValue === NONE) {
        setValue(newValue);
        return;
      }

      if (currentAuthUser == null) {
        openSignInModal(newValue, () => handleChange(newValue));
        return;
      }

      await fetchEligibility();

      const {userId, eligibility} = useFeatureEligibilityStore.getState();
      if (userId !== currentAuthUser.id || !isEligible(eligibility, newValue)) {
        openUpgradeModal(newValue, () => handleChange(newValue));
        return;
      }

      setValue(newValue);
    },
    [setValue, isEligible, openSignInModal, openUpgradeModal]
  );

  return [value, handleChange];
}
