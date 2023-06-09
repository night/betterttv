/* eslint-disable import/prefer-default-export */
import sortBy from 'lodash.sortby';
import uniqBy from 'lodash.uniqby';
import {EmoteCategories, EmoteProviders} from '../../../constants.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import {getLiveChat} from '../../../utils/youtube.js';
import Emote from '../../emotes/emote.js';
import Icons from '../components/Icons.jsx';

const DEFAULT_CATEGORY_NAME = 'Unknown';

function getCategoryForChannelId(channelId, categoryName) {
  switch (channelId) {
    case 'UCkszU2WH9gy1mb0dV-11UJg':
    case 'UCzC5CNksIBaiT-NdMJjJNOQ':
      return {
        id: EmoteCategories.YOUTUBE_GLOBAL,
        provider: EmoteProviders.YOUTUBE,
        displayName: 'YouTube Global',
        icon: Icons.YOUTUBE,
      };
    default: {
      const currentChannel = getCurrentChannel();
      return {
        id: EmoteCategories.YOUTUBE_CHANNEL(channelId),
        provider: EmoteProviders.YOUTUBE,
        displayName: categoryName,
        icon:
          currentChannel?.id === channelId && currentChannel?.avatar != null
            ? Icons.IMAGE(currentChannel.avatar, categoryName)
            : Icons.UNLOCK,
      };
    }
  }
}

function isLocked(emoteId) {
  const liveChat = getLiveChat();
  const youtubeCustomEmojis = liveChat?.emojis;
  return youtubeCustomEmojis.find(({emojiId}) => emojiId === emoteId).isLocked;
}

export async function loadYouTubeEmotes() {
  const currentChannel = getCurrentChannel();
  if (currentChannel == null || currentChannel.provider !== 'youtube') {
    return [];
  }

  const liveChatContinuation = window.ytInitialData?.continuationContents?.liveChatContinuation;
  const liveChatRenderer = window.ytInitialData?.contents?.liveChatRenderer;
  const liveChat = getLiveChat() || liveChatContinuation || liveChatRenderer;
  const youtubeCustomEmojis = liveChat?.emojis;
  const youtubeEmojiCategories = liveChat?.actionPanel?.liveChatMessageInputRenderer?.pickers?.find(
    (picker) => picker.emojiPickerRenderer != null
  )?.emojiPickerRenderer?.categories;

  if (youtubeCustomEmojis == null) {
    return [];
  }

  const categoryNames = {};
  if (youtubeEmojiCategories != null) {
    for (const {emojiPickerCategoryRenderer, emojiPickerUpsellCategoryRenderer} of youtubeEmojiCategories) {
      const categoryRenderer = emojiPickerCategoryRenderer || emojiPickerUpsellCategoryRenderer;
      if (categoryRenderer == null) {
        continue;
      }
      categoryNames[categoryRenderer.categoryId] = categoryRenderer.title?.simpleText;
    }
  }

  const categoryEmojis = {};
  for (const emoji of youtubeCustomEmojis) {
    const channelId = emoji.emojiId.split('/')[0];
    let category = categoryEmojis[channelId];
    if (category == null) {
      category = [];
      categoryEmojis[channelId] = category;
    }
    category.push(emoji);
  }

  const tempCategories = {};
  for (const channelId of Object.keys(categoryEmojis)) {
    const categoryName = categoryNames[channelId] || DEFAULT_CATEGORY_NAME;
    const category = getCategoryForChannelId(channelId, categoryName);
    const categoryEmotes = categoryEmojis[channelId].map(
      ({emojiId: emoteId, image, shortcuts}) =>
        new Emote({
          id: emoteId,
          category,
          channel: categoryName,
          code: shortcuts.find((shortcut) => !shortcut.startsWith(':_')) || shortcuts[0],
          metadata: {
            isLocked: isLocked.bind(this, emoteId),
          },
          images: {
            '1x': (image.thumbnails[1] || image.thumbnails[0]).url,
          },
        })
    );

    tempCategories[category.id] = {
      category,
      // twitch seperates emotes by tier, so we merge them into one set
      // note: sortBy accepts booleans, not necessary to convert to int
      emotes: sortBy(
        uniqBy([...(tempCategories[category.id]?.emotes || []), ...categoryEmotes], 'id'),
        ({code, metadata}) => [metadata.isLocked(), code.toLowerCase()]
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
