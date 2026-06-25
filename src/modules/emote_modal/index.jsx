import React from 'react';
import {ShadowDOMComponentIds} from '@/constants';
import shadowDOM from '@/modules/shadow_dom/index';
import EmoteModalController, {EMOTE_MODAL_MARKER_ATTRIBUTE} from './EmoteModalController';
import styles from './EmoteModal.module.css';

export function bindEmoteModal(element, {emote}) {
  element.__bttvEmoteModal = {emote};
  element.classList.add(styles.clickable);

  let emoteModalKey = element.getAttribute(EMOTE_MODAL_MARKER_ATTRIBUTE);

  if (emoteModalKey == null || emoteModalKey.length === 0) {
    emoteModalKey = crypto.randomUUID();
    element.setAttribute(EMOTE_MODAL_MARKER_ATTRIBUTE, emoteModalKey);
  }

  if (!shadowDOM.isMounted(ShadowDOMComponentIds.EMOTE_MODAL_CONTROLLER)) {
    shadowDOM.mount(ShadowDOMComponentIds.EMOTE_MODAL_CONTROLLER, <EmoteModalController />);
  }
}
