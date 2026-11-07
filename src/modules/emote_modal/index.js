import clickableStyles from '@/common/styles/Clickable.module.css';
import openEmoteModal from './openEmoteModal';

export function bindEmoteModal(element, {emote}) {
  function handleClick(event) {
    // keep the click from reaching twitch's own emote/viewer card handlers
    event.preventDefault();
    event.stopPropagation();

    openEmoteModal(emote);
  }

  element.classList.add(clickableStyles.clickable);
  element.addEventListener('click', handleClick);
}
