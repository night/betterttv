import twitchApi from '../../../utils/twitch-api.js';
import Emote from '../../emotes/emote.js';
import Icons from '../components/Icons.jsx';
import debug from '../../../utils/debug.js';

const EMOTE_SET_QUERY = `
		query UserEmotes {
			currentUser {
				emoteSets {
					emotes {
						id,
						token
					},
					id,
					owner {
            id,
						displayName
					}
				}
			}
		}
	`;

const TWITCH_EMOTE_CDN = (id, size) => `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/${size}`;

class TwitchEmotes {
  constructor() {
    this.sets = [];
    this.loadEmotes();
  }

  getSets() {
    return this.sets;
  }

  async loadEmotes() {
    try {
      const tempSets = {};
      const {data} = await twitchApi.graphqlQuery(EMOTE_SET_QUERY);

      for (const {id, owner, emotes: channelEmotes} of data.currentUser.emoteSets) {
        const displayName = owner?.displayName || 'Twitch';

        const provider = {
          id,
          displayName,
          icon: Icons.PEOPLE,
        };

        const emotes = channelEmotes.map(
          ({id: emoteId, token}) =>
            new Emote({
              id: emoteId,
              provider,
              channel: displayName,
              code: token,
              images: {
                '1x': TWITCH_EMOTE_CDN(emoteId, '1.0'),
                '2x': TWITCH_EMOTE_CDN(emoteId, '2.0'),
                '4x': TWITCH_EMOTE_CDN(emoteId, '3.0'),
              },
            })
        );

        // twitch seperates emotes by tier, so we merge them into one set
        // eslint-disable-next-line no-prototype-builtins
        if (tempSets.hasOwnProperty(owner.id)) {
          tempSets[owner.id].emotes = tempSets[owner.id].emotes.concat(emotes);
          continue;
        }

        tempSets[owner.id] = {provider, emotes};
      }

      this.sets = Object.values(tempSets);
    } catch (e) {
      debug.log('failed to load twitch emotes', e);
      this.sets = [];
    }
  }
}

export default new TwitchEmotes();
