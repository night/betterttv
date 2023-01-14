import html from '../../utils/html.js';
import {createSrc, createSrcSet} from '../../utils/image.js';
import formatMessage from '../../i18n/index.js';
import settings from '../../settings.js';
import {EmoteCategories, EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';

export default class Emote {
  constructor({id, category, channel, code, images, animated = null, restrictionCallback = null, metadata = null}) {
    this.id = id;
    this.category = category;
    this.channel = channel;
    this.code = code;
    this.restrictionCallback = restrictionCallback;
    this.images = images;
    this.animated = animated;
    this.metadata = metadata;
  }

  isUsable(channel, user) {
    return this.restrictionCallback ? this.restrictionCallback(channel, user) : true;
  }

  get canonicalId() {
    const {provider} = this.category;
    if (provider == null) {
      throw new Error('cannot create canonical id from null provider');
    }
    return `${provider}-${this.id}`;
  }

  toHTML(modifier, className) {
    const categoryClass = html.escape(this.category.id);
    const idClass = `${html.escape(this.category.id)}-emo-${html.escape(this.id)}`;
    const channelName = this.channel && (this.channel.displayName || this.channel.name);

    const balloon = `
      ${html.escape(this.code)}<br>
      ${
        channelName
          ? `${html.escape(formatMessage({defaultMessage: 'Channel: {channelName}'}, {channelName}))}<br>`
          : ''
      }
      ${html.escape(this.category.displayName)}
    `;

    let animatedSources = '';
    const emotesSettingValue = settings.get(SettingIds.EMOTES);
    const showAnimatedEmotes =
      this.category.id === EmoteCategories.BETTERTTV_PERSONAL
        ? hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_PERSONAL_EMOTES)
        : hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_EMOTES);
    const shouldRenderStatic = this.animated && !showAnimatedEmotes;
    if (shouldRenderStatic) {
      animatedSources = ` data-bttv-animated-src="${html.escape(
        createSrc(this.images)
      )}" data-bttv-animated-srcset="${html.escape(createSrcSet(this.images))}"`;
    }

    return `
      <div class="bttv-tooltip-wrapper bttv-emote ${categoryClass} ${idClass}${
      className != null ? ` ${className}` : ''
    }${shouldRenderStatic ? ' bttv-animated-static-emote' : ''}">
        <img src="${html.escape(createSrc(this.images, shouldRenderStatic))}" srcset="${html.escape(
      createSrcSet(this.images, shouldRenderStatic)
    )}" alt="${modifier ? `${html.escape(modifier)} ` : ''}${html.escape(
      this.code
    )}" class="chat-line__message--emote bttv-emote-image"${animatedSources} />
        <div class="bttv-tooltip bttv-tooltip--up bttv-tooltip--align-center">${balloon}</div>
      </div>
    `;
  }
}
