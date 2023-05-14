import formatMessage from '../../../i18n/index.js';
import commandStore, {PermissionLevels} from '../store.js';
import twitch from '../../../utils/twitch.js';

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
