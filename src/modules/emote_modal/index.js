import styles from './EmoteModal.module.css';
import openEmoteModal from './openEmoteModal';

export function bindEmoteModal(element, {emote}) {
  function handleClick(event) {
    // keep the click from reaching twitch's own emote/viewer card handlers
    event.preventDefault();
    event.stopPropagation();

    openEmoteModal(emote);
  }

  element.classList.add(styles.clickable);
  element.addEventListener('click', handleClick);
}
