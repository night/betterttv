import {modals} from '@mantine/modals';
import React from 'react';
import {openModal} from '@/common/utils/modal';
import useAuthStore from '@/stores/auth';
import {EmoteProviderMetadata} from '@/utils/emote';
import styles from './EmoteModal.module.css';
import EmoteModalContent from './EmoteModalContent';
import {fetchAvailability, resetAdd} from './store';
import {canAddEmote} from './utils';

function emoteTitle(emote) {
  const providerLogo = EmoteProviderMetadata[emote.category?.provider]?.logoUrl;
  return (
    <span className={styles.title}>
      {providerLogo != null ? (
        <img className={styles.titleLogo} src={providerLogo} alt={emote.category?.displayName} />
      ) : null}
      {emote.code}
    </span>
  );
}

export default function openEmoteModal(emote) {
  resetAdd();

  const {user} = useAuthStore.getState();
  if (canAddEmote(emote) && user != null) {
    fetchAvailability(emote.id, user.id);
  }

  function handleClose() {
    modals.close(modalId);
  }

  const modalId = openModal({
    title: emoteTitle(emote),
    description: <EmoteModalContent emote={emote} onClose={handleClose} />,
  });
  return modalId;
}
