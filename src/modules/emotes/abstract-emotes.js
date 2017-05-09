module.exports = class AbstractEmotes {
    constructor() {
        this.emotes = new Map();

        if (this.provider === undefined) {
            throw new TypeError('Must set "provider" attribute');
        }
    }

    getEmotes() {
        return [...this.emotes.values()];
    }

    getEligibleEmote(code) {
        return this.emotes.get(code);
    }
};
