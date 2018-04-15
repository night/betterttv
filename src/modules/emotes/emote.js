const html = require('../../utils/html');

module.exports = class Emote {
    constructor({id, provider, channel, code, images, imageType = 'png', restrictionCallback = null}) {
        this.id = id;
        this.provider = provider;
        this.channel = channel;
        this.code = code;
        this.restrictionCallback = restrictionCallback;
        this.images = images;
        this.imageType = imageType;
    }

    isUsable(channel, user) {
        return this.restrictionCallback ? this.restrictionCallback(channel, user) : true;
    }

    toHTML() {
        const srcset = [];
        if (this.images['2x']) {
            srcset.push(`${html.escape(this.images['2x'])} 2x`);
        }
        if (this.images['4x']) {
            srcset.push(`${html.escape(this.images['4x'])} 4x`);
        }

        const providerClass = html.escape(this.provider.id);
        const idClass = `${html.escape(this.provider.id)}-emo-${html.escape(this.id)}`;

        const balloon = `
            ${html.escape(this.code)}<br>
            ${this.channel ? `Channel: ${html.escape(this.channel.displayName || this.channel.name)}<br>` : ''}
            ${html.escape(this.provider.displayName)}
        `;

        return `
            <div class="bttv-emote-tooltip-wrapper bttv-emote ${providerClass} ${idClass}">
                <img src="${html.escape(this.images['1x'])}" srcset="${srcset.join(', ')}" alt="${html.escape(this.code)}" class="chat-line__message--emote">
                <div class="bttv-emote-tooltip bttv-emote-tooltip--up bttv-emote-tooltip--align-center">${balloon}</div>
            </div>
        `;
    }
};
