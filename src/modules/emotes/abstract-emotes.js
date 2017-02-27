module.exports = class AbstractEmotes {
    constructor() {
        this.emotes = new Map();

        if (this.provider === undefined) {
            throw new TypeError('Must set "provider" attribute');
        }
    }

    getEligibleEmote(code) {
        return this.emotes.get(code);
    }
};
