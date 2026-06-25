import {modals} from '@mantine/modals';
import React from 'react';
import {openModal} from '@/common/utils/modal';
import {EmoteProviders} from '@/constants';
import cdn from '@/utils/cdn';
import EmoteModalContent from './EmoteModalContent';
import styles from './EmoteModal.module.css';

const PROVIDER_LOGOS = {
  [EmoteProviders.BETTERTTV]: cdn.url('/assets/logos/bttv_logo.png'),
  [EmoteProviders.FRANKERFACEZ]: cdn.url('/assets/logos/ffz_logo.png'),
  [EmoteProviders.SEVENTV]: cdn.url('/assets/logos/7tv_logo.png'),
};

function emoteTitle(emote) {
  const providerLogo = PROVIDER_LOGOS[emote.category?.provider];
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
  const modalId = openModal({
    title: emoteTitle(emote),
    description: <EmoteModalContent emote={emote} onClose={() => modals.close(modalId)} />,
  });
  return modalId;
}
