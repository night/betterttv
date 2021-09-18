import TwitchEmoteMenu from './twitch/EmoteMenu.jsx';
import YoutubeEmoteMenu from './youtube/EmoteMenu.jsx';

let EmoteMenu = null;

switch (window.location.hostname) {
  case 'www.youtube.com':
    EmoteMenu = YoutubeEmoteMenu;
    break;
  default:
  case 'www.twitch.tv':
    EmoteMenu = TwitchEmoteMenu;
    break;
}

export default new EmoteMenu();
