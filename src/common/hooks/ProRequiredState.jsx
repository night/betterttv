import {useCallback, useMemo} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {openSignInModal, openSubscriptionUpgradeModal} from '@/common/utils/modal';
import useAuthStore from '@/stores/auth';
import {isUserPro} from '@/utils/pro';

function useProRequiredState(props = {}) {
  const {value, defaultValue} = props;
  const currentUser = useAuthStore(useShallow((state) => state.user));

  const updateValue = useCallback(
    (newValue) => {
      const {user} = useAuthStore.getState();

      if (user == null) {
        openSignInModal({}, () => updateValue(newValue));
        return;
      }

      if (!isUserPro(user)) {
        openSubscriptionUpgradeModal({}, () => updateValue(newValue));
        return;
      }

      props.setValue?.(newValue);
    },
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- intentionally depends on props.setValue only
    [props.setValue]
  );

  const normalizedValue = useMemo(() => {
    if (!isUserPro(currentUser)) {
      return defaultValue;
    }

    return props.value;
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- value is props.value destructured at the top
  }, [currentUser, defaultValue, value]);

  return [normalizedValue, updateValue];
}

export default useProRequiredState;
