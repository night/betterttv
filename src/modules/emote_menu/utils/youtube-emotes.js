/* eslint-disable import/prefer-default-export */
import uniqBy from 'lodash.uniqby';
import sortBy from 'lodash.sortby';
import Emote from '../../emotes/emote.js';
import Icons from '../components/Icons.jsx';
import {EmoteCategories, EmoteProviders} from '../../../constants.js';
import {getCurrentChannel} from '../../../utils/channel.js';

function getCategoryForChannelId(channelId) {
  switch (channelId) {
    case 'UCkszU2WH9gy1mb0dV-11UJg':
    case 'UCzC5CNksIBaiT-NdMJjJNOQ':
      return {
        id: EmoteCategories.YOUTUBE_GLOBAL,
        provider: EmoteProviders.YOUTUBE,
        displayName: 'YouTube Global',
        icon: Icons.TWITCH, // TODO: ???
      };
    default:
      return {
        id: EmoteCategories.YOUTUBE_CHANNEL(channelId),
        provider: EmoteProviders.YOUTUBE,
        displayName: 'Unknown Channel', // TODO: ???
        icon: Icons.TWITCH, // TODO: ???
      };
  }
}

export async function loadYouTubeEmotes() {
  const currentChannel = getCurrentChannel();
  if (currentChannel == null || currentChannel.provider !== 'youtube') {
    return [];
  }

  const customEmotes = window.ytInitialData?.continuationContents?.liveChatContinuation?.emojis;
  if (customEmotes == null) {
    return [];
  }

  const categories = {};
  for (const emote of customEmotes) {
    // TODO: support locked emotes
    if (emote.isLocked) {
      continue;
    }
    const channelId = emote.emojiId.split('/')[0];
    let category = categories[channelId];
    if (category == null) {
      category = [];
      categories[channelId] = category;
    }
    category.push(emote);
  }

  const tempCategories = {};

  for (const channelId of Object.keys(categories)) {
    const category = getCategoryForChannelId(channelId);
    const categoryEmotes = categories[channelId].map(
      ({emojiId: emoteId, image, shortcuts}) =>
        new Emote({
          id: emoteId,
          category,
          channel: 'Unknown Channel', // TODO: ???
          code: shortcuts[0],
          images: {
            '1x': (image.thumbnails[1] || image.thumbnails[0]).url,
          },
        })
    );

    tempCategories[category.id] = {
      category,
      // twitch seperates emotes by tier, so we merge them into one set
      emotes: sortBy(uniqBy([...(tempCategories[category.id]?.emotes || []), ...categoryEmotes], 'id'), ({code}) =>
        code.toLowerCase()
      ),
    };
  }

  return sortBy(Object.values(tempCategories), [
    // sort current channel to the top of the categories
    ({category}) => (EmoteCategories.YOUTUBE_CHANNEL(currentChannel.id) === category.id ? -1 : 1),
    // do a final sort for alphabetical order
    ({category}) => category.displayName.toLowerCase(),
  ]);
}
