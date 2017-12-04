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

    providerClass() {
        return html.escape(this.provider.id);
    }

    idClass() {
        return `${html.escape(this.provider.id)}-emo-${html.escape(this.id)}`;
    }

    balloon() {
        return `
            ${html.escape(this.code)}<br>
            ${this.channel ? `Channel: ${html.escape(this.channel.displayName || this.channel.name)}<br>` : ''}
            ${html.escape(this.provider.displayName)}
        `;
    }
};
