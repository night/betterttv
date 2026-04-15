import {useCallback, useMemo} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {openConfirmModal} from '../utils/modal.js';
import {executeOAuth2SignInAndSetCredentials} from '../../utils/auth.js';
import formatMessage from '../../i18n/index.js';
import useAuthStore from '../../stores/auth.js';
import {ExternalLinks} from '../../constants.js';
import {isUserPro} from '../../utils/pro.js';

function openSubscriptionSignInModal(callback = () => {}) {
  const controller = new AbortController();
  const {signal} = controller;

  let unsubscribeUserUpdated = null;

  function onConfirm() {
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('Aborted')));

      function handleUserUpdated() {
        unsubscribeUserUpdated?.();
        unsubscribeUserUpdated = null;

        const {user: currentUser} = useAuthStore.getState();
        currentUser != null ? resolve() : reject(new Error('no user found'));
      }

      unsubscribeUserUpdated = useAuthStore.subscribe(
        (state) => state.user,
        () => handleUserUpdated()
      );

      executeOAuth2SignInAndSetCredentials({signal}).catch(reject);
    });
  }

  openConfirmModal({
    title: formatMessage({defaultMessage: 'Sign In Required'}),
    description: formatMessage({defaultMessage: 'You must be signed in to use this feature.'}),
    onConfirm: () => onConfirm().then(callback),
    onClose: () => {
      controller.abort();
      unsubscribeUserUpdated?.();
    },
    labels: {
      confirm: formatMessage({defaultMessage: 'Sign In'}),
      cancel: formatMessage({defaultMessage: 'Cancel'}),
    },
  });
}

function openSubscriptionUpgradeModal(callback = () => {}) {
  const controller = new AbortController();
  const {signal} = controller;

  let unsubscribeUserUpdated = null;

  function onConfirm() {
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('Aborted')));

      // TODO: Make this open in a popup
      window.open(ExternalLinks.PRO, '_blank');

      function handleUserUpdated() {
        unsubscribeUserUpdated?.();
        unsubscribeUserUpdated = null;

        const {user: currentUser} = useAuthStore.getState();
        isUserPro(currentUser) ? resolve() : reject(new Error('user is not pro'));
      }

      unsubscribeUserUpdated = useAuthStore.subscribe(
        (state) => state.user,
        () => handleUserUpdated()
      );
    });
  }

  openConfirmModal({
    title: formatMessage({defaultMessage: 'Subscription Required'}),
    description: formatMessage({defaultMessage: 'You must be a Pro subscriber to use this feature.'}),
    onConfirm: () => onConfirm().then(callback),
    onClose: () => {
      controller.abort();
      unsubscribeUserUpdated?.();
    },
    labels: {
      confirm: formatMessage({defaultMessage: 'Upgrade'}),
      cancel: formatMessage({defaultMessage: 'Cancel'}),
    },
  });
}

function useProRequiredState(props = {}) {
  const {value, defaultValue} = props;
  const currentUser = useAuthStore(useShallow((state) => state.user));

  const updateValue = useCallback(
    (newValue) => {
      const {user} = useAuthStore.getState();

      if (user == null) {
        openSubscriptionSignInModal(() => updateValue(newValue));
        return;
      }

      if (!isUserPro(user)) {
        openSubscriptionUpgradeModal(() => updateValue(newValue));
        return;
      }

      props.setValue?.(newValue);
    },
    [props.setValue]
  );

  const normalizedValue = useMemo(() => {
    if (!isUserPro(currentUser)) {
      return defaultValue;
    }

    return props.value;
  }, [currentUser, defaultValue, value]);

  return [normalizedValue, updateValue];
}

export default useProRequiredState;
