import {Text} from '@mantine/core';
import {modals} from '@mantine/modals';
import React from 'react';
import formatMessage from '../../i18n/index.js';
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
    zIndex: 10300,
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
    zIndex: 10300,
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
