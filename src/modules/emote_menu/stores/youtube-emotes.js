import {emotesCategoryIds} from '../../../constants.js';
import Emote from '../../emotes/emote.js';
import Icons from '../components/Icons.jsx';

/* eslint-disable import/prefer-default-export */
export function loadYoutubeEmotes() {
  const provider = {
    id: `${emotesCategoryIds.YOUTUBE}`,
    displayName: 'Youtube',
    icon: Icons.UNLOCK,
  };

  // eslint-disable-next-line no-undef
  const emotes = ytInitialData.continuationContents.liveChatContinuation.emojis.map(
    (emote) =>
      new Emote({
        id: emote.emojiId,
        provider,
        channel: 'Youtube',
        code: emote.searchTerms[0],
        images: {
          '1x': emote.image.thumbnails[0].url,
          '2x': emote.image.thumbnails[1].url,
        },
        metadata: {
          locked: emote.isLocked,
        },
      })
  );

  return [{provider, emotes}];
}
