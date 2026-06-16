import {Text} from '@mantine/core';
import {modals} from '@mantine/modals';
import React from 'react';
import {ExternalLinks} from '@/constants';
import formatMessage from '@/i18n/index';
import useAuthStore from '@/stores/auth';
import {executeOAuth2SignInAndSetCredentials} from '@/utils/auth';
import {isUserPro} from '@/utils/pro';
import styles from './Modal.module.css';

const DEFAULT_LOADING_TIMEOUT = 500;
const DEFAULT_SUCCESS_TIMEOUT = 1000;

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
    transitionProps: {transition: 'pop', duration: 100},
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
    transitionProps: {transition: 'pop', duration: 100},
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

export function openSignInModal(callback = () => {}, props = {}) {
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

export function openSubscriptionUpgradeModal(callback = () => {}, props = {}) {
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

  return openConfirmModal({
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
    ...props,
  });
}
