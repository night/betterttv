import {EmoteCategories, EmoteTypeFlags, SettingIds} from '../../constants.js';
import formatMessage from '../../i18n/index.js';
import settings from '../../settings.js';
import {getCanonicalEmoteId} from '../../utils/emote.js';
import {hasFlag} from '../../utils/flags.js';
import {createSrc, createSrcSet} from '../../utils/image.js';

export default class Emote {
  constructor({
    id,
    category,
    channel,
    code,
    images,
    animated = null,
    restrictionCallback = null,
    metadata = null,
    modifier,
  }) {
    this.id = id;
    this.category = category;
    this.channel = channel;
    this.code = code;
    this.restrictionCallback = restrictionCallback;
    this.images = images;
    this.animated = animated;
    this.metadata = metadata;
    this.modifier = modifier ?? false;
  }

  isUsable(channel, user) {
    return this.restrictionCallback ? this.restrictionCallback(channel, user) : true;
  }

  get canonicalId() {
    const {provider} = this.category;
    if (provider == null) {
      throw new Error('cannot create canonical id from null provider');
    }
    return getCanonicalEmoteId(this.id, provider);
  }

  render(prefixModifiers, suffixModifiers, classNames) {
    const categoryClass = this.category.id;
    const idClass = `${this.category.id}-emo-${this.id}`;
    const channelName = this.channel && (this.channel.displayName || this.channel.name);

    const emotesSettingValue = settings.get(SettingIds.EMOTES);
    const showAnimatedEmotes =
      this.category.id === EmoteCategories.BETTERTTV_PERSONAL
        ? hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_PERSONAL_EMOTES)
        : hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_EMOTES);
    const shouldRenderStatic = this.animated && !showAnimatedEmotes;

    const container = document.createElement('div');
    container.classList.add('bttv-tooltip-wrapper', 'bttv-emote', categoryClass, idClass);
    if (classNames != null && classNames.length > 0) {
      container.classList.add(...classNames);
    }
    if (shouldRenderStatic) {
      container.classList.add('bttv-animated-static-emote');
    }
    if (this.metadata?.isOverlay === true) {
      container.classList.add('bttv-emote-overlay');
    }

    const image = new Image();
    image.classList.add('chat-line__message--emote', 'bttv-emote-image');
    image.src = createSrc(this.images, shouldRenderStatic);
    image.srcset = createSrcSet(this.images, shouldRenderStatic);
    image.alt = `${prefixModifiers != null && prefixModifiers.length > 0 ? `${prefixModifiers.join(' ')} ` : ''}${
      this.code
    }${suffixModifiers != null && suffixModifiers.length > 0 ? ` ${suffixModifiers.join(' ')}` : ''}`;
    if (shouldRenderStatic) {
      image.__bttvStaticSrc = image.src;
      image.__bttvStaticSrcSet = image.srcset;
      image.__bttvAnimatedSrc = createSrc(this.images);
      image.__bttvAnimatedSrcSet = createSrcSet(this.images);
    }
    container.appendChild(image);

    const tooltip = document.createElement('div');
    tooltip.classList.add('bttv-tooltip', 'bttv-tooltip--up', 'bttv-tooltip--align-center');
    tooltip.textContent = `${this.code}\n${
      channelName ? `${formatMessage({defaultMessage: 'Channel: {channelName}'}, {channelName})}\n` : ''
    }${this.category.displayName}`;
    container.appendChild(tooltip);

    return container;
  }
}
