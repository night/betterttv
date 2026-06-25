import {modals} from '@mantine/modals';
import React from 'react';
import {openModal} from '@/common/utils/modal';
import {EmoteProviders} from '@/constants';
import cdn from '@/utils/cdn';
import EmoteModalRouter from './EmoteModalRouter';
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

export default function openEmoteModal(emote, restoreState = {}) {
  // a single modal hosts every page; pages are swapped with state (see EmoteModalRouter) so there is
  // no second modal opening/closing between them. The router updates the modal title per page.
  const detailTitle = emoteTitle(emote);
  // mirror the live page/title here so a reopen (after a sign-in/upgrade gate) lands on the same page
  let currentPage = restoreState.page ?? 'detail';
  let currentTitle = restoreState.title ?? detailTitle;

  // opens the sign-in/upgrade gate modal and, once that modal has finished closing, reopens this
  // emote modal on the page the user left off on — but only if they actually completed the gate
  // (signed in / upgraded), not if they dismissed it
  function openGateThenReopen(openGate) {
    let completed = false;
    const reopen = () => openEmoteModal(emote, {page: currentPage, title: currentTitle});
    openGate({onExitTransitionEnd: () => completed && reopen()}, () => (completed = true));
  }

  const modalId = openModal({
    title: currentTitle,
    description: (
      <EmoteModalRouter
        emote={emote}
        detailTitle={detailTitle}
        initialPage={currentPage}
        onPageChange={(page) => (currentPage = page)}
        onClose={(openGate) => {
          // a plain onClose()/onClick(event) just closes. When given a gate opener (sign-in /
          // upgrade), open it once this modal's close transition has finished, so they don't overlap
          if (typeof openGate === 'function') {
            modals.updateModal({modalId, onExitTransitionEnd: () => openGateThenReopen(openGate)});
          }
          modals.close(modalId);
        }}
        onSetTitle={(title) => {
          currentTitle = title;
          modals.updateModal({modalId, title});
        }}
      />
    ),
  });
  return modalId;
}
