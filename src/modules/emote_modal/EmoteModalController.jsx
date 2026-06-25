import {useCallback, useEffect} from 'react';
import openEmoteModal from './openEmoteModal';

export const EMOTE_MODAL_MARKER_ATTRIBUTE = 'data-bttv-emote-modal';

function getEmoteModalElement(target) {
  if (target == null || !(target instanceof Element)) {
    return null;
  }

  return target.closest(`[${EMOTE_MODAL_MARKER_ATTRIBUTE}]`);
}

export default function EmoteModalController() {
  const handleClick = useCallback((event) => {
    const element = getEmoteModalElement(event.target);
    if (element == null) {
      return;
    }

    const config = element.__bttvEmoteModal;
    if (config == null || config.emote == null) {
      return;
    }

    // stop the click from reaching Twitch's own emote/viewer card handlers
    event.preventDefault();
    event.stopPropagation();

    openEmoteModal(config.emote);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [handleClick]);

  return null;
}
