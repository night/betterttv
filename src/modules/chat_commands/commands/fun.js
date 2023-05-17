import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import twitch from '../../../utils/twitch.js';
import styles from './fun.module.css';

commandStore.registerCommand({
  name: 'shrug',
  commandArgs: [{name: 'message', isRequired: false}],
  description: formatMessage({defaultMessage: 'Usage: "/shrug" - Appends your chat line with a shrug face'}),
  handler: (message) => twitch.sendChatMessage(`${message} ¯\\_(ツ)_/¯`),
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'squishy',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/squishy" - Pastes a copypasta about Squishy5'}),
  hidden: true,
  handler: () =>
    twitch.sendChatMessage(
      'notsquishY WHEN YOU NEED HIM notsquishY IN A JIFFY notsquishY USE THIS EMOTE notsquishY TO SUMMON SQUISHY notsquishY'
    ),
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'lurk',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/lurk" - Tells the chat you are lurking'}),
  handler: () => twitch.sendChatMessage('/me is now lurking'),
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'barrelroll',
  commandArgs: [],
  description: formatMessage({defaultMessage: 'Usage: "/barrelroll" - Rotates the entire page 360 degrees'}),
  hidden: true,
  handler: () => {
    const body = document.querySelector('body');
    body.classList.add(styles.barrelRoll);
    setTimeout(() => body.classList.remove(styles.barrelRoll), 2000);
  },
  permissionLevel: PermissionLevels.VIEWER,
});

commandStore.registerCommand({
  name: 'bttv',
  commandArgs: [],
  description: formatMessage({
    defaultMessage: 'Usage: "/bttv" - Yeah... but BTTV is like a third-party thing, and I don\'t know...',
  }),
  hidden: true,
  handler: () => twitch.sendChatMessage("Yeah... but BTTV is like a third-party thing, and I don't know... bttvNice"),
  permissionLevel: PermissionLevels.VIEWER,
});
