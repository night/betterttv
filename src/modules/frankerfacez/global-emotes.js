import api from '../../utils/api';
import watcher from '../../watcher';
import settings from '../../settings';

import AbstractEmotes from '../emotes/abstract-emotes';
import Emote from '../emotes/emote';

const provider = {
    id: 'ffz-global',
    displayName: 'FrankerFaceZ Global Emotes'
};

class GlobalEmotes extends AbstractEmotes {
    constructor() {
        super();

        settings.add({
            id: 'ffzEmotes',
            name: 'FrankerFaceZ Emotes',
            defaultValue: true,
            description: 'Enables emotes from that other extension people sometimes use'
        });

        settings.on('changed.ffzEmotes', () => this.updateGlobalEmotes());

        this.updateGlobalEmotes();
    }

    get provider() {
        return provider;
    }

    updateGlobalEmotes() {
        this.emotes.clear();

        if (!settings.get('ffzEmotes')) return;

        api
            .get('cached/frankerfacez/emotes/global')
            .then(emotes =>
                emotes.forEach(({id, user, code, images, imageType}) => {
                    this.emotes.set(code, new Emote({
                        id,
                        provider: this.provider,
                        channel: user,
                        code,
                        images,
                        imageType
                    }));
                })
            )
            .then(() => watcher.emit('emotes.updated'));
    }
}

export default new GlobalEmotes();
