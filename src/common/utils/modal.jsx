import {Text} from '@mantine/core';
import {modals} from '@mantine/modals';
import {ChevronRight} from 'lucide-react';
import React from 'react';
import DeviceCodeSignIn from '@/common/components/DeviceCodeSignIn';
import {ExternalLinks} from '@/constants';
import formatMessage from '@/i18n/index';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import {executeOAuth2SignInAndSetCredentials} from '@/utils/auth';
import {PopupBlockedError} from '@/utils/oauth';
import {isUserPro} from '@/utils/pro';
import {canOpenPopup} from '@/utils/window';
import styles from './Modal.module.css';

// forms and lists; rem so it isn't scaled, on Twitch's 10px root
export const WIDE_MODAL_SIZE = '48rem';

const DEFAULT_LOADING_TIMEOUT = 500;
const DEFAULT_SUCCESS_TIMEOUT = 1000;
const MODAL_TRANSITION_DURATION = 100;

const DEFAULT_CONFIRM_PROPS = {
  size: 'lg',
  variant: 'elevated',
  color: 'contrast',
};

function updateModalConfirmStatus(modalId, {status, confirmProps}) {
  let type = 'loaderIconIndicator';

  if (status === 'success') {
    type = 'loaderIconSuccess';
  } else if (status === 'error') {
    type = 'loaderIconError';
  }

  modals.updateModal({modalId, confirmProps: {loaderProps: {type}, loading: true, ...confirmProps}});
}

export function openConfirmModal({title, description, onConfirm, ...props}) {
  const confirmProps = props.confirmProps ?? DEFAULT_CONFIRM_PROPS;
  const modalId = modals.openConfirmModal({
    title,
    centered: true,
    closeButtonProps: {size: 'xl', radius: 'md'},
    transitionProps: {transition: 'pop', duration: MODAL_TRANSITION_DURATION},
    radius: 'lg',
    size: 'lg',
    withinPortal: false,
    children:
      typeof description !== 'string' ? (
        description
      ) : (
        <Text size="lg" className={styles.modalDescription}>
          {description}
        </Text>
      ),
    classNames: {
      content: styles.modalContent,
      body: styles.modalBody,
      header: styles.modalHeader,
      title: styles.modalTitle,
    },
    groupProps: {
      className: styles.modalGroup,
    },
    labels: {
      confirm: formatMessage({defaultMessage: 'Confirm'}),
      cancel: formatMessage({defaultMessage: 'Cancel'}),
    },
    cancelProps: {size: 'lg', variant: 'elevated'},
    confirmProps,
    ...props,
    closeOnConfirm: false,
    onConfirm: async () => {
      const loadingTimeout = setTimeout(
        () => updateModalConfirmStatus(modalId, {status: 'loading', confirmProps}),
        DEFAULT_LOADING_TIMEOUT
      );

      try {
        await onConfirm();
        updateModalConfirmStatus(modalId, {status: 'success', confirmProps});
      } catch (error) {
        updateModalConfirmStatus(modalId, {status: 'error', confirmProps});
      }

      clearTimeout(loadingTimeout);
      setTimeout(() => modals.close(modalId), DEFAULT_SUCCESS_TIMEOUT);
    },
  });
}

export function openModal({title, description, ...props}) {
  return modals.open({
    title,
    centered: true,
    closeButtonProps: {size: 'xl', radius: 'md'},
    transitionProps: {transition: 'pop', duration: MODAL_TRANSITION_DURATION},
    radius: 'lg',
    size: 'lg',
    withinPortal: false,
    children:
      typeof description !== 'string' ? (
        description
      ) : (
        <Text size="lg" className={styles.modalDescription}>
          {description}
        </Text>
      ),
    classNames: {
      content: styles.modalContent,
      body: styles.modalBody,
      header: styles.modalHeader,
      title: styles.modalTitle,
    },
    ...props,
  });
}

function openDeviceCodeSignInModal({signal} = {}) {
  return new Promise((resolve, reject) => {
    let signedIn = false;

    function handleCancel() {
      modals.close(modalId);
    }

    function handleSignIn() {
      signedIn = true;
      modals.close(modalId);
    }

    function handleClose() {
      signal?.removeEventListener('abort', handleCancel);
      signedIn ? resolve() : reject(new Error('Sign in cancelled'));
    }

    const modalId = openModal({
      title: formatMessage({defaultMessage: 'Sign in to BetterTTV'}),
      description: <DeviceCodeSignIn onSignIn={handleSignIn} onCancel={handleCancel} />,
      onClose: handleClose,
    });

    signal?.addEventListener('abort', handleCancel, {once: true});
  });
}

export async function executeSignIn({signal} = {}) {
  if (!canOpenPopup()) {
    return openDeviceCodeSignInModal({signal});
  }

  try {
    return await executeOAuth2SignInAndSetCredentials({signal});
  } catch (error) {
    if (!(error instanceof PopupBlockedError)) {
      throw error;
    }

    return openDeviceCodeSignInModal({signal});
  }
}

export function openSignInModal(props = {}, callback = () => {}) {
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

      executeSignIn({signal}).catch(reject);
    });
  }

  return openConfirmModal({
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
    ...props,
  });
}

export function openSubscriptionUpgradeModal(props = {}, callback = () => {}) {
  const controller = new AbortController();
  const {signal} = controller;

  let unsubscribeUserUpdated = null;

  socketClient.ensureAuthentication();

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

  return openConfirmModal({
    title: formatMessage({defaultMessage: 'Subscription Required'}),
    description: formatMessage({defaultMessage: 'You must be a Pro subscriber to use this feature.'}),
    onConfirm: () => onConfirm().then(callback),
    onClose: () => {
      controller.abort();
      unsubscribeUserUpdated?.();
    },
    labels: {
      confirm: formatMessage({defaultMessage: 'Subscribe'}),
      cancel: formatMessage({defaultMessage: 'Cancel'}),
    },
    ...props,
    confirmProps: {...DEFAULT_CONFIRM_PROPS, ...props.confirmProps, rightSection: <ChevronRight size={16} />},
  });
}
