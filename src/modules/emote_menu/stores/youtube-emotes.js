import {emotesCategoryIds} from '../../../constants.js';
import Emote from '../../emotes/emote.js';
import Icons from '../components/Icons.jsx';

const provider = {
  id: `${emotesCategoryIds.YOUTUBE}`,
  displayName: 'Youtube',
  icon: Icons.YOUTUBE,
};

function findShortestEmoteCode(arr) {
  return arr.reduce((a, b) => (a.length <= b.length ? a : b));
}

/* eslint-disable import/prefer-default-export */
export function loadYoutubeEmotes() {
  // eslint-disable-next-line no-undef
  const emotes = ytInitialData.continuationContents.liveChatContinuation.emojis;

  const providerEmotes = emotes.map(
    (emote) =>
      new Emote({
        id: `${emotesCategoryIds.YOUTUBE}-${emote.emojiId}`,
        provider,
        channel: 'Youtube',
        code: findShortestEmoteCode(emote.searchTerms),
        images: {
          '1x': emote.image.thumbnails[0].url,
          '2x': emote.image.thumbnails[1].url,
        },
        metadata: {
          locked: emote.isLocked,
        },
      })
  );

  return [
    {
      provider,
      emotes: providerEmotes,
    },
  ];
}
