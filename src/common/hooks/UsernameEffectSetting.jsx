import {useCallback, useEffect} from 'react';
import {useShallow} from 'zustand/react/shallow';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import useFeatureEligibilityStore, {fetchEligibility} from '@/stores/feature-eligibility';
import {setTriedLook, setUsernameLook} from '@/stores/username-looks';
import {getCurrentChannel} from '@/utils/channel';
import useDebouncedRemoteState from './DebouncedRemoteState';

export const NONE = 'none';

export default function useUsernameEffectSetting({
  userField,
  saveEffect,
  isEligible,
  openSignInModal,
  openUpgradeModal,
}) {
  const {user, updateUser} = useAuthStore(useShallow((state) => ({user: state.user, updateUser: state.updateUser})));
  const {userId: eligibilityUserId, eligibility} = useFeatureEligibilityStore(
    useShallow((state) => ({userId: state.userId, eligibility: state.eligibility}))
  );

  useEffect(() => {
    fetchEligibility();
  }, [user?.id]);

  const [value, setValue] = useDebouncedRemoteState({
    value: user?.[userField] ?? NONE,
    onSave: async (newValue, {signal, isStale}) => {
      const effect = newValue === NONE ? null : newValue;
      try {
        await saveEffect(effect, {signal});
        updateUser({...useAuthStore.getState().user, [userField]: effect});
      } finally {
        // a newer pick owns the look now, so a superseded save leaves it alone
        if (!isStale()) {
          setUsernameLook(userField, undefined);
        }
      }

      const currentChannel = getCurrentChannel();
      if (currentChannel == null) {
        return;
      }

      socketClient.broadcastMe(currentChannel.provider, currentChannel.id);
    },
  });

  const pick = useCallback(
    (newValue) => {
      setUsernameLook(userField, newValue === NONE ? null : newValue);
      setValue(newValue);
    },
    [setValue, userField]
  );

  const handleChange = useCallback(
    async (newValue) => {
      const {user: currentAuthUser} = useAuthStore.getState();

      if (newValue === NONE && currentAuthUser == null) {
        return;
      }

      if (newValue === NONE) {
        pick(newValue);
        return;
      }

      if (currentAuthUser == null) {
        openSignInModal(newValue, () => handleChange(newValue));
        return;
      }

      const isAllowed = () => {
        const {userId, eligibility} = useFeatureEligibilityStore.getState();
        return userId === currentAuthUser.id && isEligible(eligibility, newValue);
      };

      // eligibility is fetched on mount, so an allowed pick shows at once; a refusal waits for that
      // fetch, and the api stays the enforcer
      if (!isAllowed()) {
        await fetchEligibility();
      }

      if (!isAllowed()) {
        openUpgradeModal(newValue, () => handleChange(newValue));
        return;
      }

      pick(newValue);
    },
    [pick, isEligible, openSignInModal, openUpgradeModal]
  );

  const isLocked = useCallback(
    (effect) => eligibilityUserId !== user?.id || !isEligible(eligibility, effect),
    [eligibilityUserId, user?.id, isEligible, eligibility]
  );

  // a hovered card tries its value in the chat preview; leaving it passes undefined, which ends the try
  const handlePreview = useCallback(
    (newValue) => setTriedLook(userField, newValue === NONE ? null : newValue),
    [userField]
  );

  return [value, handleChange, isLocked, handlePreview];
}
